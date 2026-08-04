import { create } from 'zustand';

// Session-only UI state — the source of truth is the SQLite queue itself
// (see syncQueue.js), this store just mirrors it for cheap, reactive
// rendering (a sync indicator badge, a "N changes pending" banner) without
// every consumer re-querying SQLite on every render.
export const useSyncStatusStore = create((set) => ({
  pendingCount: 0,
  isSyncing: false,
  lastSyncedAt: null,
  deadOperations: [],

  setPendingCount: (pendingCount) => set({ pendingCount }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
  setDeadOperations: (deadOperations) => set({ deadOperations }),
}));
