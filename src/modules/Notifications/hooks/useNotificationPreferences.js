import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { notificationPreferenceApi } from '../api/notificationPreference.api';

export const notificationPreferenceKeys = {
  all: ['notificationPreferences'],
  list: () => [...notificationPreferenceKeys.all, 'list'],
};

export function useNotificationPreferences() {
  return useQuery({ queryKey: notificationPreferenceKeys.list(), queryFn: () => notificationPreferenceApi.list() });
}

function invalidate(queryClient) {
  queryClient.invalidateQueries({ queryKey: notificationPreferenceKeys.all });
}

export function useUpsertGlobalNotificationPreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => notificationPreferenceApi.upsertGlobal(payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpsertCategoryNotificationPreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ category, payload }) => notificationPreferenceApi.upsertCategory(category, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteCategoryNotificationPreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category) => notificationPreferenceApi.deleteCategory(category),
    onSuccess: () => invalidate(queryClient),
  });
}
