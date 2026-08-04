import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const documentAutomationApi = {
  list: () => call(apiClient.get('/documents/automation-rules')),
  getById: (id) => call(apiClient.get(`/documents/automation-rules/${id}`)),
  create: (payload) => call(apiClient.post('/documents/automation-rules', payload)),
  update: (id, payload) => call(apiClient.patch(`/documents/automation-rules/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/documents/automation-rules/${id}`)),
};
