import { useQuery, useQueryClient } from '@tanstack/react-query';
import { educationApi } from '../api/education.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const educationKeys = { all: ['education'], list: () => [...educationKeys.all, 'list'] };

function invalidateEducation(queryClient) {
  queryClient.invalidateQueries({ queryKey: educationKeys.all });
  queryClient.invalidateQueries({ queryKey: ['careerHub'] });
}

export function useEducationList() {
  return useQuery({ queryKey: educationKeys.list(), queryFn: () => educationApi.list() });
}
export function useCreateEducation() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'educationEntry', opType: 'create', method: 'POST', buildUrl: () => '/education',
    apiCall: (payload) => educationApi.create(payload),
    onSuccess: () => invalidateEducation(queryClient),
  });
}
export function useUpdateEducation() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'educationEntry', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/education/${id}`,
    apiCall: ({ id, ...payload }) => educationApi.update(id, payload),
    onSuccess: () => invalidateEducation(queryClient),
  });
}
export function useDeleteEducation() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'educationEntry', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/education/${id}`,
    apiCall: (id) => educationApi.delete(id),
    onSuccess: () => invalidateEducation(queryClient),
  });
}
