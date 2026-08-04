export { registerSyncHandler, getSyncHandler } from './syncHandlerRegistry';
export { registerConflictResolver } from './conflictResolution';
export { useOfflineMutation } from './useOfflineMutation';
export { useIsOnline, getIsOnline } from './networkMonitor';
export { useSyncStatusStore } from './syncStatusStore';
export { requestSync } from './syncManager';
export { syncQueue } from './syncQueue';

import { initSyncManager } from './syncManager';

// Call once at app startup (see App.jsx), after any module-level
// registerSyncHandler calls have run (registration is synchronous
// import-time, so ordering relative to this call doesn't actually matter —
// this is just the natural "start the engine" entry point).
export function initializeOfflineSync() {
  initSyncManager();
}
