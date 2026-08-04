import { useQuery } from '@tanstack/react-query';
import { netWorthApi } from '../api/netWorth.api';

export const netWorthKeys = {
  all: ['netWorth'],
  current: ['netWorth', 'current'],
  trend: (params) => ['netWorth', 'trend', params],
};

export function useNetWorthCurrent() {
  return useQuery({ queryKey: netWorthKeys.current, queryFn: () => netWorthApi.current() });
}

export function useNetWorthTrend(params) {
  return useQuery({ queryKey: netWorthKeys.trend(params), queryFn: () => netWorthApi.trend(params) });
}
