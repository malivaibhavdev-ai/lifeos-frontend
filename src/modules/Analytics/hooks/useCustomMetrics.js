import { useQuery, useQueryClient } from '@tanstack/react-query';
import { customMetricApi } from '../api/customMetric.api';
import { useOfflineMutation } from '../../../services/offlineSync';

const key = ['customMetrics'];

export function useCustomMetrics() {
  return useQuery({ queryKey: key, queryFn: () => customMetricApi.list() });
}

export function useCustomMetric(id) {
  return useQuery({ queryKey: [...key, id], queryFn: () => customMetricApi.getById(id), enabled: Boolean(id) });
}

export function useEvaluateCustomMetric(id, params) {
  return useQuery({
    queryKey: [...key, id, 'evaluate', params],
    queryFn: () => customMetricApi.evaluate(id, params),
    enabled: Boolean(id),
  });
}

export function useCreateCustomMetric() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'customMetric', opType: 'create', method: 'POST', buildUrl: () => '/analytics/metrics',
    apiCall: (payload) => customMetricApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateCustomMetric() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'customMetric', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/analytics/metrics/${id}`,
    apiCall: ({ id, payload }) => customMetricApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteCustomMetric() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'customMetric', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/analytics/metrics/${id}`,
    apiCall: (id) => customMetricApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
