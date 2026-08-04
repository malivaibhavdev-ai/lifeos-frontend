import { useQuery, useQueryClient } from '@tanstack/react-query';
import { familyNoteApi } from '../api/familyNote.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const familyNoteKeys = {
  all: (householdId) => ['familyNotes', householdId],
  list: (householdId, params) => [...familyNoteKeys.all(householdId), 'list', params],
  detail: (householdId, id) => [...familyNoteKeys.all(householdId), 'detail', id],
};

function invalidate(queryClient, householdId) {
  queryClient.invalidateQueries({ queryKey: familyNoteKeys.all(householdId) });
}

export function useFamilyNotes(householdId, params) {
  return useQuery({
    queryKey: familyNoteKeys.list(householdId, params),
    queryFn: () => familyNoteApi.list(householdId, params),
    enabled: Boolean(householdId),
  });
}

export function useFamilyNote(householdId, id) {
  return useQuery({
    queryKey: familyNoteKeys.detail(householdId, id),
    queryFn: () => familyNoteApi.getById(householdId, id),
    enabled: Boolean(householdId && id),
  });
}

export function useCreateFamilyNote(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyNote', opType: 'create', method: 'POST', buildUrl: () => `/family/${householdId}/notes`,
    apiCall: (payload) => familyNoteApi.create(householdId, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useUpdateFamilyNote(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyNote', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/family/${householdId}/notes/${id}`,
    apiCall: ({ id, payload }) => familyNoteApi.update(householdId, id, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useDeleteFamilyNote(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyNote', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/family/${householdId}/notes/${id}`,
    apiCall: (id) => familyNoteApi.delete(householdId, id),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}
