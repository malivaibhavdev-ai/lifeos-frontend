import { useQuery } from '@tanstack/react-query';
import { lifeScoreApi } from '../api/lifeScore.api';

export function useCurrentLifeScore(windowDays) {
  return useQuery({ queryKey: ['lifeScore', 'current', windowDays], queryFn: () => lifeScoreApi.getCurrent(windowDays) });
}

export function useLifeScoreHistory(params) {
  return useQuery({ queryKey: ['lifeScore', 'history', params], queryFn: () => lifeScoreApi.getHistory(params) });
}
