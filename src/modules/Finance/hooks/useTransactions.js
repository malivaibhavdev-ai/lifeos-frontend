import { useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionApi } from '../api/transaction.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const transactionKeys = {
  all: ['transactions'],
  list: (params) => [...transactionKeys.all, 'list', params],
  detail: (id) => [...transactionKeys.all, 'detail', id],
};

function invalidateTransactions(queryClient) {
  queryClient.invalidateQueries({ queryKey: transactionKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['accounts'] });
  queryClient.invalidateQueries({ queryKey: ['budgets'] });
  queryClient.invalidateQueries({ queryKey: ['netWorth'] });
}

export function useTransactionList(params) {
  return useQuery({ queryKey: transactionKeys.list(params), queryFn: () => transactionApi.list(params) });
}

export function useTransaction(id) {
  return useQuery({ queryKey: transactionKeys.detail(id), queryFn: () => transactionApi.getById(id), enabled: Boolean(id) });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'transaction',
    opType: 'create',
    method: 'POST',
    buildUrl: () => '/transactions',
    apiCall: (payload) => transactionApi.create(payload),
    onSuccess: () => invalidateTransactions(queryClient),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'transaction',
    opType: 'update',
    method: 'PATCH',
    buildUrl: ({ id }) => `/transactions/${id}`,
    apiCall: ({ id, ...payload }) => transactionApi.update(id, payload),
    onSuccess: () => invalidateTransactions(queryClient),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'transaction',
    opType: 'delete',
    method: 'DELETE',
    buildUrl: (id) => `/transactions/${id}`,
    apiCall: (id) => transactionApi.delete(id),
    onSuccess: () => invalidateTransactions(queryClient),
  });
}
