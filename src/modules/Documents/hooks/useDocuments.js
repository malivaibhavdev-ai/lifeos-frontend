import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { documentApi } from '../api/document.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const documentKeys = {
  all: ['documents'],
  list: (params) => [...documentKeys.all, 'list', params],
  trash: (params) => [...documentKeys.all, 'trash', params],
  detail: (id) => [...documentKeys.all, 'detail', id],
  duplicates: () => [...documentKeys.all, 'duplicates'],
  versions: (id) => [...documentKeys.all, 'versions', id],
};

function invalidate(queryClient) {
  queryClient.invalidateQueries({ queryKey: documentKeys.all });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useDocuments(params) {
  return useQuery({ queryKey: documentKeys.list(params), queryFn: () => documentApi.list(params) });
}

export function useDocument(id) {
  return useQuery({ queryKey: documentKeys.detail(id), queryFn: () => documentApi.getById(id), enabled: Boolean(id) });
}

export function useDocumentTrash(params) {
  return useQuery({ queryKey: documentKeys.trash(params), queryFn: () => documentApi.trash(params) });
}

export function useDocumentDuplicates() {
  return useQuery({ queryKey: documentKeys.duplicates(), queryFn: () => documentApi.duplicates() });
}

export function useDocumentVersions(id) {
  return useQuery({ queryKey: documentKeys.versions(id), queryFn: () => documentApi.listVersions(id), enabled: Boolean(id) });
}

// Uploads (multipart) can't go through the JSON offline-mutation queue —
// same reasoning as Family's useUploadFamilyDocument — so these stay plain
// useMutation and simply require a live connection.
export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (formData) => documentApi.create(formData), onSuccess: () => invalidate(queryClient) });
}

export function useUploadDocumentVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => documentApi.uploadVersion(id, formData),
    onSuccess: (_, { id }) => {
      invalidate(queryClient);
      queryClient.invalidateQueries({ queryKey: documentKeys.versions(id) });
    },
  });
}

export function useRestoreVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, versionNumber }) => documentApi.restoreVersion(id, versionNumber),
    onSuccess: (_, { id }) => {
      invalidate(queryClient);
      queryClient.invalidateQueries({ queryKey: documentKeys.versions(id) });
    },
  });
}

export function useCompareVersions(id, a, b) {
  return useQuery({
    queryKey: [...documentKeys.versions(id), 'compare', a, b],
    queryFn: () => documentApi.compareVersions(id, a, b),
    enabled: Boolean(id && a && b),
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'document', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/documents/${id}`,
    apiCall: ({ id, payload }) => documentApi.update(id, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'document', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/documents/${id}`,
    apiCall: (id) => documentApi.delete(id),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useRestoreDocument() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id) => documentApi.restore(id), onSuccess: () => invalidate(queryClient) });
}

export function usePermanentlyDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id) => documentApi.permanentlyDelete(id), onSuccess: () => invalidate(queryClient) });
}

export function useSetDocumentFavorite() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'document', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/documents/${id}/favorite`,
    apiCall: ({ id, value }) => documentApi.setFavorite(id, value),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useSetDocumentPinned() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'document', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/documents/${id}/pin`,
    apiCall: ({ id, value }) => documentApi.setPinned(id, value),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useSetDocumentArchived() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'document', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/documents/${id}/archive`,
    apiCall: ({ id, value }) => documentApi.setArchived(id, value),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useSetDocumentLock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, password }) => documentApi.setLock(id, password),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useVerifyDocumentLock() {
  return useMutation({ mutationFn: ({ id, password }) => documentApi.verifyLock(id, password) });
}

export function useMoveDocument() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'document', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/documents/${id}/move`,
    apiCall: ({ id, folder }) => documentApi.move(id, folder),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useCopyDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, folder }) => documentApi.copy(id, folder),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useRecordDocumentDownload() {
  return useMutation({ mutationFn: (id) => documentApi.recordDownload(id) });
}

export function useBulkMoveDocuments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, folder }) => documentApi.bulkMove(ids, folder),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useBulkTagDocuments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, tags }) => documentApi.bulkTag(ids, tags),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useBulkArchiveDocuments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, isArchived }) => documentApi.bulkArchive(ids, isArchived),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useBulkDeleteDocuments() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (ids) => documentApi.bulkDelete(ids), onSuccess: () => invalidate(queryClient) });
}
