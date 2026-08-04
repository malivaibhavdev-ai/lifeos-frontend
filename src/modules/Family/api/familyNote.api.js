import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const familyNoteApi = {
  list: (householdId, params) => call(apiClient.get(`/family/${householdId}/notes`, { params })),
  create: (householdId, payload) => call(apiClient.post(`/family/${householdId}/notes`, payload)),
  getById: (householdId, id) => call(apiClient.get(`/family/${householdId}/notes/${id}`)),
  update: (householdId, id, payload) => call(apiClient.patch(`/family/${householdId}/notes/${id}`, payload)),
  delete: (householdId, id) => call(apiClient.delete(`/family/${householdId}/notes/${id}`)),
};
