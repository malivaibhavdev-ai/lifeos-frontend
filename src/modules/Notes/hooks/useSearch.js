import { useQuery, useQueryClient } from '@tanstack/react-query';
import { searchApi, savedSearchApi } from '../api/search.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const searchKeys = {
  all: ['search'],
  query: (q, types) => [...searchKeys.all, q, types],
};

export const savedSearchKeys = {
  all: ['savedSearches'],
};

export function useSearch(q, types) {
  return useQuery({
    queryKey: searchKeys.query(q, types),
    queryFn: () => searchApi.search(q, types),
    enabled: Boolean(q && q.trim().length > 0),
  });
}

export function useSavedSearchList() {
  return useQuery({ queryKey: savedSearchKeys.all, queryFn: () => savedSearchApi.list() });
}

export function useCreateSavedSearch() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'savedSearch', opType: 'create', method: 'POST', buildUrl: () => '/saved-searches',
    apiCall: (payload) => savedSearchApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: savedSearchKeys.all }),
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'savedSearch', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/saved-searches/${id}`,
    apiCall: (id) => savedSearchApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: savedSearchKeys.all }),
  });
}
