import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { analyticsSearchApi } from '../api/analyticsSearch.api';

export function useAnalyticsSearch(query) {
  return useQuery({
    queryKey: ['analyticsSearch', query],
    queryFn: () => analyticsSearchApi.search(query),
    enabled: Boolean(query),
  });
}

export function useSavedFilters() {
  return useQuery({ queryKey: ['analyticsSavedFilters'], queryFn: () => analyticsSearchApi.listSavedFilters() });
}

export function useCreateSavedFilter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => analyticsSearchApi.createSavedFilter(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['analyticsSavedFilters'] }),
  });
}

export function useDeleteSavedFilter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => analyticsSearchApi.deleteSavedFilter(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['analyticsSavedFilters'] }),
  });
}
