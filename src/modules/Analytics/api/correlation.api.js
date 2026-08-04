import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const correlationApi = {
  correlate: (metricKeyA, metricKeyB, params) => call(apiClient.get('/analytics/correlations', { params: { metricKeyA, metricKeyB, ...params } })),
  discover: (params) => call(apiClient.get('/analytics/correlations/discover', { params })),
};
