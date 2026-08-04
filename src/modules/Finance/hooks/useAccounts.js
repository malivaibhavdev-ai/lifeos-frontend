import { useQuery, useQueryClient } from '@tanstack/react-query';
import { accountApi } from '../api/account.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const accountKeys = {
  all: ['accounts'],
  list: (params) => [...accountKeys.all, 'list', params],
  detail: (id) => [...accountKeys.all, 'detail', id],
};

function invalidateAccounts(queryClient) {
  queryClient.invalidateQueries({ queryKey: accountKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['netWorth'] });
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
}

export function useAccountList(params) {
  return useQuery({ queryKey: accountKeys.list(params), queryFn: () => accountApi.list(params) });
}

export function useAccount(id) {
  return useQuery({ queryKey: accountKeys.detail(id), queryFn: () => accountApi.getById(id), enabled: Boolean(id) });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'financeAccount',
    opType: 'create',
    method: 'POST',
    buildUrl: () => '/accounts',
    apiCall: (payload) => accountApi.create(payload),
    onSuccess: () => invalidateAccounts(queryClient),
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'financeAccount',
    opType: 'update',
    method: 'PATCH',
    buildUrl: ({ id }) => `/accounts/${id}`,
    apiCall: ({ id, ...payload }) => accountApi.update(id, payload),
    onSuccess: () => invalidateAccounts(queryClient),
  });
}

export function useArchiveAccount() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'financeAccount',
    opType: 'archive',
    method: 'POST',
    buildUrl: (id) => `/accounts/${id}/archive`,
    apiCall: (id) => accountApi.archive(id),
    onSuccess: () => invalidateAccounts(queryClient),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'financeAccount',
    opType: 'delete',
    method: 'DELETE',
    buildUrl: (id) => `/accounts/${id}`,
    apiCall: (id) => accountApi.delete(id),
    onSuccess: () => invalidateAccounts(queryClient),
  });
}
