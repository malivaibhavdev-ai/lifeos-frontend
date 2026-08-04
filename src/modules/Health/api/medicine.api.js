import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const medicineApi = {
  list: (params) => call(apiClient.get('/medicines', { params })),
  getById: (id) => call(apiClient.get(`/medicines/${id}`)),
  create: (payload) => call(apiClient.post('/medicines', payload)),
  update: (id, payload) => call(apiClient.patch(`/medicines/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/medicines/${id}`)),

  logsForDate: (date) => call(apiClient.get(`/medicines/logs/date/${date}`)),
  listLogs: (params) => call(apiClient.get('/medicines/logs', { params })),
  markTaken: (logId) => call(apiClient.patch(`/medicines/logs/${logId}/taken`)),
  markSkipped: (logId) => call(apiClient.patch(`/medicines/logs/${logId}/skipped`)),
  adherence: (params) => call(apiClient.get('/medicines/adherence', { params })),
};
