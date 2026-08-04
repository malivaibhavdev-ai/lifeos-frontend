import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { choreApi } from '../api/chore.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const choreKeys = {
  all: (householdId) => ['chores', householdId],
  list: (householdId, params) => [...choreKeys.all(householdId), 'list', params],
  detail: (householdId, id) => [...choreKeys.all(householdId), 'detail', id],
  completions: (householdId, params) => [...choreKeys.all(householdId), 'completions', params],
  leaderboard: (householdId, params) => [...choreKeys.all(householdId), 'leaderboard', params],
};

function invalidate(queryClient, householdId) {
  queryClient.invalidateQueries({ queryKey: choreKeys.all(householdId) });
  queryClient.invalidateQueries({ queryKey: ['family', householdId, 'dashboard'] });
}

export function useChores(householdId, params) {
  return useQuery({ queryKey: choreKeys.list(householdId, params), queryFn: () => choreApi.list(householdId, params), enabled: Boolean(householdId) });
}

export function useChore(householdId, id) {
  return useQuery({
    queryKey: choreKeys.detail(householdId, id),
    queryFn: () => choreApi.getById(householdId, id),
    enabled: Boolean(householdId && id),
  });
}

export function useChoreCompletions(householdId, params) {
  return useQuery({
    queryKey: choreKeys.completions(householdId, params),
    queryFn: () => choreApi.listCompletions(householdId, params),
    enabled: Boolean(householdId),
  });
}

export function useChoreLeaderboard(householdId, params) {
  return useQuery({
    queryKey: choreKeys.leaderboard(householdId, params),
    queryFn: () => choreApi.leaderboard(householdId, params),
    enabled: Boolean(householdId),
  });
}

export function useCreateChore(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'chore', opType: 'create', method: 'POST', buildUrl: () => `/family/${householdId}/chores`,
    apiCall: (payload) => choreApi.create(householdId, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useUpdateChore(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'chore', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/family/${householdId}/chores/${id}`,
    apiCall: ({ id, payload }) => choreApi.update(householdId, id, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useDeleteChore(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'chore', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/family/${householdId}/chores/${id}`,
    apiCall: (id) => choreApi.delete(householdId, id),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useLogChoreCompletion(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => choreApi.logCompletion(householdId, id, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}
