import { useQuery, useQueryClient } from '@tanstack/react-query';
import { knowledgeLinkApi } from '../api/knowledgeLink.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const knowledgeLinkKeys = {
  all: ['knowledgeLinks'],
  forOwner: (ownerType, ownerId) => [...knowledgeLinkKeys.all, 'owner', ownerType, ownerId],
  forLinked: (linkedType, linkedId) => [...knowledgeLinkKeys.all, 'linked', linkedType, linkedId],
};

function invalidateLinks(queryClient) {
  queryClient.invalidateQueries({ queryKey: knowledgeLinkKeys.all });
}

// "What this note links to" — outgoing [[wiki links]] and entity mentions.
export function useLinksForOwner(ownerType, ownerId) {
  return useQuery({
    queryKey: knowledgeLinkKeys.forOwner(ownerType, ownerId),
    queryFn: () => knowledgeLinkApi.listForOwner(ownerType, ownerId),
    enabled: Boolean(ownerType && ownerId),
  });
}

// "What links to this note/task/goal/..." — the backlinks panel.
export function useBacklinks(linkedType, linkedId) {
  return useQuery({
    queryKey: knowledgeLinkKeys.forLinked(linkedType, linkedId),
    queryFn: () => knowledgeLinkApi.listForLinked(linkedType, linkedId),
    enabled: Boolean(linkedType && linkedId),
  });
}

export function useCreateKnowledgeLink() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'knowledgeLink', opType: 'create', method: 'POST', buildUrl: () => '/knowledge-links',
    apiCall: (payload) => knowledgeLinkApi.link(payload),
    onSuccess: () => invalidateLinks(queryClient),
  });
}

export function useDeleteKnowledgeLink() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'knowledgeLink', opType: 'delete', method: 'DELETE', buildUrl: () => '/knowledge-links',
    apiCall: (payload) => knowledgeLinkApi.unlink(payload),
    onSuccess: () => invalidateLinks(queryClient),
  });
}
