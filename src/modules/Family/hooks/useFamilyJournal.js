import { useQuery, useQueryClient } from '@tanstack/react-query';
import { familyJournalApi } from '../api/familyJournal.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const familyJournalKeys = {
  all: (householdId) => ['familyJournal', householdId],
  list: (householdId, params) => [...familyJournalKeys.all(householdId), 'list', params],
  detail: (householdId, id) => [...familyJournalKeys.all(householdId), 'detail', id],
};

function invalidate(queryClient, householdId) {
  queryClient.invalidateQueries({ queryKey: familyJournalKeys.all(householdId) });
}

export function useFamilyJournalEntries(householdId, params) {
  return useQuery({
    queryKey: familyJournalKeys.list(householdId, params),
    queryFn: () => familyJournalApi.list(householdId, params),
    enabled: Boolean(householdId),
  });
}

export function useFamilyJournalEntry(householdId, id) {
  return useQuery({
    queryKey: familyJournalKeys.detail(householdId, id),
    queryFn: () => familyJournalApi.getById(householdId, id),
    enabled: Boolean(householdId && id),
  });
}

export function useCreateFamilyJournalEntry(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyJournalEntry', opType: 'create', method: 'POST', buildUrl: () => `/family/${householdId}/journal`,
    apiCall: (payload) => familyJournalApi.create(householdId, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useUpdateFamilyJournalEntry(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyJournalEntry', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/family/${householdId}/journal/${id}`,
    apiCall: ({ id, payload }) => familyJournalApi.update(householdId, id, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useDeleteFamilyJournalEntry(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyJournalEntry', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/family/${householdId}/journal/${id}`,
    apiCall: (id) => familyJournalApi.delete(householdId, id),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}
