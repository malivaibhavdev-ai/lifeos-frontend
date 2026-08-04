import { useQuery, useQueryClient } from '@tanstack/react-query';
import { billApi } from '../api/bill.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const billKeys = {
  all: ['bills'],
  list: (params) => [...billKeys.all, 'list', params],
  payments: (params) => [...billKeys.all, 'payments', params],
  upcoming: (params) => [...billKeys.all, 'upcoming', params],
};

function invalidateBills(queryClient) {
  queryClient.invalidateQueries({ queryKey: billKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useBillList(params) {
  return useQuery({ queryKey: billKeys.list(params), queryFn: () => billApi.list(params) });
}

export function useBillPayments(params) {
  return useQuery({ queryKey: billKeys.payments(params), queryFn: () => billApi.listPayments(params) });
}

export function useUpcomingBills(params) {
  return useQuery({ queryKey: billKeys.upcoming(params), queryFn: () => billApi.upcoming(params) });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'bill',
    opType: 'create',
    method: 'POST',
    buildUrl: () => '/bills',
    apiCall: (payload) => billApi.create(payload),
    onSuccess: () => invalidateBills(queryClient),
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'bill',
    opType: 'update',
    method: 'PATCH',
    buildUrl: ({ id }) => `/bills/${id}`,
    apiCall: ({ id, ...payload }) => billApi.update(id, payload),
    onSuccess: () => invalidateBills(queryClient),
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'bill',
    opType: 'delete',
    method: 'DELETE',
    buildUrl: (id) => `/bills/${id}`,
    apiCall: (id) => billApi.delete(id),
    onSuccess: () => invalidateBills(queryClient),
  });
}

export function useMarkBillPaid() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'billPayment',
    opType: 'markPaid',
    method: 'PATCH',
    buildUrl: ({ paymentId }) => `/bills/payments/${paymentId}/paid`,
    apiCall: ({ paymentId, ...payload }) => billApi.markPaid(paymentId, payload),
    onSuccess: () => invalidateBills(queryClient),
  });
}

export function useMarkBillSkipped() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'billPayment',
    opType: 'markSkipped',
    method: 'PATCH',
    buildUrl: (paymentId) => `/bills/payments/${paymentId}/skipped`,
    apiCall: (paymentId) => billApi.markSkipped(paymentId),
    onSuccess: () => invalidateBills(queryClient),
  });
}
