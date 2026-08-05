import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const notificationAnalyticsApi = {
  getSummary: (params) => call(apiClient.get('/notifications/analytics/summary', { params })),
  getEventCounts: (params) => call(apiClient.get('/notifications/analytics/events', { params })),
  getTrend: (params) => call(apiClient.get('/notifications/analytics/trend', { params })),
};
