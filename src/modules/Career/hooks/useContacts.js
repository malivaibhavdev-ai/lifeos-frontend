import { useQuery, useQueryClient } from '@tanstack/react-query';
import { contactApi } from '../api/contact.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const contactKeys = { all: ['contacts'], list: (params) => [...contactKeys.all, 'list', params] };

function invalidateContacts(queryClient) {
  queryClient.invalidateQueries({ queryKey: contactKeys.all });
  queryClient.invalidateQueries({ queryKey: ['careerHub'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useContactList(params) {
  return useQuery({ queryKey: contactKeys.list(params), queryFn: () => contactApi.list(params) });
}
export function useCreateContact() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'contact', opType: 'create', method: 'POST', buildUrl: () => '/contacts',
    apiCall: (payload) => contactApi.create(payload),
    onSuccess: () => invalidateContacts(queryClient),
  });
}
export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'contact', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/contacts/${id}`,
    apiCall: ({ id, ...payload }) => contactApi.update(id, payload),
    onSuccess: () => invalidateContacts(queryClient),
  });
}
export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'contact', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/contacts/${id}`,
    apiCall: (id) => contactApi.delete(id),
    onSuccess: () => invalidateContacts(queryClient),
  });
}
