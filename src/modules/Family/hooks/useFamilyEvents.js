import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { familyEventApi } from '../api/familyEvent.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const familyEventKeys = {
  all: (householdId) => ['familyEvents', householdId],
  list: (householdId, params) => [...familyEventKeys.all(householdId), 'list', params],
  detail: (householdId, id) => [...familyEventKeys.all(householdId), 'detail', id],
};

function invalidate(queryClient, householdId) {
  queryClient.invalidateQueries({ queryKey: familyEventKeys.all(householdId) });
  queryClient.invalidateQueries({ queryKey: ['family', householdId, 'dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useFamilyEvents(householdId, params) {
  return useQuery({
    queryKey: familyEventKeys.list(householdId, params),
    queryFn: () => familyEventApi.list(householdId, params),
    enabled: Boolean(householdId),
  });
}

export function useFamilyEvent(householdId, id) {
  return useQuery({
    queryKey: familyEventKeys.detail(householdId, id),
    queryFn: () => familyEventApi.getById(householdId, id),
    enabled: Boolean(householdId && id),
  });
}

export function useCreateFamilyEvent(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyEvent', opType: 'create', method: 'POST', buildUrl: () => `/family/${householdId}/events`,
    apiCall: (payload) => familyEventApi.create(householdId, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useUpdateFamilyEvent(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyEvent', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/family/${householdId}/events/${id}`,
    apiCall: ({ id, payload }) => familyEventApi.update(householdId, id, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useDeleteFamilyEvent(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyEvent', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/family/${householdId}/events/${id}`,
    apiCall: (id) => familyEventApi.delete(householdId, id),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useToggleEventChecklistItem(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, itemId, isDone }) => familyEventApi.toggleChecklistItem(householdId, id, itemId, isDone),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useSetGuestRsvp(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, memberId, rsvp }) => familyEventApi.setGuestRsvp(householdId, id, memberId, rsvp),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}
