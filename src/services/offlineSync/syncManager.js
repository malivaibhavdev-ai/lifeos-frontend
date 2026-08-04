import { syncQueue } from './syncQueue';
import { getSyncHandler } from './syncHandlerRegistry';
import { resolveConflict } from './conflictResolution';
import { getIsOnline, initNetworkMonitor, subscribeNetworkStatus } from './networkMonitor';
import { useSyncStatusStore } from './syncStatusStore';
import { isDueForRetry } from './retryPolicy';

let isDraining = false;
let drainRequested = false;

async function refreshStatus() {
  const [pendingCount, deadOperations] = await Promise.all([syncQueue.count(), syncQueue.listFailed()]);
  useSyncStatusStore.getState().setPendingCount(pendingCount);
  useSyncStatusStore.getState().setDeadOperations(deadOperations);
}

// Drains the queue FIFO (oldest first) — one operation at a time, in order,
// rather than parallel. Ordering matters here: a habit's create must reach
// the server before its later update/log entries queued behind it, and
// running them out of order (or concurrently) risks the update racing
// ahead of the create and 404ing.
async function drainQueue() {
  if (isDraining) {
    drainRequested = true; // coalesce concurrent triggers into one more pass
    return;
  }
  isDraining = true;
  useSyncStatusStore.getState().setIsSyncing(true);

  try {
    do {
      drainRequested = false;
      if (!getIsOnline()) break;

      const pending = await syncQueue.listPending();
      for (const operation of pending) {
        if (!getIsOnline()) break;
        if (!isDueForRetry(operation)) continue;

        const handler = getSyncHandler(operation.entityType);
        if (!handler) {
          // No module has registered for this entityType (shouldn't happen
          // in practice, but a stale queue entry from a since-removed
          // integration must never spin forever) — park it for review.
          await syncQueue.recordFailure(operation.id, `No sync handler registered for "${operation.entityType}"`);
          continue;
        }

        await syncQueue.markSyncing(operation.id);
        try {
          await handler.execute(operation);
          await syncQueue.remove(operation.id);
        } catch (error) {
          const resolution = resolveConflict(operation.entityType, operation, error);
          if (resolution === 'drop') {
            await syncQueue.remove(operation.id);
          } else if (resolution === 'surface') {
            await syncQueue.markDead(operation.id, error?.message ?? 'Sync failed');
          } else {
            await syncQueue.recordFailure(operation.id, error?.message ?? 'Sync failed');
          }
        }
      }

      await refreshStatus();
    } while (drainRequested && getIsOnline());
  } finally {
    isDraining = false;
    useSyncStatusStore.getState().setIsSyncing(false);
    useSyncStatusStore.getState().setLastSyncedAt(Date.now());
  }
}

let periodicTimer = null;

// Call once at app startup (see App.jsx). Idempotent. Wires the three
// triggers that matter for "automatic retry when online": a network online
// transition, the tab coming back into view, and a periodic fallback in
// case neither fires for some reason.
export function initSyncManager() {
  initNetworkMonitor();
  refreshStatus();

  subscribeNetworkStatus(() => {
    if (getIsOnline()) drainQueue();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') drainQueue();
  });

  if (!periodicTimer) {
    periodicTimer = setInterval(drainQueue, 30000);
  }
}

export function requestSync() {
  drainQueue();
}
