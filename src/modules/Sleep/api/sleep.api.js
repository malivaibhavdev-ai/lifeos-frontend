import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const sleepApi = {
  list: (params) => call(apiClient.get('/sleep', { params })),
  create: (payload) => call(apiClient.post('/sleep', payload)),
  update: (id, payload) => call(apiClient.patch(`/sleep/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/sleep/${id}`)),
  weeklyReport: (params) => call(apiClient.get('/sleep/report/weekly', { params })),
  getSchedule: () => call(apiClient.get('/sleep/schedule')),
  updateSchedule: (payload) => call(apiClient.patch('/sleep/schedule', payload)),
  getDebt: () => call(apiClient.get('/sleep/debt')),
};
