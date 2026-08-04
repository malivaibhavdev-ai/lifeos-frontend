import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { dreamRegistryApi } from '../api/dreamRegistry.api';

export const dreamRegistryKeys = {
  all: (kind) => ['dreams', 'registry', kind],
  list: (kind, params) => [...dreamRegistryKeys.all(kind), 'list', params],
  detail: (kind, id) => [...dreamRegistryKeys.all(kind), 'detail', id],
};

export function useDreamRegistryList(kind, params) {
  return useQuery({ queryKey: dreamRegistryKeys.list(kind, params), queryFn: () => dreamRegistryApi.list(kind, params) });
}

export function useDreamRegistryItem(kind, id) {
  return useQuery({
    queryKey: dreamRegistryKeys.detail(kind, id),
    queryFn: () => dreamRegistryApi.getById(kind, id),
    enabled: Boolean(id),
  });
}

export function useUpdateDreamRegistryItem(kind) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => dreamRegistryApi.update(kind, id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dreamRegistryKeys.all(kind) }),
  });
}
