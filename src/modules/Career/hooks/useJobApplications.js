import { useQuery, useQueryClient } from '@tanstack/react-query';
import { jobApplicationApi } from '../api/jobApplication.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const jobApplicationKeys = {
  all: ['jobApplications'],
  list: (params) => [...jobApplicationKeys.all, 'list', params],
  funnel: () => [...jobApplicationKeys.all, 'funnel'],
};

function invalidateJobApplications(queryClient) {
  queryClient.invalidateQueries({ queryKey: jobApplicationKeys.all });
  queryClient.invalidateQueries({ queryKey: ['careerHub'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useJobApplicationList(params) {
  return useQuery({ queryKey: jobApplicationKeys.list(params), queryFn: () => jobApplicationApi.list(params) });
}
export function useJobApplicationFunnel() {
  return useQuery({ queryKey: jobApplicationKeys.funnel(), queryFn: () => jobApplicationApi.funnel() });
}
export function useCreateJobApplication() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'jobApplication', opType: 'create', method: 'POST', buildUrl: () => '/job-applications',
    apiCall: (payload) => jobApplicationApi.create(payload),
    onSuccess: () => invalidateJobApplications(queryClient),
  });
}
export function useUpdateJobApplication() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'jobApplication', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/job-applications/${id}`,
    apiCall: ({ id, ...payload }) => jobApplicationApi.update(id, payload),
    onSuccess: () => invalidateJobApplications(queryClient),
  });
}
export function useUpdateJobApplicationStatus() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'jobApplication', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/job-applications/${id}/status`,
    apiCall: ({ id, status, note }) => jobApplicationApi.updateStatus(id, status, note),
    onSuccess: () => invalidateJobApplications(queryClient),
  });
}
export function useDeleteJobApplication() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'jobApplication', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/job-applications/${id}`,
    apiCall: (id) => jobApplicationApi.delete(id),
    onSuccess: () => invalidateJobApplications(queryClient),
  });
}
