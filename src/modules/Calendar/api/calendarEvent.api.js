import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const calendarEventApi = {
  create: (payload) => call(apiClient.post('/calendar', payload)),
  getById: (id) => call(apiClient.get(`/calendar/${id}`)),
  update: (id, payload) => call(apiClient.patch(`/calendar/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/calendar/${id}`)),
};
