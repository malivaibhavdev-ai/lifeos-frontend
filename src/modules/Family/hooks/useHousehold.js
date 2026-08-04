import { useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { householdApi } from '../api/household.api';
import { useActiveHouseholdStore } from '../store/activeHouseholdStore';

export const householdKeys = {
  all: ['households'],
  mine: () => [...householdKeys.all, 'mine'],
  detail: (id) => [...householdKeys.all, 'detail', id],
  members: (id) => [...householdKeys.all, 'members', id],
  invitations: (id) => [...householdKeys.all, 'invitations', id],
};

function invalidateHouseholds(queryClient) {
  queryClient.invalidateQueries({ queryKey: householdKeys.all });
}

export function useMyHouseholds() {
  return useQuery({ queryKey: householdKeys.mine(), queryFn: () => householdApi.listMine() });
}

// Resolves the active household, auto-selecting the user's first household
// if none has been explicitly chosen yet (the common single-household case
// shouldn't force a picker screen).
export function useActiveHousehold() {
  const { data: households, isLoading } = useMyHouseholds();
  const activeHouseholdId = useActiveHouseholdStore((s) => s.activeHouseholdId);
  const setActiveHouseholdId = useActiveHouseholdStore((s) => s.setActiveHouseholdId);

  useEffect(() => {
    if (!activeHouseholdId && households?.length) {
      setActiveHouseholdId(households[0]._id);
    }
  }, [activeHouseholdId, households, setActiveHouseholdId]);

  const resolvedId = activeHouseholdId && households?.some((h) => h._id === activeHouseholdId)
    ? activeHouseholdId
    : households?.[0]?._id ?? null;

  return {
    householdId: resolvedId,
    household: households?.find((h) => h._id === resolvedId) ?? null,
    households: households ?? [],
    isLoading,
    hasNoHousehold: !isLoading && (households ?? []).length === 0,
  };
}

export function useHousehold(id) {
  return useQuery({ queryKey: householdKeys.detail(id), queryFn: () => householdApi.getById(id), enabled: Boolean(id) });
}

export function useHouseholdMembers(id) {
  return useQuery({ queryKey: householdKeys.members(id), queryFn: () => householdApi.listMembers(id), enabled: Boolean(id) });
}

export function usePendingInvitations(id) {
  return useQuery({
    queryKey: householdKeys.invitations(id),
    queryFn: () => householdApi.listPendingInvitations(id),
    enabled: Boolean(id),
  });
}

export function useCreateHousehold() {
  const queryClient = useQueryClient();
  const setActiveHouseholdId = useActiveHouseholdStore((s) => s.setActiveHouseholdId);
  return useMutation({
    mutationFn: (payload) => householdApi.create(payload),
    onSuccess: (household) => {
      invalidateHouseholds(queryClient);
      setActiveHouseholdId(household._id);
    },
  });
}

export function useUpdateHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => householdApi.update(id, payload),
    onSuccess: () => invalidateHouseholds(queryClient),
  });
}

export function useLeaveHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => householdApi.leave(id),
    onSuccess: () => invalidateHouseholds(queryClient),
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => householdApi.invite(id, payload),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: householdKeys.invitations(id) }),
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, invitationId }) => householdApi.revokeInvitation(id, invitationId),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: householdKeys.invitations(id) }),
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  const setActiveHouseholdId = useActiveHouseholdStore((s) => s.setActiveHouseholdId);
  return useMutation({
    mutationFn: (token) => householdApi.acceptInvitation(token),
    onSuccess: (membership) => {
      invalidateHouseholds(queryClient);
      setActiveHouseholdId(membership.household);
    },
  });
}

export function useDeclineInvitation() {
  return useMutation({ mutationFn: (token) => householdApi.declineInvitation(token) });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, memberId, role }) => householdApi.updateMemberRole(id, memberId, role),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: householdKeys.members(id) }),
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, memberId }) => householdApi.removeMember(id, memberId),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: householdKeys.members(id) }),
  });
}

export function useAddEmergencyChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, label }) => householdApi.addEmergencyChecklistItem(id, label),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: householdKeys.detail(id) }),
  });
}

export function useToggleEmergencyChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, itemId, isDone }) => householdApi.toggleEmergencyChecklistItem(id, itemId, isDone),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: householdKeys.detail(id) }),
  });
}
