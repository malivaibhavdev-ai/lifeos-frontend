import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dreamApi } from '../api/dream.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const dreamKeys = {
  all: ['dreams'],
  list: (params) => [...dreamKeys.all, 'list', params],
  detail: (id) => [...dreamKeys.all, 'detail', id],
  settings: () => [...dreamKeys.all, 'settings'],
  overview: (params) => [...dreamKeys.all, 'overview', params],
  trend: (params) => [...dreamKeys.all, 'trend', params],
  weekly: () => [...dreamKeys.all, 'weekly'],
  monthly: () => [...dreamKeys.all, 'monthly'],
  yearly: () => [...dreamKeys.all, 'yearly'],
  score: () => [...dreamKeys.all, 'score'],
  topSymbols: () => [...dreamKeys.all, 'topSymbols'],
  topPeople: () => [...dreamKeys.all, 'topPeople'],
};

function invalidateDreams(queryClient) {
  queryClient.invalidateQueries({ queryKey: dreamKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useDreamList(params) {
  return useQuery({ queryKey: dreamKeys.list(params), queryFn: () => dreamApi.list(params) });
}

export function useDream(id) {
  return useQuery({ queryKey: dreamKeys.detail(id), queryFn: () => dreamApi.getById(id), enabled: Boolean(id) });
}

export function useDreamSettings() {
  return useQuery({ queryKey: dreamKeys.settings(), queryFn: () => dreamApi.getSettings() });
}

export function useDreamOverview(params) {
  return useQuery({ queryKey: dreamKeys.overview(params), queryFn: () => dreamApi.overview(params) });
}

export function useDreamTrend(params) {
  return useQuery({ queryKey: dreamKeys.trend(params), queryFn: () => dreamApi.trend(params) });
}

export function useDreamWeeklyReport() {
  return useQuery({ queryKey: dreamKeys.weekly(), queryFn: () => dreamApi.weeklyReport() });
}

export function useDreamMonthlyReport() {
  return useQuery({ queryKey: dreamKeys.monthly(), queryFn: () => dreamApi.monthlyReport() });
}

export function useDreamYearlyReport() {
  return useQuery({ queryKey: dreamKeys.yearly(), queryFn: () => dreamApi.yearlyReport() });
}

export function useDreamScore() {
  return useQuery({ queryKey: dreamKeys.score(), queryFn: () => dreamApi.score() });
}

export function useTopDreamSymbols() {
  return useQuery({ queryKey: dreamKeys.topSymbols(), queryFn: () => dreamApi.topSymbols() });
}

export function useTopDreamPeople() {
  return useQuery({ queryKey: dreamKeys.topPeople(), queryFn: () => dreamApi.topPeople() });
}

export function useCreateDream() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'dreamEntry', opType: 'create', method: 'POST', buildUrl: () => '/dreams',
    apiCall: (payload) => dreamApi.create(payload),
    onSuccess: () => invalidateDreams(queryClient),
  });
}

export function useUpdateDream() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'dreamEntry', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/dreams/${id}`,
    apiCall: ({ id, payload }) => dreamApi.update(id, payload),
    onSuccess: () => invalidateDreams(queryClient),
  });
}

export function useDeleteDream() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'dreamEntry', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/dreams/${id}`,
    apiCall: (id) => dreamApi.delete(id),
    onSuccess: () => invalidateDreams(queryClient),
  });
}

export function useUpdateDreamSettings() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'dreamSettings', opType: 'update', method: 'PATCH', buildUrl: () => '/dreams/settings',
    apiCall: (payload) => dreamApi.updateSettings(payload),
    onSuccess: () => invalidateDreams(queryClient),
  });
}
