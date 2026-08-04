import { useQuery, useQueryClient } from '@tanstack/react-query';
import { visionApi } from '../api/vision.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const visionKeys = {
  all: ['visions'],
  lists: () => [...visionKeys.all, 'list'],
  list: (params) => [...visionKeys.lists(), params],
  detail: (id) => [...visionKeys.all, 'detail', id],
};

function invalidateVisions(queryClient) {
  queryClient.invalidateQueries({ queryKey: visionKeys.all });
}

export function useVisionList(params) {
  return useQuery({ queryKey: visionKeys.list(params), queryFn: () => visionApi.list(params) });
}

export function useVision(id) {
  return useQuery({ queryKey: visionKeys.detail(id), queryFn: () => visionApi.getById(id), enabled: Boolean(id) });
}

export function useCreateVision() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'vision', opType: 'create', method: 'POST', buildUrl: () => '/visions',
    apiCall: (payload) => visionApi.create(payload),
    onSuccess: () => invalidateVisions(queryClient),
  });
}

export function useUpdateVision() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'vision', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/visions/${id}`,
    apiCall: ({ id, payload }) => visionApi.update(id, payload),
    onSuccess: () => invalidateVisions(queryClient),
  });
}

export function useDeleteVision() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'vision', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/visions/${id}`,
    apiCall: (id) => visionApi.delete(id),
    onSuccess: () => invalidateVisions(queryClient),
  });
}

export function useReorderVisions() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'vision', opType: 'update', method: 'PATCH', buildUrl: () => '/visions/reorder',
    apiCall: (items) => visionApi.reorder(items),
    onSuccess: () => invalidateVisions(queryClient),
  });
}
