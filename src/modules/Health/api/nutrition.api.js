import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const nutritionApi = {
  list: (params) => call(apiClient.get('/nutrition', { params })),
  getDailyTotals: (date) => call(apiClient.get(`/nutrition/date/${date}/totals`)),
  create: (payload) => call(apiClient.post('/nutrition', payload)),
  update: (id, payload) => call(apiClient.patch(`/nutrition/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/nutrition/${id}`)),
};
