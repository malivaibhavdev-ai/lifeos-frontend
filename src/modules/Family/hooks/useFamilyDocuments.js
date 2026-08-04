import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { familyDocumentApi } from '../api/familyDocument.api';

export const familyDocumentKeys = {
  all: (householdId) => ['familyDocuments', householdId],
  list: (householdId, params) => [...familyDocumentKeys.all(householdId), 'list', params],
  detail: (householdId, id) => [...familyDocumentKeys.all(householdId), 'detail', id],
};

function invalidate(queryClient, householdId) {
  queryClient.invalidateQueries({ queryKey: familyDocumentKeys.all(householdId) });
}

export function useFamilyDocuments(householdId, params) {
  return useQuery({
    queryKey: familyDocumentKeys.list(householdId, params),
    queryFn: () => familyDocumentApi.list(householdId, params),
    enabled: Boolean(householdId),
  });
}

export function useFamilyDocument(householdId, id) {
  return useQuery({
    queryKey: familyDocumentKeys.detail(householdId, id),
    queryFn: () => familyDocumentApi.getById(householdId, id),
    enabled: Boolean(householdId && id),
  });
}

export function useUploadFamilyDocument(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => familyDocumentApi.create(householdId, formData),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useUpdateFamilyDocument(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => familyDocumentApi.update(householdId, id, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useReplaceFamilyDocumentFile(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => familyDocumentApi.replaceFile(householdId, id, formData),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useDeleteFamilyDocument(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => familyDocumentApi.delete(householdId, id),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}
