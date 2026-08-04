import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const documentActivityLogApi = {
  list: (params) => call(apiClient.get('/documents/activity-log', { params })),
  timeline: (params) => call(apiClient.get('/documents/timeline', { params })),
};
