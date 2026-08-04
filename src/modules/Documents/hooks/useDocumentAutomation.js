import { useQuery, useQueryClient } from '@tanstack/react-query';
import { documentAutomationApi } from '../api/documentAutomation.api';
import { useOfflineMutation } from '../../../services/offlineSync';

const key = ['documentAutomationRules'];

export function useAutomationRules() {
  return useQuery({ queryKey: key, queryFn: () => documentAutomationApi.list() });
}

export function useAutomationRule(id) {
  return useQuery({ queryKey: [...key, id], queryFn: () => documentAutomationApi.getById(id), enabled: Boolean(id) });
}

export function useCreateAutomationRule() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'automationRule', opType: 'create', method: 'POST', buildUrl: () => '/documents/automation-rules',
    apiCall: (payload) => documentAutomationApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateAutomationRule() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'automationRule', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/documents/automation-rules/${id}`,
    apiCall: ({ id, payload }) => documentAutomationApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteAutomationRule() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'automationRule', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/documents/automation-rules/${id}`,
    apiCall: (id) => documentAutomationApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
