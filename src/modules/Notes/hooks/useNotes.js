import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { noteApi } from '../api/note.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const noteKeys = {
  all: ['notes'],
  lists: () => [...noteKeys.all, 'list'],
  list: (params) => [...noteKeys.lists(), params],
  detail: (id) => [...noteKeys.all, 'detail', id],
  meta: () => [...noteKeys.all, 'meta'],
};

function invalidateNotes(queryClient) {
  queryClient.invalidateQueries({ queryKey: noteKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useNoteList(params) {
  return useQuery({ queryKey: noteKeys.list(params), queryFn: () => noteApi.list(params), placeholderData: (prev) => prev });
}

export function useNote(id) {
  return useQuery({ queryKey: noteKeys.detail(id), queryFn: () => noteApi.getById(id), enabled: Boolean(id) });
}

export function useNoteMeta() {
  return useQuery({ queryKey: noteKeys.meta(), queryFn: () => noteApi.meta() });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'note', opType: 'create', method: 'POST', buildUrl: () => '/notes',
    apiCall: (payload) => noteApi.create(payload),
    onSuccess: () => invalidateNotes(queryClient),
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'note', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/notes/${id}`,
    apiCall: ({ id, payload }) => noteApi.update(id, payload),
    onSuccess: () => invalidateNotes(queryClient),
  });
}

export function useTrashNote() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'note', opType: 'update', method: 'PATCH', buildUrl: (id) => `/notes/${id}/trash`,
    apiCall: (id) => noteApi.trash(id),
    onSuccess: () => invalidateNotes(queryClient),
  });
}

export function useRestoreNote() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'note', opType: 'update', method: 'PATCH', buildUrl: (id) => `/notes/${id}/restore`,
    apiCall: (id) => noteApi.restore(id),
    onSuccess: () => invalidateNotes(queryClient),
  });
}

export function useDestroyNote() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'note', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/notes/${id}`,
    apiCall: (id) => noteApi.destroy(id),
    onSuccess: () => invalidateNotes(queryClient),
  });
}

// File upload isn't offline-queueable (the file itself has to actually
// reach the server to get a URL back) — plain useMutation, same rationale
// as any other network-required-now action.
export function useUploadNoteAttachment() {
  return useMutation({
    mutationFn: (file) => noteApi.uploadAttachment(file),
  });
}
