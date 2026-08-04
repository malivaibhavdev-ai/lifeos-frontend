import { useQuery, useQueryClient } from '@tanstack/react-query';
import { workHistoryApi } from '../api/workHistory.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const workHistoryKeys = {
  all: ['workHistory'],
  list: () => [...workHistoryKeys.all, 'list'],
  detail: (id) => [...workHistoryKeys.all, 'detail', id],
  experience: () => [...workHistoryKeys.all, 'experience'],
};

function invalidateWorkHistory(queryClient) {
  queryClient.invalidateQueries({ queryKey: workHistoryKeys.all });
  queryClient.invalidateQueries({ queryKey: ['careerHub'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useWorkHistoryList() {
  return useQuery({ queryKey: workHistoryKeys.list(), queryFn: () => workHistoryApi.list() });
}
export function useExperience() {
  return useQuery({ queryKey: workHistoryKeys.experience(), queryFn: () => workHistoryApi.experience() });
}
export function useCreateWorkHistory() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'workHistoryEntry', opType: 'create', method: 'POST', buildUrl: () => '/work-history',
    apiCall: (payload) => workHistoryApi.create(payload),
    onSuccess: () => invalidateWorkHistory(queryClient),
  });
}
export function useUpdateWorkHistory() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'workHistoryEntry', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/work-history/${id}`,
    apiCall: ({ id, ...payload }) => workHistoryApi.update(id, payload),
    onSuccess: () => invalidateWorkHistory(queryClient),
  });
}
export function useDeleteWorkHistory() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'workHistoryEntry', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/work-history/${id}`,
    apiCall: (id) => workHistoryApi.delete(id),
    onSuccess: () => invalidateWorkHistory(queryClient),
  });
}
