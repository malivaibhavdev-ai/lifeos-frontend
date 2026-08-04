import { useQuery, useQueryClient } from '@tanstack/react-query';
import { lifeAreaApi } from '../api/lifeArea.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const lifeAreaKeys = {
  all: ['lifeAreas'],
  lists: () => [...lifeAreaKeys.all, 'list'],
  list: (params) => [...lifeAreaKeys.lists(), params],
  detail: (id) => [...lifeAreaKeys.all, 'detail', id],
};

function invalidateLifeAreas(queryClient) {
  queryClient.invalidateQueries({ queryKey: lifeAreaKeys.all });
}

export function useLifeAreaList(params) {
  return useQuery({ queryKey: lifeAreaKeys.list(params), queryFn: () => lifeAreaApi.list(params) });
}

export function useLifeArea(id) {
  return useQuery({ queryKey: lifeAreaKeys.detail(id), queryFn: () => lifeAreaApi.getById(id), enabled: Boolean(id) });
}

export function useCreateLifeArea() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'lifeArea', opType: 'create', method: 'POST', buildUrl: () => '/life-areas',
    apiCall: (payload) => lifeAreaApi.create(payload),
    onSuccess: () => invalidateLifeAreas(queryClient),
  });
}

export function useUpdateLifeArea() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'lifeArea', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/life-areas/${id}`,
    apiCall: ({ id, payload }) => lifeAreaApi.update(id, payload),
    onSuccess: () => invalidateLifeAreas(queryClient),
  });
}

export function useDeleteLifeArea() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'lifeArea', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/life-areas/${id}`,
    apiCall: (id) => lifeAreaApi.delete(id),
    onSuccess: () => invalidateLifeAreas(queryClient),
  });
}

export function useReorderLifeAreas() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'lifeArea', opType: 'update', method: 'PATCH', buildUrl: () => '/life-areas/reorder',
    apiCall: (items) => lifeAreaApi.reorder(items),
    onSuccess: () => invalidateLifeAreas(queryClient),
  });
}
