import { useQuery, useQueryClient } from '@tanstack/react-query';
import { exchangeRateApi } from '../api/exchangeRate.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const exchangeRateKeys = {
  all: ['exchangeRates'],
  list: (params) => [...exchangeRateKeys.all, 'list', params],
};

function invalidateExchangeRates(queryClient) {
  queryClient.invalidateQueries({ queryKey: exchangeRateKeys.all });
  queryClient.invalidateQueries({ queryKey: ['netWorth'] });
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
}

export function useExchangeRateList(params) {
  return useQuery({ queryKey: exchangeRateKeys.list(params), queryFn: () => exchangeRateApi.list(params) });
}

export function useExchangeRatePreview(params, { enabled = true } = {}) {
  return useQuery({
    queryKey: [...exchangeRateKeys.all, 'preview', params],
    queryFn: () => exchangeRateApi.preview(params),
    enabled: enabled && Boolean(params?.from) && Boolean(params?.to),
  });
}

export function useCreateExchangeRate() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'exchangeRate',
    opType: 'create',
    method: 'POST',
    buildUrl: () => '/exchange-rates',
    apiCall: (payload) => exchangeRateApi.create(payload),
    onSuccess: () => invalidateExchangeRates(queryClient),
  });
}

export function useDeleteExchangeRate() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'exchangeRate',
    opType: 'delete',
    method: 'DELETE',
    buildUrl: (id) => `/exchange-rates/${id}`,
    apiCall: (id) => exchangeRateApi.delete(id),
    onSuccess: () => invalidateExchangeRates(queryClient),
  });
}
