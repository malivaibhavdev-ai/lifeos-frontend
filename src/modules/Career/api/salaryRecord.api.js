import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try { return await unwrap(promise); }
  catch (error) { throw toApiError(error); }
}

export const salaryRecordApi = {
  list: () => call(apiClient.get('/salary-records')),
  getById: (id) => call(apiClient.get(`/salary-records/${id}`)),
  create: (payload) => call(apiClient.post('/salary-records', payload)),
  update: (id, payload) => call(apiClient.patch(`/salary-records/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/salary-records/${id}`)),
};
