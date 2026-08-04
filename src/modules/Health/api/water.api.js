import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const waterApi = {
  getByDate: (date) => call(apiClient.get(`/water/${date}`)),
  addEntry: (date, payload) => call(apiClient.post(`/water/${date}/entries`, payload)),
  removeLastEntry: (date) => call(apiClient.delete(`/water/${date}/entries/last`)),
  setTarget: (date, targetMl) => call(apiClient.patch(`/water/${date}/target`, { targetMl })),
  list: (params) => call(apiClient.get('/water', { params })),
  getSettings: () => call(apiClient.get('/water/settings')),
  updateSettings: (payload) => call(apiClient.patch('/water/settings', payload)),
};
