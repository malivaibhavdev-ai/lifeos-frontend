import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const trendApi = {
  listMetricCatalog: () => call(apiClient.get('/analytics/metric-catalog')),
  getTrend: (metricKey, params) => call(apiClient.get(`/analytics/trend/${metricKey}`, { params })),
  getForecast: (metricKey, params) => call(apiClient.get(`/analytics/forecast/${metricKey}`, { params })),
};
