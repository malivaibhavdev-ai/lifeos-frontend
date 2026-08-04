import { useQuery } from '@tanstack/react-query';
import { correlationApi } from '../api/correlation.api';

export function useCorrelation(metricKeyA, metricKeyB, params) {
  return useQuery({
    queryKey: ['correlation', metricKeyA, metricKeyB, params],
    queryFn: () => correlationApi.correlate(metricKeyA, metricKeyB, params),
    enabled: Boolean(metricKeyA && metricKeyB),
  });
}

export function useDiscoverCorrelations(params) {
  return useQuery({ queryKey: ['correlations', 'discover', params], queryFn: () => correlationApi.discover(params) });
}
