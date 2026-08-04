import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const familyAnalyticsApi = {
  choresTrend: (householdId, params) => call(apiClient.get(`/family/${householdId}/analytics/chores`, { params })),
  eventsOverview: (householdId, params) => call(apiClient.get(`/family/${householdId}/analytics/events`, { params })),
  goalsOverview: (householdId) => call(apiClient.get(`/family/${householdId}/analytics/goals`)),
  familyScore: (householdId) => call(apiClient.get(`/family/${householdId}/analytics/score`)),

  // AI-ready placeholders — currently return { available: false, ... }.
  familyCoach: (householdId) => call(apiClient.get(`/family/${householdId}/ai/family-coach`)),
  relationshipInsights: (householdId) => call(apiClient.get(`/family/${householdId}/ai/relationship-insights`)),
  smartSuggestions: (householdId) => call(apiClient.get(`/family/${householdId}/ai/smart-suggestions`)),
};
