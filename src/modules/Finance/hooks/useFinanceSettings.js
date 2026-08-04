import { useQuery, useQueryClient } from '@tanstack/react-query';
import { financeCoreApi } from '../api/financeCore.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const financeSettingsKeys = {
  all: ['financeSettings'],
  currencies: ['financeSettings', 'currencies'],
};

export function useFinanceSettings() {
  return useQuery({ queryKey: financeSettingsKeys.all, queryFn: () => financeCoreApi.getSettings() });
}

export function useCurrencies() {
  return useQuery({ queryKey: financeSettingsKeys.currencies, queryFn: () => financeCoreApi.listCurrencies(), staleTime: Infinity });
}

export function useUpdateFinanceSettings() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'financeSettings',
    opType: 'update',
    method: 'PATCH',
    buildUrl: () => '/finance-settings',
    apiCall: (payload) => financeCoreApi.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeSettingsKeys.all });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
    },
  });
}
