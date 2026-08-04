import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { documentFolderApi } from '../api/documentFolder.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const documentFolderKeys = {
  all: ['documentFolders'],
  list: (params) => [...documentFolderKeys.all, 'list', params],
  tree: () => [...documentFolderKeys.all, 'tree'],
  detail: (id) => [...documentFolderKeys.all, 'detail', id],
  stats: (id) => [...documentFolderKeys.all, 'stats', id],
};

function invalidate(queryClient) {
  queryClient.invalidateQueries({ queryKey: documentFolderKeys.all });
}

export function useDocumentFolders(params) {
  return useQuery({ queryKey: documentFolderKeys.list(params), queryFn: () => documentFolderApi.list(params) });
}

export function useDocumentFolderTree() {
  return useQuery({ queryKey: documentFolderKeys.tree(), queryFn: () => documentFolderApi.tree() });
}

export function useDocumentFolder(id) {
  return useQuery({ queryKey: documentFolderKeys.detail(id), queryFn: () => documentFolderApi.getById(id), enabled: Boolean(id) });
}

export function useDocumentFolderStats(id) {
  return useQuery({ queryKey: documentFolderKeys.stats(id), queryFn: () => documentFolderApi.stats(id), enabled: Boolean(id) });
}

export function useCreateDocumentFolder() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'documentFolder', opType: 'create', method: 'POST', buildUrl: () => '/documents/folders',
    apiCall: (payload) => documentFolderApi.create(payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateDocumentFolder() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'documentFolder', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/documents/folders/${id}`,
    apiCall: ({ id, payload }) => documentFolderApi.update(id, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteDocumentFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, force }) => documentFolderApi.delete(id, force),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useMoveDocumentFolder() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'documentFolder', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/documents/folders/${id}/move`,
    apiCall: ({ id, parent }) => documentFolderApi.move(id, parent),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useSetFolderPinned() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'documentFolder', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/documents/folders/${id}/pin`,
    apiCall: ({ id, value }) => documentFolderApi.setPinned(id, value),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useSetFolderFavorite() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'documentFolder', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/documents/folders/${id}/favorite`,
    apiCall: ({ id, value }) => documentFolderApi.setFavorite(id, value),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useSetFolderHidden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value }) => documentFolderApi.setHidden(id, value),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useSetFolderArchived() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'documentFolder', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/documents/folders/${id}/archive`,
    apiCall: ({ id, value }) => documentFolderApi.setArchived(id, value),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useSetFolderLock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, password }) => documentFolderApi.setLock(id, password),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useVerifyFolderLock() {
  return useMutation({ mutationFn: ({ id, password }) => documentFolderApi.verifyLock(id, password) });
}
