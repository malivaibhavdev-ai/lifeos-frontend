import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const documentExportApi = {
  exportAll: () => call(apiClient.get('/documents/export')),
  importAll: (payload) => call(apiClient.post('/documents/import', payload)),
};
