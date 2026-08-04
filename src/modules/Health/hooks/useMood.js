import { useQuery, useQueryClient } from '@tanstack/react-query';
import { moodApi } from '../api/mood.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const moodKeys = {
  all: ['mood'],
  list: (params) => [...moodKeys.all, 'list', params],
  byDate: (date) => [...moodKeys.all, 'date', date],
};

function invalidateMood(queryClient) {
  queryClient.invalidateQueries({ queryKey: moodKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useMoodList(params) {
  return useQuery({ queryKey: moodKeys.list(params), queryFn: () => moodApi.list(params) });
}

export function useLatestMoodForDate(date) {
  return useQuery({ queryKey: moodKeys.byDate(date), queryFn: () => moodApi.getLatestForDate(date), enabled: Boolean(date) });
}

export function useCreateMood() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'moodLog', opType: 'create', method: 'POST', buildUrl: () => '/mood',
    apiCall: (payload) => moodApi.create(payload),
    onSuccess: () => invalidateMood(queryClient),
  });
}

export function useUpdateMood() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'moodLog', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/mood/${id}`,
    apiCall: ({ id, payload }) => moodApi.update(id, payload),
    onSuccess: () => invalidateMood(queryClient),
  });
}

export function useDeleteMood() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'moodLog', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/mood/${id}`,
    apiCall: (id) => moodApi.delete(id),
    onSuccess: () => invalidateMood(queryClient),
  });
}
