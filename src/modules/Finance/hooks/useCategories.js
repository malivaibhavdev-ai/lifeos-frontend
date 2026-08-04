import { useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../api/category.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const categoryKeys = {
  all: ['financeCategories'],
  list: (params) => [...categoryKeys.all, 'list', params],
};

function invalidateCategories(queryClient) {
  queryClient.invalidateQueries({ queryKey: categoryKeys.all });
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
  queryClient.invalidateQueries({ queryKey: ['budgets'] });
}

export function useCategoryList(params) {
  return useQuery({ queryKey: categoryKeys.list(params), queryFn: () => categoryApi.list(params) });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'financeCategory',
    opType: 'create',
    method: 'POST',
    buildUrl: () => '/finance-categories',
    apiCall: (payload) => categoryApi.create(payload),
    onSuccess: () => invalidateCategories(queryClient),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'financeCategory',
    opType: 'update',
    method: 'PATCH',
    buildUrl: ({ id }) => `/finance-categories/${id}`,
    apiCall: ({ id, ...payload }) => categoryApi.update(id, payload),
    onSuccess: () => invalidateCategories(queryClient),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'financeCategory',
    opType: 'delete',
    method: 'DELETE',
    buildUrl: (id) => `/finance-categories/${id}`,
    apiCall: (id) => categoryApi.delete(id),
    onSuccess: () => invalidateCategories(queryClient),
  });
}
