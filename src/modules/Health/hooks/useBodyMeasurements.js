import { useQuery, useQueryClient } from '@tanstack/react-query';
import { bodyMeasurementApi } from '../api/bodyMeasurement.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const bodyMeasurementKeys = {
  all: ['bodyMeasurements'],
  list: (params) => [...bodyMeasurementKeys.all, 'list', params],
  latest: () => [...bodyMeasurementKeys.all, 'latest'],
};

function invalidateBodyMeasurements(queryClient) {
  queryClient.invalidateQueries({ queryKey: bodyMeasurementKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useBodyMeasurementList(params) {
  return useQuery({ queryKey: bodyMeasurementKeys.list(params), queryFn: () => bodyMeasurementApi.list(params) });
}

export function useLatestBodyMeasurement() {
  return useQuery({ queryKey: bodyMeasurementKeys.latest(), queryFn: () => bodyMeasurementApi.getLatest() });
}

export function useCreateBodyMeasurement() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'bodyMeasurementLog', opType: 'create', method: 'POST', buildUrl: () => '/body-measurements',
    apiCall: (payload) => bodyMeasurementApi.create(payload),
    onSuccess: () => invalidateBodyMeasurements(queryClient),
  });
}

export function useUpdateBodyMeasurement() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'bodyMeasurementLog', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/body-measurements/${id}`,
    apiCall: ({ id, payload }) => bodyMeasurementApi.update(id, payload),
    onSuccess: () => invalidateBodyMeasurements(queryClient),
  });
}

export function useDeleteBodyMeasurement() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'bodyMeasurementLog', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/body-measurements/${id}`,
    apiCall: (id) => bodyMeasurementApi.delete(id),
    onSuccess: () => invalidateBodyMeasurements(queryClient),
  });
}
