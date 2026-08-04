import { useQuery } from '@tanstack/react-query';
import { insightApi } from '../api/insight.api';

export function useFullInsights(windowDays) {
  return useQuery({ queryKey: ['insights', 'full', windowDays], queryFn: () => insightApi.getFull({ windowDays }) });
}

export function usePeriodInsights(windowDays) {
  return useQuery({ queryKey: ['insights', 'period', windowDays], queryFn: () => insightApi.getPeriodInsights({ windowDays }) });
}

export function useStreakBreaks() {
  return useQuery({ queryKey: ['insights', 'streakBreaks'], queryFn: () => insightApi.getStreakBreaks() });
}

export function useBurnoutRisk() {
  return useQuery({ queryKey: ['insights', 'burnoutRisk'], queryFn: () => insightApi.getBurnoutRisk() });
}
