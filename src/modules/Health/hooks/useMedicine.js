import { useQuery, useQueryClient } from '@tanstack/react-query';
import { medicineApi } from '../api/medicine.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const medicineKeys = {
  all: ['medicines'],
  list: (params) => [...medicineKeys.all, 'list', params],
  detail: (id) => [...medicineKeys.all, 'detail', id],
  logsForDate: (date) => [...medicineKeys.all, 'logs', date],
  adherence: (params) => [...medicineKeys.all, 'adherence', params],
};

function invalidateMedicine(queryClient) {
  queryClient.invalidateQueries({ queryKey: medicineKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useMedicineList(params) {
  return useQuery({ queryKey: medicineKeys.list(params), queryFn: () => medicineApi.list(params) });
}

export function useMedicineLogsForDate(date) {
  return useQuery({ queryKey: medicineKeys.logsForDate(date), queryFn: () => medicineApi.logsForDate(date), enabled: Boolean(date) });
}

export function useMedicineAdherence(params) {
  return useQuery({ queryKey: medicineKeys.adherence(params), queryFn: () => medicineApi.adherence(params) });
}

export function useCreateMedicine() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'medicine', opType: 'create', method: 'POST', buildUrl: () => '/medicines',
    apiCall: (payload) => medicineApi.create(payload),
    onSuccess: () => invalidateMedicine(queryClient),
  });
}

export function useUpdateMedicine() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'medicine', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/medicines/${id}`,
    apiCall: ({ id, payload }) => medicineApi.update(id, payload),
    onSuccess: () => invalidateMedicine(queryClient),
  });
}

export function useDeleteMedicine() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'medicine', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/medicines/${id}`,
    apiCall: (id) => medicineApi.delete(id),
    onSuccess: () => invalidateMedicine(queryClient),
  });
}

export function useMarkDoseTaken() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'medicine', opType: 'update', method: 'PATCH', buildUrl: (logId) => `/medicines/logs/${logId}/taken`,
    apiCall: (logId) => medicineApi.markTaken(logId),
    onSuccess: () => invalidateMedicine(queryClient),
  });
}

export function useMarkDoseSkipped() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'medicine', opType: 'update', method: 'PATCH', buildUrl: (logId) => `/medicines/logs/${logId}/skipped`,
    apiCall: (logId) => medicineApi.markSkipped(logId),
    onSuccess: () => invalidateMedicine(queryClient),
  });
}
