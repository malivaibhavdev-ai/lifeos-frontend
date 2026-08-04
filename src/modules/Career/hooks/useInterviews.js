import { useQuery, useQueryClient } from '@tanstack/react-query';
import { interviewApi } from '../api/interview.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const interviewKeys = {
  all: ['interviews'],
  list: (params) => [...interviewKeys.all, 'list', params],
  upcoming: (limit) => [...interviewKeys.all, 'upcoming', limit],
};

function invalidateInterviews(queryClient) {
  queryClient.invalidateQueries({ queryKey: interviewKeys.all });
  queryClient.invalidateQueries({ queryKey: ['careerHub'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useInterviewList(params) {
  return useQuery({ queryKey: interviewKeys.list(params), queryFn: () => interviewApi.list(params) });
}
export function useUpcomingInterviews(limit) {
  return useQuery({ queryKey: interviewKeys.upcoming(limit), queryFn: () => interviewApi.upcoming(limit) });
}
export function useCreateInterview() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'interview', opType: 'create', method: 'POST', buildUrl: () => '/interviews',
    apiCall: (payload) => interviewApi.create(payload),
    onSuccess: () => invalidateInterviews(queryClient),
  });
}
export function useUpdateInterview() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'interview', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/interviews/${id}`,
    apiCall: ({ id, ...payload }) => interviewApi.update(id, payload),
    onSuccess: () => invalidateInterviews(queryClient),
  });
}
export function useDeleteInterview() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'interview', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/interviews/${id}`,
    apiCall: (id) => interviewApi.delete(id),
    onSuccess: () => invalidateInterviews(queryClient),
  });
}
