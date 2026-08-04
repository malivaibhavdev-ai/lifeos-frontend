import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { careerDocumentApi } from '../api/careerDocument.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const careerDocumentKeys = { all: ['careerDocuments'], list: (params) => [...careerDocumentKeys.all, 'list', params] };

function invalidateCareerDocuments(queryClient) {
  queryClient.invalidateQueries({ queryKey: careerDocumentKeys.all });
}

export function useCareerDocumentList(params) {
  return useQuery({ queryKey: careerDocumentKeys.list(params), queryFn: () => careerDocumentApi.list(params) });
}
export function useCreateCareerDocument() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'careerDocument', opType: 'create', method: 'POST', buildUrl: () => '/career-documents',
    apiCall: (payload) => careerDocumentApi.create(payload),
    onSuccess: () => invalidateCareerDocuments(queryClient),
  });
}
export function useDeleteCareerDocument() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'careerDocument', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/career-documents/${id}`,
    apiCall: (id) => careerDocumentApi.delete(id),
    onSuccess: () => invalidateCareerDocuments(queryClient),
  });
}
export function useUploadCareerDocumentFile() {
  return useMutation({ mutationFn: (formData) => careerDocumentApi.upload(formData) });
}
