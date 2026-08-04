import { useQuery } from '@tanstack/react-query';
import { analyticsTimelineApi } from '../api/analyticsTimeline.api';

export function useAnalyticsTimeline(params) {
  return useQuery({ queryKey: ['analyticsTimeline', params], queryFn: () => analyticsTimelineApi.getTimeline(params) });
}
