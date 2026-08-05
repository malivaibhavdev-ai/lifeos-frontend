import { useQuery } from '@tanstack/react-query';
import { notificationAnalyticsApi } from '../api/notificationAnalytics.api';

export const notificationAnalyticsKeys = {
  all: ['notificationAnalytics'],
  summary: (params) => [...notificationAnalyticsKeys.all, 'summary', params],
  events: (params) => [...notificationAnalyticsKeys.all, 'events', params],
  trend: (params) => [...notificationAnalyticsKeys.all, 'trend', params],
};

export function useNotificationAnalyticsSummary(params) {
  return useQuery({
    queryKey: notificationAnalyticsKeys.summary(params),
    queryFn: () => notificationAnalyticsApi.getSummary(params),
  });
}

export function useNotificationEventCounts(params) {
  return useQuery({
    queryKey: notificationAnalyticsKeys.events(params),
    queryFn: () => notificationAnalyticsApi.getEventCounts(params),
  });
}

export function useNotificationTrend(params) {
  return useQuery({
    queryKey: notificationAnalyticsKeys.trend(params),
    queryFn: () => notificationAnalyticsApi.getTrend(params),
  });
}
