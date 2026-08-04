import { useQuery, useQueryClient } from '@tanstack/react-query';
import { templateApi } from '../api/template.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const templateKeys = {
  all: ['templates'],
  detail: (id) => [...templateKeys.all, 'detail', id],
};

function invalidateTemplates(queryClient) {
  queryClient.invalidateQueries({ queryKey: templateKeys.all });
}

export function useTemplateList() {
  return useQuery({ queryKey: templateKeys.all, queryFn: () => templateApi.list() });
}

export function useTemplate(id) {
  return useQuery({ queryKey: templateKeys.detail(id), queryFn: () => templateApi.getById(id), enabled: Boolean(id) });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'template', opType: 'create', method: 'POST', buildUrl: () => '/templates',
    apiCall: (payload) => templateApi.create(payload),
    onSuccess: () => invalidateTemplates(queryClient),
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'template', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/templates/${id}`,
    apiCall: ({ id, payload }) => templateApi.update(id, payload),
    onSuccess: () => invalidateTemplates(queryClient),
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'template', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/templates/${id}`,
    apiCall: (id) => templateApi.delete(id),
    onSuccess: () => invalidateTemplates(queryClient),
  });
}
