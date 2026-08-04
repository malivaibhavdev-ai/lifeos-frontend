import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const exchangeRateApi = {
  list: (params) => call(apiClient.get('/exchange-rates', { params })),
  create: (payload) => call(apiClient.post('/exchange-rates', payload)),
  delete: (id) => call(apiClient.delete(`/exchange-rates/${id}`)),
  preview: (params) => call(apiClient.get('/exchange-rates/preview', { params })),
};
