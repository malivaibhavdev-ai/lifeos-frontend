import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { familyGoalApi } from '../api/familyGoal.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const familyGoalKeys = {
  all: (householdId) => ['familyGoals', householdId],
  list: (householdId, params) => [...familyGoalKeys.all(householdId), 'list', params],
  detail: (householdId, id) => [...familyGoalKeys.all(householdId), 'detail', id],
};

function invalidate(queryClient, householdId) {
  queryClient.invalidateQueries({ queryKey: familyGoalKeys.all(householdId) });
  queryClient.invalidateQueries({ queryKey: ['family', householdId, 'dashboard'] });
}

export function useFamilyGoals(householdId, params) {
  return useQuery({
    queryKey: familyGoalKeys.list(householdId, params),
    queryFn: () => familyGoalApi.list(householdId, params),
    enabled: Boolean(householdId),
  });
}

export function useFamilyGoal(householdId, id) {
  return useQuery({
    queryKey: familyGoalKeys.detail(householdId, id),
    queryFn: () => familyGoalApi.getById(householdId, id),
    enabled: Boolean(householdId && id),
  });
}

export function useCreateFamilyGoal(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyGoal', opType: 'create', method: 'POST', buildUrl: () => `/family/${householdId}/goals`,
    apiCall: (payload) => familyGoalApi.create(householdId, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useUpdateFamilyGoal(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyGoal', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/family/${householdId}/goals/${id}`,
    apiCall: ({ id, payload }) => familyGoalApi.update(householdId, id, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useDeleteFamilyGoal(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyGoal', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/family/${householdId}/goals/${id}`,
    apiCall: (id) => familyGoalApi.delete(householdId, id),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useAddContribution(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => familyGoalApi.addContribution(householdId, id, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useToggleGoalMilestone(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, milestoneId, isCompleted }) => familyGoalApi.toggleMilestone(householdId, id, milestoneId, isCompleted),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}
