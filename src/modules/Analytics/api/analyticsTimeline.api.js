import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const analyticsTimelineApi = {
  getTimeline: (params) => call(apiClient.get('/analytics/timeline', { params })),
};
