import { useQuery, useQueryClient } from '@tanstack/react-query';
import { goalApi } from '../api/goal.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const goalKeys = {
  all: ['goals'],
  lists: () => [...goalKeys.all, 'list'],
  list: (params) => [...goalKeys.lists(), params],
  detail: (id) => [...goalKeys.all, 'detail', id],
  insights: (id) => [...goalKeys.all, 'insights', id],
};

// Goal progress rolls up from Projects/Milestones and feeds the Dashboard's
// goalsProgress/upcomingMilestones/projectsAtRisk — any goal mutation can
// move all three, so every mutation below invalidates both.
function invalidateGoals(queryClient) {
  queryClient.invalidateQueries({ queryKey: goalKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useGoalList(params) {
  return useQuery({ queryKey: goalKeys.list(params), queryFn: () => goalApi.list(params) });
}

export function useGoal(id) {
  return useQuery({ queryKey: goalKeys.detail(id), queryFn: () => goalApi.getById(id), enabled: Boolean(id) });
}

export function useGoalInsights(id) {
  return useQuery({ queryKey: goalKeys.insights(id), queryFn: () => goalApi.getInsights(id), enabled: Boolean(id) });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'goal', opType: 'create', method: 'POST', buildUrl: () => '/goals',
    apiCall: (payload) => goalApi.create(payload),
    onSuccess: () => invalidateGoals(queryClient),
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'goal', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/goals/${id}`,
    apiCall: ({ id, payload }) => goalApi.update(id, payload),
    onSuccess: () => invalidateGoals(queryClient),
  });
}

export function useArchiveGoal() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'goal', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/goals/${id}/archive`,
    apiCall: ({ id, isArchived }) => goalApi.archive(id, isArchived),
    onSuccess: () => invalidateGoals(queryClient),
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'goal', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/goals/${id}`,
    apiCall: (id) => goalApi.delete(id),
    onSuccess: () => invalidateGoals(queryClient),
  });
}

export function useReorderGoals() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'goal', opType: 'update', method: 'PATCH', buildUrl: () => '/goals/reorder',
    apiCall: (items) => goalApi.reorder(items),
    onSuccess: () => invalidateGoals(queryClient),
  });
}

export function useRecalculateGoalProgress() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'goal', opType: 'update', method: 'POST', buildUrl: ({ id }) => `/goals/${id}/recalculate-progress`,
    apiCall: ({ id }) => goalApi.recalculateProgress(id),
    onSuccess: () => invalidateGoals(queryClient),
  });
}

export function useSetKeyResultValue() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'goal', opType: 'update', method: 'PATCH',
    buildUrl: ({ id, keyResultId }) => `/goals/${id}/key-results/${keyResultId}`,
    apiCall: ({ id, keyResultId, currentValue }) => goalApi.setKeyResultValue(id, keyResultId, currentValue),
    onSuccess: () => invalidateGoals(queryClient),
  });
}
