import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const lifeScoreApi = {
  getCurrent: (windowDays) => call(apiClient.get('/analytics/life-score', { params: { windowDays } })),
  getHistory: (params) => call(apiClient.get('/analytics/life-score/history', { params })),
};
