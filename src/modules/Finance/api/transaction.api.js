import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const transactionApi = {
  list: (params) => call(apiClient.get('/transactions', { params })),
  getById: (id) => call(apiClient.get(`/transactions/${id}`)),
  create: (payload) => call(apiClient.post('/transactions', payload)),
  update: (id, payload) => call(apiClient.patch(`/transactions/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/transactions/${id}`)),
};
