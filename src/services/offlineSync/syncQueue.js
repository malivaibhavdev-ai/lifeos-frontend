import { db } from './db';
import { generateId } from './generateId';

const MAX_RETRIES = 8;

// Persisted, append-only queue of mutations that couldn't reach the server.
// Survives tab reloads by design (that's the entire point of backing it with
// IndexedDB instead of in-memory state) — see syncManager.js for what drains
// it. Same public API as the mobile app's SQLite-backed syncQueue so
// syncManager.js/useOfflineMutation.js need zero changes — only the storage
// backend differs (Dexie queries instead of raw SQL).
export const syncQueue = {
  async enqueue({ entityType, opType, method, url, payload }) {
    const id = generateId();
    const idempotencyKey = generateId();
    const now = Date.now();
    const operation = {
      id,
      entityType,
      opType,
      method,
      url,
      payload: payload ?? null,
      idempotencyKey,
      status: 'pending',
      retryCount: 0,
      lastError: null,
      createdAt: now,
      updatedAt: now,
    };
    await db.sync_queue.put(operation);
    return operation;
  },

  async listPending() {
    const rows = await db.sync_queue.where('status').anyOf('pending', 'failed').sortBy('createdAt');
    return rows;
  },

  async listFailed() {
    const rows = await db.sync_queue.where('status').equals('dead').sortBy('createdAt');
    return rows;
  },

  async count() {
    return db.sync_queue.where('status').anyOf('pending', 'failed', 'syncing').count();
  },

  async markSyncing(id) {
    await db.sync_queue.update(id, { status: 'syncing', updatedAt: Date.now() });
  },

  async remove(id) {
    await db.sync_queue.delete(id);
  },

  // Bumps retryCount and reverts to 'pending' (so the next drain picks it up
  // again) until MAX_RETRIES is exhausted, at which point it's parked as
  // 'dead' — still in the table (nothing is silently lost), but excluded
  // from automatic retries so a permanently-broken operation can't spin
  // forever. See syncStatusStore for surfacing 'dead' ops for manual review.
  async recordFailure(id, errorMessage) {
    const row = await db.sync_queue.get(id);
    if (!row) return;
    const nextRetryCount = row.retryCount + 1;
    const nextStatus = nextRetryCount >= MAX_RETRIES ? 'dead' : 'pending';
    await db.sync_queue.update(id, {
      status: nextStatus,
      retryCount: nextRetryCount,
      lastError: errorMessage ?? null,
      updatedAt: Date.now(),
    });
  },

  // Straight to 'dead' regardless of retryCount — used when a conflict
  // resolver decides an operation needs a human decision (see
  // conflictResolution.js's 'surface' outcome), which is a different
  // reason than "kept failing until MAX_RETRIES ran out".
  async markDead(id, errorMessage) {
    await db.sync_queue.update(id, {
      status: 'dead',
      lastError: errorMessage ?? null,
      updatedAt: Date.now(),
    });
  },

  async clearDead() {
    await db.sync_queue.where('status').equals('dead').delete();
  },

  async retryDead(id) {
    await db.sync_queue.update(id, {
      status: 'pending',
      retryCount: 0,
      lastError: null,
      updatedAt: Date.now(),
    });
  },
};

export { MAX_RETRIES };
