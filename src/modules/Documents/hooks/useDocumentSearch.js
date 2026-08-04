import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { documentSearchApi } from '../api/documentSearch.api';

export function useDocumentSearch(params) {
  return useQuery({
    queryKey: ['documentSearch', params],
    queryFn: () => documentSearchApi.search(params),
    enabled: Boolean(params?.query || params?.regex || params?.category || params?.folder),
  });
}

export function useDocumentFolderSearch(query) {
  return useQuery({
    queryKey: ['documentFolderSearch', query],
    queryFn: () => documentSearchApi.searchFolders(query),
    enabled: Boolean(query),
  });
}

export function useSavedSearches() {
  return useQuery({ queryKey: ['documentSavedSearches'], queryFn: () => documentSearchApi.listSavedSearches() });
}

export function useCreateSavedSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => documentSearchApi.createSavedSearch(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documentSavedSearches'] }),
  });
}

export function useRunSavedSearch() {
  return useMutation({ mutationFn: (id) => documentSearchApi.runSavedSearch(id) });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => documentSearchApi.deleteSavedSearch(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documentSavedSearches'] }),
  });
}
