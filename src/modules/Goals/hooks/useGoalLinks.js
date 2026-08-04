import { useQuery, useQueryClient } from '@tanstack/react-query';
import { goalLinkApi } from '../api/goalLink.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const goalLinkKeys = {
  all: ['goalLinks'],
  forOwner: (ownerType, ownerId) => [...goalLinkKeys.all, 'owner', ownerType, ownerId],
  forLinked: (linkedType, linkedId) => [...goalLinkKeys.all, 'linked', linkedType, linkedId],
};

// A link changes the owner's rolled-up progress (task_based/habit_based/
// mixed modes read live linked-entity state at compute time), so every
// mutation invalidates the owner-side entity list alongside the link list
// itself.
function invalidateLinks(queryClient, ownerType) {
  queryClient.invalidateQueries({ queryKey: goalLinkKeys.all });
  if (ownerType === 'goal') queryClient.invalidateQueries({ queryKey: ['goals'] });
  if (ownerType === 'project') queryClient.invalidateQueries({ queryKey: ['projects'] });
  if (ownerType === 'milestone') queryClient.invalidateQueries({ queryKey: ['milestones'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useLinksForOwner(ownerType, ownerId) {
  return useQuery({
    queryKey: goalLinkKeys.forOwner(ownerType, ownerId),
    queryFn: () => goalLinkApi.listForOwner(ownerType, ownerId),
    enabled: Boolean(ownerType && ownerId),
  });
}

export function useLinksForLinked(linkedType, linkedId) {
  return useQuery({
    queryKey: goalLinkKeys.forLinked(linkedType, linkedId),
    queryFn: () => goalLinkApi.listForLinked(linkedType, linkedId),
    enabled: Boolean(linkedType && linkedId),
  });
}

export function useCreateGoalLink() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'goalLink', opType: 'create', method: 'POST', buildUrl: () => '/goal-links',
    apiCall: (payload) => goalLinkApi.link(payload),
    onSuccess: (_result, variables) => invalidateLinks(queryClient, variables.ownerType),
  });
}

export function useDeleteGoalLink() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'goalLink', opType: 'delete', method: 'DELETE', buildUrl: () => '/goal-links',
    apiCall: (payload) => goalLinkApi.unlink(payload),
    onSuccess: (_result, variables) => invalidateLinks(queryClient, variables.ownerType),
  });
}
