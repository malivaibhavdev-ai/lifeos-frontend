import { useQuery, useMutation } from '@tanstack/react-query';
import { notificationAIApi } from '../api/notificationAI.api';

// AI-Ready interfaces — every hook here talks to a real endpoint that
// currently resolves { available: false, feature, reason }. Screens using
// these should render an honest "AI features coming soon" state, not
// fabricate a result client-side.
export const notificationAIKeys = {
  all: ['notificationAI'],
  prioritization: (id) => [...notificationAIKeys.all, 'prioritization', id],
  smartTiming: (id) => [...notificationAIKeys.all, 'smartTiming', id],
  smartDelivery: (id) => [...notificationAIKeys.all, 'smartDelivery', id],
  recommendation: [...notificationAIKeys.all, 'recommendation'],
  reduction: [...notificationAIKeys.all, 'reduction'],
};

export function useNotificationAIPrioritization(id) {
  return useQuery({
    queryKey: notificationAIKeys.prioritization(id),
    queryFn: () => notificationAIApi.prioritization(id),
    enabled: Boolean(id),
  });
}

export function useNotificationAISmartTiming(id) {
  return useQuery({
    queryKey: notificationAIKeys.smartTiming(id),
    queryFn: () => notificationAIApi.smartTiming(id),
    enabled: Boolean(id),
  });
}

export function useNotificationAISmartDelivery(id) {
  return useQuery({
    queryKey: notificationAIKeys.smartDelivery(id),
    queryFn: () => notificationAIApi.smartDelivery(id),
    enabled: Boolean(id),
  });
}

export function useNotificationAIRecommendation() {
  return useQuery({ queryKey: notificationAIKeys.recommendation, queryFn: () => notificationAIApi.recommendation() });
}

export function useNotificationAIReduction() {
  return useQuery({ queryKey: notificationAIKeys.reduction, queryFn: () => notificationAIApi.reduction() });
}

export function useNotificationAISummary() {
  return useMutation({ mutationFn: (payload) => notificationAIApi.summary(payload) });
}

export function useNotificationAIDigest() {
  return useMutation({ mutationFn: (payload) => notificationAIApi.digest(payload) });
}
