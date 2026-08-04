import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sleepApi } from '../api/sleep.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const sleepKeys = {
  all: ['sleep'],
  list: (params) => [...sleepKeys.all, 'list', params],
  weeklyReport: (params) => [...sleepKeys.all, 'weeklyReport', params],
  schedule: () => [...sleepKeys.all, 'schedule'],
  debt: () => [...sleepKeys.all, 'debt'],
};

function invalidateSleep(queryClient) {
  queryClient.invalidateQueries({ queryKey: sleepKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useSleepList(params) {
  return useQuery({ queryKey: sleepKeys.list(params), queryFn: () => sleepApi.list(params) });
}

export function useSleepWeeklyReport(params) {
  return useQuery({ queryKey: sleepKeys.weeklyReport(params), queryFn: () => sleepApi.weeklyReport(params) });
}

export function useSleepSchedule() {
  return useQuery({ queryKey: sleepKeys.schedule(), queryFn: () => sleepApi.getSchedule() });
}

export function useSleepDebt() {
  return useQuery({ queryKey: sleepKeys.debt(), queryFn: () => sleepApi.getDebt() });
}

export function useCreateSleepLog() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'sleepLog', opType: 'create', method: 'POST', buildUrl: () => '/sleep',
    apiCall: (payload) => sleepApi.create(payload),
    onSuccess: () => invalidateSleep(queryClient),
  });
}

export function useUpdateSleepLog() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'sleepLog', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/sleep/${id}`,
    apiCall: ({ id, payload }) => sleepApi.update(id, payload),
    onSuccess: () => invalidateSleep(queryClient),
  });
}

export function useDeleteSleepLog() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'sleepLog', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/sleep/${id}`,
    apiCall: (id) => sleepApi.delete(id),
    onSuccess: () => invalidateSleep(queryClient),
  });
}

export function useUpdateSleepSchedule() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'sleepSchedule', opType: 'update', method: 'PATCH', buildUrl: () => '/sleep/schedule',
    apiCall: (payload) => sleepApi.updateSchedule(payload),
    onSuccess: () => invalidateSleep(queryClient),
  });
}
