import { useQuery } from '@tanstack/react-query';
import { familyAnalyticsApi } from '../api/familyAnalytics.api';

export const familyAnalyticsKeys = {
  all: (householdId) => ['familyAnalytics', householdId],
  chores: (householdId, params) => [...familyAnalyticsKeys.all(householdId), 'chores', params],
  events: (householdId, params) => [...familyAnalyticsKeys.all(householdId), 'events', params],
  goals: (householdId) => [...familyAnalyticsKeys.all(householdId), 'goals'],
  score: (householdId) => [...familyAnalyticsKeys.all(householdId), 'score'],
};

export function useFamilyChoresTrend(householdId, params) {
  return useQuery({
    queryKey: familyAnalyticsKeys.chores(householdId, params),
    queryFn: () => familyAnalyticsApi.choresTrend(householdId, params),
    enabled: Boolean(householdId),
  });
}

export function useFamilyEventsOverview(householdId, params) {
  return useQuery({
    queryKey: familyAnalyticsKeys.events(householdId, params),
    queryFn: () => familyAnalyticsApi.eventsOverview(householdId, params),
    enabled: Boolean(householdId),
  });
}

export function useFamilyGoalsOverview(householdId) {
  return useQuery({
    queryKey: familyAnalyticsKeys.goals(householdId),
    queryFn: () => familyAnalyticsApi.goalsOverview(householdId),
    enabled: Boolean(householdId),
  });
}

export function useFamilyScore(householdId) {
  return useQuery({
    queryKey: familyAnalyticsKeys.score(householdId),
    queryFn: () => familyAnalyticsApi.familyScore(householdId),
    enabled: Boolean(householdId),
  });
}
