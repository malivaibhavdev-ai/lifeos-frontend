import { useQuery } from '@tanstack/react-query';
import { trendApi } from '../api/trend.api';

export function useMetricCatalog() {
  return useQuery({ queryKey: ['metricCatalog'], queryFn: () => trendApi.listMetricCatalog(), staleTime: Infinity });
}

export function useTrend(metricKey, params) {
  return useQuery({
    queryKey: ['trend', metricKey, params],
    queryFn: () => trendApi.getTrend(metricKey, params),
    enabled: Boolean(metricKey),
  });
}

export function useForecast(metricKey, params) {
  return useQuery({
    queryKey: ['forecast', metricKey, params],
    queryFn: () => trendApi.getForecast(metricKey, params),
    enabled: Boolean(metricKey),
  });
}
