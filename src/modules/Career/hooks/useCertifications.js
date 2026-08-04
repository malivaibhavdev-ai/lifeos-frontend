import { useQuery, useQueryClient } from '@tanstack/react-query';
import { certificationApi } from '../api/certification.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const certificationKeys = { all: ['certifications'], list: (params) => [...certificationKeys.all, 'list', params] };

function invalidateCertifications(queryClient) {
  queryClient.invalidateQueries({ queryKey: certificationKeys.all });
  queryClient.invalidateQueries({ queryKey: ['careerHub'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useCertificationList(params) {
  return useQuery({ queryKey: certificationKeys.list(params), queryFn: () => certificationApi.list(params) });
}
export function useCreateCertification() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'certification', opType: 'create', method: 'POST', buildUrl: () => '/certifications',
    apiCall: (payload) => certificationApi.create(payload),
    onSuccess: () => invalidateCertifications(queryClient),
  });
}
export function useUpdateCertification() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'certification', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/certifications/${id}`,
    apiCall: ({ id, ...payload }) => certificationApi.update(id, payload),
    onSuccess: () => invalidateCertifications(queryClient),
  });
}
export function useDeleteCertification() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'certification', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/certifications/${id}`,
    apiCall: (id) => certificationApi.delete(id),
    onSuccess: () => invalidateCertifications(queryClient),
  });
}
