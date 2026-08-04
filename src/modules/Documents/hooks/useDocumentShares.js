import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { documentShareApi } from '../api/documentShare.api';

export const documentShareKeys = {
  all: (documentId) => ['documentShares', documentId],
  sharedWithMe: () => ['documentShares', 'sharedWithMe'],
};

export function useDocumentShares(documentId) {
  return useQuery({
    queryKey: documentShareKeys.all(documentId),
    queryFn: () => documentShareApi.list(documentId),
    enabled: Boolean(documentId),
  });
}

export function useSharedWithMe() {
  return useQuery({ queryKey: documentShareKeys.sharedWithMe(), queryFn: () => documentShareApi.sharedWithMe() });
}

export function useCreateDocumentShare(documentId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => documentShareApi.create(documentId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentShareKeys.all(documentId) }),
  });
}

export function useCreatePublicLink(documentId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => documentShareApi.createPublicLink(documentId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentShareKeys.all(documentId) }),
  });
}

export function useRevokeDocumentShare(documentId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shareId) => documentShareApi.revoke(documentId, shareId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentShareKeys.all(documentId) }),
  });
}

export function useResolvePublicLink(token) {
  return useQuery({
    queryKey: ['documentPublicLink', token],
    queryFn: () => documentShareApi.resolvePublicLink(token),
    enabled: Boolean(token),
  });
}
