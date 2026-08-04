import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const financeCoreApi = {
  getSettings: () => call(apiClient.get('/finance-settings')),
  updateSettings: (payload) => call(apiClient.patch('/finance-settings', payload)),
  listCurrencies: () => call(apiClient.get('/finance-settings/currencies')),
};
