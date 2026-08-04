import { useQuery, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../api/project.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const projectKeys = {
  all: ['projects'],
  lists: () => [...projectKeys.all, 'list'],
  list: (params) => [...projectKeys.lists(), params],
  detail: (id) => [...projectKeys.all, 'detail', id],
};

function invalidateProjects(queryClient) {
  queryClient.invalidateQueries({ queryKey: projectKeys.all });
  // A project's progress rolls up into its parent Goal, and feeds the
  // Dashboard's projectsAtRisk — both need a fresh read after any change.
  queryClient.invalidateQueries({ queryKey: ['goals'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useProjectList(params) {
  return useQuery({ queryKey: projectKeys.list(params), queryFn: () => projectApi.list(params) });
}

export function useProject(id) {
  return useQuery({ queryKey: projectKeys.detail(id), queryFn: () => projectApi.getById(id), enabled: Boolean(id) });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'project', opType: 'create', method: 'POST', buildUrl: () => '/projects',
    apiCall: (payload) => projectApi.create(payload),
    onSuccess: () => invalidateProjects(queryClient),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'project', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/projects/${id}`,
    apiCall: ({ id, payload }) => projectApi.update(id, payload),
    onSuccess: () => invalidateProjects(queryClient),
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'project', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/projects/${id}/archive`,
    apiCall: ({ id, isArchived }) => projectApi.archive(id, isArchived),
    onSuccess: () => invalidateProjects(queryClient),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'project', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/projects/${id}`,
    apiCall: (id) => projectApi.delete(id),
    onSuccess: () => invalidateProjects(queryClient),
  });
}

export function useReorderProjects() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'project', opType: 'update', method: 'PATCH', buildUrl: () => '/projects/reorder',
    apiCall: (items) => projectApi.reorder(items),
    onSuccess: () => invalidateProjects(queryClient),
  });
}

export function useRecalculateProjectProgress() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'project', opType: 'update', method: 'POST', buildUrl: ({ id }) => `/projects/${id}/recalculate-progress`,
    apiCall: ({ id }) => projectApi.recalculateProgress(id),
    onSuccess: () => invalidateProjects(queryClient),
  });
}
