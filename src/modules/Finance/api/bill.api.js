import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const billApi = {
  list: (params) => call(apiClient.get('/bills', { params })),
  create: (payload) => call(apiClient.post('/bills', payload)),
  update: (id, payload) => call(apiClient.patch(`/bills/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/bills/${id}`)),
  listPayments: (params) => call(apiClient.get('/bills/payments', { params })),
  upcoming: (params) => call(apiClient.get('/bills/upcoming', { params })),
  markPaid: (paymentId, payload) => call(apiClient.patch(`/bills/payments/${paymentId}/paid`, payload)),
  markSkipped: (paymentId) => call(apiClient.patch(`/bills/payments/${paymentId}/skipped`)),
};
