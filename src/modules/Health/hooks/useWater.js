import { useQuery, useQueryClient } from '@tanstack/react-query';
import { waterApi } from '../api/water.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const waterKeys = {
  all: ['water'],
  byDate: (date) => [...waterKeys.all, 'date', date],
  list: (params) => [...waterKeys.all, 'list', params],
  settings: () => [...waterKeys.all, 'settings'],
};

function invalidateWater(queryClient) {
  queryClient.invalidateQueries({ queryKey: waterKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useWaterForDate(date) {
  return useQuery({ queryKey: waterKeys.byDate(date), queryFn: () => waterApi.getByDate(date), enabled: Boolean(date) });
}

export function useWaterList(params) {
  return useQuery({ queryKey: waterKeys.list(params), queryFn: () => waterApi.list(params) });
}

export function useWaterSettings() {
  return useQuery({ queryKey: waterKeys.settings(), queryFn: () => waterApi.getSettings() });
}

export function useAddWaterEntry() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'waterLog', opType: 'update', method: 'POST', buildUrl: ({ date }) => `/water/${date}/entries`,
    apiCall: ({ date, amountMl, idempotencyKey }) => waterApi.addEntry(date, { amountMl, idempotencyKey }),
    onSuccess: () => invalidateWater(queryClient),
  });
}

export function useRemoveLastWaterEntry() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'waterLog', opType: 'update', method: 'DELETE', buildUrl: (date) => `/water/${date}/entries/last`,
    apiCall: (date) => waterApi.removeLastEntry(date),
    onSuccess: () => invalidateWater(queryClient),
  });
}

export function useSetWaterTarget() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'waterLog', opType: 'update', method: 'PATCH', buildUrl: ({ date }) => `/water/${date}/target`,
    apiCall: ({ date, targetMl }) => waterApi.setTarget(date, targetMl),
    onSuccess: () => invalidateWater(queryClient),
  });
}

export function useUpdateWaterSettings() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'waterSettings', opType: 'update', method: 'PATCH', buildUrl: () => '/water/settings',
    apiCall: (payload) => waterApi.updateSettings(payload),
    onSuccess: () => invalidateWater(queryClient),
  });
}
