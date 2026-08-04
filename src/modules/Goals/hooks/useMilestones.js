import { useQuery, useQueryClient } from '@tanstack/react-query';
import { milestoneApi } from '../api/milestone.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const milestoneKeys = {
  all: ['milestones'],
  lists: () => [...milestoneKeys.all, 'list'],
  list: (params) => [...milestoneKeys.lists(), params],
  detail: (id) => [...milestoneKeys.all, 'detail', id],
  dependencies: (id) => [...milestoneKeys.all, 'dependencies', id],
};

function invalidateMilestones(queryClient) {
  queryClient.invalidateQueries({ queryKey: milestoneKeys.all });
  queryClient.invalidateQueries({ queryKey: ['projects'] });
  queryClient.invalidateQueries({ queryKey: ['goals'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useMilestoneList(params) {
  return useQuery({ queryKey: milestoneKeys.list(params), queryFn: () => milestoneApi.list(params) });
}

export function useMilestone(id) {
  return useQuery({ queryKey: milestoneKeys.detail(id), queryFn: () => milestoneApi.getById(id), enabled: Boolean(id) });
}

export function useMilestoneDependencyStatus(id) {
  return useQuery({
    queryKey: milestoneKeys.dependencies(id),
    queryFn: () => milestoneApi.getDependencyStatus(id),
    enabled: Boolean(id),
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'milestone', opType: 'create', method: 'POST', buildUrl: () => '/milestones',
    apiCall: (payload) => milestoneApi.create(payload),
    onSuccess: () => invalidateMilestones(queryClient),
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'milestone', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/milestones/${id}`,
    apiCall: ({ id, payload }) => milestoneApi.update(id, payload),
    onSuccess: () => invalidateMilestones(queryClient),
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'milestone', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/milestones/${id}`,
    apiCall: (id) => milestoneApi.delete(id),
    onSuccess: () => invalidateMilestones(queryClient),
  });
}

export function useReorderMilestones() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'milestone', opType: 'update', method: 'PATCH', buildUrl: () => '/milestones/reorder',
    apiCall: (items) => milestoneApi.reorder(items),
    onSuccess: () => invalidateMilestones(queryClient),
  });
}
