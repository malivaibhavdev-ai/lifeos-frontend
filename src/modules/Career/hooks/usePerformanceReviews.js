import { useQuery, useQueryClient } from '@tanstack/react-query';
import { performanceReviewApi } from '../api/performanceReview.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const performanceReviewKeys = { all: ['performanceReviews'], list: () => [...performanceReviewKeys.all, 'list'] };

function invalidatePerformanceReviews(queryClient) {
  queryClient.invalidateQueries({ queryKey: performanceReviewKeys.all });
  queryClient.invalidateQueries({ queryKey: ['careerHub'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function usePerformanceReviewList() {
  return useQuery({ queryKey: performanceReviewKeys.list(), queryFn: () => performanceReviewApi.list() });
}
export function useCreatePerformanceReview() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'performanceReview', opType: 'create', method: 'POST', buildUrl: () => '/performance-reviews',
    apiCall: (payload) => performanceReviewApi.create(payload),
    onSuccess: () => invalidatePerformanceReviews(queryClient),
  });
}
export function useUpdatePerformanceReview() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'performanceReview', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/performance-reviews/${id}`,
    apiCall: ({ id, ...payload }) => performanceReviewApi.update(id, payload),
    onSuccess: () => invalidatePerformanceReviews(queryClient),
  });
}
export function useDeletePerformanceReview() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'performanceReview', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/performance-reviews/${id}`,
    apiCall: (id) => performanceReviewApi.delete(id),
    onSuccess: () => invalidatePerformanceReviews(queryClient),
  });
}
