import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notebookApi } from '../api/notebook.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const notebookKeys = {
  all: ['notebooks'],
  lists: () => [...notebookKeys.all, 'list'],
  list: (params) => [...notebookKeys.lists(), params],
  detail: (id) => [...notebookKeys.all, 'detail', id],
};

function invalidateNotebooks(queryClient) {
  queryClient.invalidateQueries({ queryKey: notebookKeys.all });
}

export function useNotebookList(params) {
  return useQuery({ queryKey: notebookKeys.list(params), queryFn: () => notebookApi.list(params) });
}

export function useNotebook(id) {
  return useQuery({ queryKey: notebookKeys.detail(id), queryFn: () => notebookApi.getById(id), enabled: Boolean(id) });
}

export function useCreateNotebook() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'notebook', opType: 'create', method: 'POST', buildUrl: () => '/notebooks',
    apiCall: (payload) => notebookApi.create(payload),
    onSuccess: () => invalidateNotebooks(queryClient),
  });
}

export function useUpdateNotebook() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'notebook', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/notebooks/${id}`,
    apiCall: ({ id, payload }) => notebookApi.update(id, payload),
    onSuccess: () => invalidateNotebooks(queryClient),
  });
}

export function useDeleteNotebook() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'notebook', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/notebooks/${id}`,
    apiCall: (id) => notebookApi.delete(id),
    onSuccess: () => invalidateNotebooks(queryClient),
  });
}

export function useReorderNotebooks() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'notebook', opType: 'update', method: 'PATCH', buildUrl: () => '/notebooks/reorder',
    apiCall: (items) => notebookApi.reorder(items),
    onSuccess: () => invalidateNotebooks(queryClient),
  });
}
