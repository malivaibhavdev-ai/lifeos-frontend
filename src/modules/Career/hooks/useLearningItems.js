import { useQuery, useQueryClient } from '@tanstack/react-query';
import { learningItemApi } from '../api/learningItem.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const learningItemKeys = {
  all: ['learningItems'],
  list: (params) => [...learningItemKeys.all, 'list', params],
  totalHours: () => [...learningItemKeys.all, 'totalHours'],
};

function invalidateLearningItems(queryClient) {
  queryClient.invalidateQueries({ queryKey: learningItemKeys.all });
  queryClient.invalidateQueries({ queryKey: ['careerHub'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useLearningItemList(params) {
  return useQuery({ queryKey: learningItemKeys.list(params), queryFn: () => learningItemApi.list(params) });
}
export function useTotalLearningHours() {
  return useQuery({ queryKey: learningItemKeys.totalHours(), queryFn: () => learningItemApi.totalHours() });
}
export function useCreateLearningItem() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'learningItem', opType: 'create', method: 'POST', buildUrl: () => '/learning-items',
    apiCall: (payload) => learningItemApi.create(payload),
    onSuccess: () => invalidateLearningItems(queryClient),
  });
}
export function useUpdateLearningItem() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'learningItem', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/learning-items/${id}`,
    apiCall: ({ id, ...payload }) => learningItemApi.update(id, payload),
    onSuccess: () => invalidateLearningItems(queryClient),
  });
}
export function useDeleteLearningItem() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'learningItem', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/learning-items/${id}`,
    apiCall: (id) => learningItemApi.delete(id),
    onSuccess: () => invalidateLearningItems(queryClient),
  });
}
