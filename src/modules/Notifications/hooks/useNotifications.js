import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { notificationApi } from '../api/notification.api';
import { useOfflineMutation } from '../../../services/offlineSync';
import { useNotificationStore } from '../store/notificationStore';

export const notificationKeys = {
  all: ['notifications'],
  list: (params) => [...notificationKeys.all, 'list', params],
  detail: (id) => [...notificationKeys.all, 'detail', id],
  dashboard: () => [...notificationKeys.all, 'dashboard'],
};

function invalidate(queryClient) {
  queryClient.invalidateQueries({ queryKey: notificationKeys.all });
}

// Also syncs the live unread-badge Zustand store from the server's own
// count every time the list is fetched — `list`'s `unreadCount` is a real
// countDocuments() over ALL unread+non-archived notifications, so this is
// the reliable source of truth on mount/refetch; the socket layer keeps it
// live in between fetches.
export function useNotifications(params) {
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: async () => {
      const data = await notificationApi.list(params);
      if (typeof data?.unreadCount === 'number') setUnreadCount(data.unreadCount);
      return data;
    },
  });
}

// Lightweight sync-only query (limit: 1) so the unread badge shows the
// real count the instant the app loads, without waiting for the user to
// visit the Notification Center first.
export function useUnreadCountSync(enabled) {
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  return useQuery({
    queryKey: [...notificationKeys.all, 'badgeSync'],
    queryFn: async () => {
      const data = await notificationApi.list({ limit: 1 });
      if (typeof data?.unreadCount === 'number') setUnreadCount(data.unreadCount);
      return null;
    },
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useNotificationDashboard() {
  return useQuery({ queryKey: notificationKeys.dashboard(), queryFn: () => notificationApi.getDashboard() });
}

export function useNotification(id) {
  return useQuery({ queryKey: notificationKeys.detail(id), queryFn: () => notificationApi.getById(id), enabled: Boolean(id) });
}

export function useSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload) => notificationApi.send(payload), onSuccess: () => invalidate(queryClient) });
}

export function useBroadcastToHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ householdId, payload }) => notificationApi.broadcastToHousehold(householdId, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const decrementUnread = useNotificationStore((state) => state.decrementUnread);
  return useOfflineMutation({
    entityType: 'notification',
    opType: 'update',
    method: 'PATCH',
    buildUrl: (id) => `/notifications/${id}/read`,
    apiCall: (id) => notificationApi.markRead(id),
    onSuccess: () => {
      decrementUnread(1);
      invalidate(queryClient);
    },
  });
}

export function useMarkNotificationUnread() {
  const queryClient = useQueryClient();
  const incrementUnread = useNotificationStore((state) => state.incrementUnread);
  return useOfflineMutation({
    entityType: 'notification',
    opType: 'update',
    method: 'PATCH',
    buildUrl: (id) => `/notifications/${id}/unread`,
    apiCall: (id) => notificationApi.markUnread(id),
    onSuccess: () => {
      incrementUnread(1);
      invalidate(queryClient);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const resetUnread = useNotificationStore((state) => state.resetUnread);
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      resetUnread();
      invalidate(queryClient);
    },
  });
}

export function useSetNotificationArchived() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'notification',
    opType: 'update',
    method: 'PATCH',
    buildUrl: ({ id }) => `/notifications/${id}/archive`,
    apiCall: ({ id, value }) => notificationApi.setArchived(id, value),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useSetNotificationPinned() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'notification',
    opType: 'update',
    method: 'PATCH',
    buildUrl: ({ id }) => `/notifications/${id}/pin`,
    apiCall: ({ id, value }) => notificationApi.setPinned(id, value),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useSetNotificationFavorite() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'notification',
    opType: 'update',
    method: 'PATCH',
    buildUrl: ({ id }) => `/notifications/${id}/favorite`,
    apiCall: ({ id, value }) => notificationApi.setFavorite(id, value),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useExecuteNotificationAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actionKey, payload }) => notificationApi.executeAction(id, actionKey, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'notification',
    opType: 'delete',
    method: 'DELETE',
    buildUrl: (id) => `/notifications/${id}`,
    apiCall: (id) => notificationApi.delete(id),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useBulkUpdateNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, payload }) => notificationApi.bulkUpdate(ids, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useBulkDeleteNotifications() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (ids) => notificationApi.bulkDelete(ids), onSuccess: () => invalidate(queryClient) });
}
