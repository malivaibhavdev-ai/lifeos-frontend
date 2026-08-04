import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const insightApi = {
  getFull: (params) => call(apiClient.get('/analytics/insights', { params })),
  getPeriodInsights: (params) => call(apiClient.get('/analytics/insights/period', { params })),
  getStreakBreaks: () => call(apiClient.get('/analytics/insights/streak-breaks')),
  getBurnoutRisk: () => call(apiClient.get('/analytics/insights/burnout-risk')),
};
