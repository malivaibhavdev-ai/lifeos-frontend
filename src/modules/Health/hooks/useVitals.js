import { useQuery, useQueryClient } from '@tanstack/react-query';
import { vitalsApi } from '../api/vitals.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const vitalsKeys = {
  all: ['vitals'],
  list: (params) => [...vitalsKeys.all, 'list', params],
  latest: () => [...vitalsKeys.all, 'latest'],
};

function invalidateVitals(queryClient) {
  queryClient.invalidateQueries({ queryKey: vitalsKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useVitalsList(params) {
  return useQuery({ queryKey: vitalsKeys.list(params), queryFn: () => vitalsApi.list(params) });
}

export function useLatestVitals() {
  return useQuery({ queryKey: vitalsKeys.latest(), queryFn: () => vitalsApi.getLatest() });
}

export function useCreateVitals() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'vitalSignLog', opType: 'create', method: 'POST', buildUrl: () => '/vitals',
    apiCall: (payload) => vitalsApi.create(payload),
    onSuccess: () => invalidateVitals(queryClient),
  });
}

export function useUpdateVitals() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'vitalSignLog', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/vitals/${id}`,
    apiCall: ({ id, payload }) => vitalsApi.update(id, payload),
    onSuccess: () => invalidateVitals(queryClient),
  });
}

export function useDeleteVitals() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'vitalSignLog', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/vitals/${id}`,
    apiCall: (id) => vitalsApi.delete(id),
    onSuccess: () => invalidateVitals(queryClient),
  });
}
