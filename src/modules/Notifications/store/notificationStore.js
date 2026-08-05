import { create } from 'zustand';

// Client-side notification state that isn't worth round-tripping through
// React Query: the live unread badge count (kept in sync by both the list
// fetch and real-time socket events) and the Socket.IO connection status.
// Deliberately not persisted — both are re-derived fresh on every load.
export const useNotificationStore = create((set, get) => ({
  unreadCount: 0,
  isSocketConnected: false,

  setUnreadCount: (unreadCount) => set({ unreadCount: Math.max(0, unreadCount) }),
  incrementUnread: (by = 1) => set((state) => ({ unreadCount: Math.max(0, state.unreadCount + by) })),
  decrementUnread: (by = 1) => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - by) })),
  resetUnread: () => set({ unreadCount: 0 }),

  setSocketConnected: (isSocketConnected) => set({ isSocketConnected }),

  getUnreadCount: () => get().unreadCount,
}));
