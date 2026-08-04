import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const budgetApi = {
  list: (params) => call(apiClient.get('/budgets', { params })),
  create: (payload) => call(apiClient.post('/budgets', payload)),
  update: (id, payload) => call(apiClient.patch(`/budgets/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/budgets/${id}`)),
  status: (id, params) => call(apiClient.get(`/budgets/${id}/status`, { params })),
  statuses: (params) => call(apiClient.get('/budgets/status', { params })),
};
