import { useQuery, useQueryClient } from '@tanstack/react-query';
import { familyMemoryApi } from '../api/familyMemory.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const familyMemoryKeys = {
  all: (householdId) => ['familyMemories', householdId],
  list: (householdId, params) => [...familyMemoryKeys.all(householdId), 'list', params],
  detail: (householdId, id) => [...familyMemoryKeys.all(householdId), 'detail', id],
  timeline: (householdId, params) => [...familyMemoryKeys.all(householdId), 'timeline', params],
};

function invalidate(queryClient, householdId) {
  queryClient.invalidateQueries({ queryKey: familyMemoryKeys.all(householdId) });
}

export function useFamilyMemories(householdId, params) {
  return useQuery({
    queryKey: familyMemoryKeys.list(householdId, params),
    queryFn: () => familyMemoryApi.list(householdId, params),
    enabled: Boolean(householdId),
  });
}

export function useFamilyMemory(householdId, id) {
  return useQuery({
    queryKey: familyMemoryKeys.detail(householdId, id),
    queryFn: () => familyMemoryApi.getById(householdId, id),
    enabled: Boolean(householdId && id),
  });
}

export function useFamilyTimeline(householdId, params) {
  return useQuery({
    queryKey: familyMemoryKeys.timeline(householdId, params),
    queryFn: () => familyMemoryApi.getTimeline(householdId, params),
    enabled: Boolean(householdId),
  });
}

export function useCreateFamilyMemory(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyMemory', opType: 'create', method: 'POST', buildUrl: () => `/family/${householdId}/memories`,
    apiCall: (payload) => familyMemoryApi.create(householdId, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useUpdateFamilyMemory(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyMemory', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/family/${householdId}/memories/${id}`,
    apiCall: ({ id, payload }) => familyMemoryApi.update(householdId, id, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useDeleteFamilyMemory(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyMemory', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/family/${householdId}/memories/${id}`,
    apiCall: (id) => familyMemoryApi.delete(householdId, id),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}
