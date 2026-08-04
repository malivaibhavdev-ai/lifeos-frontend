import { useQuery, useQueryClient } from '@tanstack/react-query';
import { debtApi } from '../api/debt.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const debtKeys = {
  all: ['debts'],
  list: (params) => [...debtKeys.all, 'list', params],
  detail: (id) => [...debtKeys.all, 'detail', id],
  schedule: (id) => [...debtKeys.all, 'schedule', id],
  outstanding: (id) => [...debtKeys.all, 'outstanding', id],
  payoff: (id, params) => [...debtKeys.all, 'payoff', id, params],
  payments: (id) => [...debtKeys.all, 'payments', id],
};

function invalidateDebts(queryClient) {
  queryClient.invalidateQueries({ queryKey: debtKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
  queryClient.invalidateQueries({ queryKey: ['netWorth'] });
}

export function useDebtList(params) {
  return useQuery({ queryKey: debtKeys.list(params), queryFn: () => debtApi.list(params) });
}

export function useDebt(id) {
  return useQuery({ queryKey: debtKeys.detail(id), queryFn: () => debtApi.getById(id), enabled: Boolean(id) });
}

export function useDebtSchedule(id) {
  return useQuery({ queryKey: debtKeys.schedule(id), queryFn: () => debtApi.schedule(id), enabled: Boolean(id) });
}

export function useDebtOutstandingBalance(id) {
  return useQuery({ queryKey: debtKeys.outstanding(id), queryFn: () => debtApi.outstandingBalance(id), enabled: Boolean(id) });
}

export function useDebtPayoffProjection(id, params) {
  return useQuery({ queryKey: debtKeys.payoff(id, params), queryFn: () => debtApi.payoffProjection(id, params), enabled: Boolean(id) });
}

export function useDebtPayments(id) {
  return useQuery({ queryKey: debtKeys.payments(id), queryFn: () => debtApi.listPayments(id), enabled: Boolean(id) });
}

export function useCreateDebt() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'debt',
    opType: 'create',
    method: 'POST',
    buildUrl: () => '/debts',
    apiCall: (payload) => debtApi.create(payload),
    onSuccess: () => invalidateDebts(queryClient),
  });
}

export function useUpdateDebt() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'debt',
    opType: 'update',
    method: 'PATCH',
    buildUrl: ({ id }) => `/debts/${id}`,
    apiCall: ({ id, ...payload }) => debtApi.update(id, payload),
    onSuccess: () => invalidateDebts(queryClient),
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'debt',
    opType: 'delete',
    method: 'DELETE',
    buildUrl: (id) => `/debts/${id}`,
    apiCall: (id) => debtApi.delete(id),
    onSuccess: () => invalidateDebts(queryClient),
  });
}

export function useRecordDebtPayment() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'debtPayment',
    opType: 'create',
    method: 'POST',
    buildUrl: ({ id }) => `/debts/${id}/payments`,
    apiCall: ({ id, ...payload }) => debtApi.recordPayment(id, payload),
    onSuccess: () => invalidateDebts(queryClient),
  });
}
