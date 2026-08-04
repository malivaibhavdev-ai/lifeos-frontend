import { useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetApi } from '../api/budget.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const budgetKeys = {
  all: ['budgets'],
  list: (params) => [...budgetKeys.all, 'list', params],
  statuses: (params) => [...budgetKeys.all, 'statuses', params],
};

function invalidateBudgets(queryClient) {
  queryClient.invalidateQueries({ queryKey: budgetKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useBudgetList(params) {
  return useQuery({ queryKey: budgetKeys.list(params), queryFn: () => budgetApi.list(params) });
}

export function useBudgetStatuses(params) {
  return useQuery({ queryKey: budgetKeys.statuses(params), queryFn: () => budgetApi.statuses(params) });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'budget',
    opType: 'create',
    method: 'POST',
    buildUrl: () => '/budgets',
    apiCall: (payload) => budgetApi.create(payload),
    onSuccess: () => invalidateBudgets(queryClient),
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'budget',
    opType: 'update',
    method: 'PATCH',
    buildUrl: ({ id }) => `/budgets/${id}`,
    apiCall: ({ id, ...payload }) => budgetApi.update(id, payload),
    onSuccess: () => invalidateBudgets(queryClient),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'budget',
    opType: 'delete',
    method: 'DELETE',
    buildUrl: (id) => `/budgets/${id}`,
    apiCall: (id) => budgetApi.delete(id),
    onSuccess: () => invalidateBudgets(queryClient),
  });
}
