import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const debtApi = {
  list: (params) => call(apiClient.get('/debts', { params })),
  getById: (id) => call(apiClient.get(`/debts/${id}`)),
  create: (payload) => call(apiClient.post('/debts', payload)),
  update: (id, payload) => call(apiClient.patch(`/debts/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/debts/${id}`)),
  schedule: (id) => call(apiClient.get(`/debts/${id}/schedule`)),
  outstandingBalance: (id) => call(apiClient.get(`/debts/${id}/outstanding-balance`)),
  payoffProjection: (id, params) => call(apiClient.get(`/debts/${id}/payoff-projection`, { params })),
  listPayments: (id) => call(apiClient.get(`/debts/${id}/payments`)),
  recordPayment: (id, payload) => call(apiClient.post(`/debts/${id}/payments`, payload)),
};
