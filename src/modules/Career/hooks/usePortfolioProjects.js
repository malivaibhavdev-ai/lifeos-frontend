import { useQuery, useQueryClient } from '@tanstack/react-query';
import { portfolioProjectApi } from '../api/portfolioProject.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const portfolioProjectKeys = { all: ['portfolioProjects'], list: (params) => [...portfolioProjectKeys.all, 'list', params] };

function invalidatePortfolioProjects(queryClient) {
  queryClient.invalidateQueries({ queryKey: portfolioProjectKeys.all });
  queryClient.invalidateQueries({ queryKey: ['careerHub'] });
}

export function usePortfolioProjectList(params) {
  return useQuery({ queryKey: portfolioProjectKeys.list(params), queryFn: () => portfolioProjectApi.list(params) });
}
export function useCreatePortfolioProject() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'portfolioProject', opType: 'create', method: 'POST', buildUrl: () => '/portfolio-projects',
    apiCall: (payload) => portfolioProjectApi.create(payload),
    onSuccess: () => invalidatePortfolioProjects(queryClient),
  });
}
export function useUpdatePortfolioProject() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'portfolioProject', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/portfolio-projects/${id}`,
    apiCall: ({ id, ...payload }) => portfolioProjectApi.update(id, payload),
    onSuccess: () => invalidatePortfolioProjects(queryClient),
  });
}
export function useDeletePortfolioProject() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'portfolioProject', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/portfolio-projects/${id}`,
    apiCall: (id) => portfolioProjectApi.delete(id),
    onSuccess: () => invalidatePortfolioProjects(queryClient),
  });
}
