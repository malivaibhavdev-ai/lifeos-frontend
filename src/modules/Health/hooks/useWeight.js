import { useQuery, useQueryClient } from '@tanstack/react-query';
import { weightApi } from '../api/weight.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const weightKeys = {
  all: ['weight'],
  list: (params) => [...weightKeys.all, 'list', params],
  latest: () => [...weightKeys.all, 'latest'],
};

function invalidateWeight(queryClient) {
  queryClient.invalidateQueries({ queryKey: weightKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useWeightList(params) {
  return useQuery({ queryKey: weightKeys.list(params), queryFn: () => weightApi.list(params) });
}

export function useLatestWeight() {
  return useQuery({ queryKey: weightKeys.latest(), queryFn: () => weightApi.getLatest() });
}

export function useCreateWeight() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'weightLog', opType: 'create', method: 'POST', buildUrl: () => '/weight',
    apiCall: (payload) => weightApi.create(payload),
    onSuccess: () => invalidateWeight(queryClient),
  });
}

export function useUpdateWeight() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'weightLog', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/weight/${id}`,
    apiCall: ({ id, payload }) => weightApi.update(id, payload),
    onSuccess: () => invalidateWeight(queryClient),
  });
}

export function useDeleteWeight() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'weightLog', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/weight/${id}`,
    apiCall: (id) => weightApi.delete(id),
    onSuccess: () => invalidateWeight(queryClient),
  });
}
