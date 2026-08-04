import { useQuery, useQueryClient } from '@tanstack/react-query';
import { salaryRecordApi } from '../api/salaryRecord.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const salaryRecordKeys = { all: ['salaryRecords'], list: () => [...salaryRecordKeys.all, 'list'] };

function invalidateSalaryRecords(queryClient) {
  queryClient.invalidateQueries({ queryKey: salaryRecordKeys.all });
  queryClient.invalidateQueries({ queryKey: ['careerHub'] });
  queryClient.invalidateQueries({ queryKey: ['careerProfile'] });
}

export function useSalaryRecordList() {
  return useQuery({ queryKey: salaryRecordKeys.list(), queryFn: () => salaryRecordApi.list() });
}
export function useCreateSalaryRecord() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'salaryRecord', opType: 'create', method: 'POST', buildUrl: () => '/salary-records',
    apiCall: (payload) => salaryRecordApi.create(payload),
    onSuccess: () => invalidateSalaryRecords(queryClient),
  });
}
export function useUpdateSalaryRecord() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'salaryRecord', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/salary-records/${id}`,
    apiCall: ({ id, ...payload }) => salaryRecordApi.update(id, payload),
    onSuccess: () => invalidateSalaryRecords(queryClient),
  });
}
export function useDeleteSalaryRecord() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'salaryRecord', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/salary-records/${id}`,
    apiCall: (id) => salaryRecordApi.delete(id),
    onSuccess: () => invalidateSalaryRecords(queryClient),
  });
}
