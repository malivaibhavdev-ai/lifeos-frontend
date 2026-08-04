import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../api/health.api';

export const healthHubKeys = { summary: ['healthHub', 'summary'] };

export function useHealthSummary() {
  return useQuery({ queryKey: healthHubKeys.summary, queryFn: () => healthApi.getSummary() });
}
