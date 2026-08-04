import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const familyJournalApi = {
  list: (householdId, params) => call(apiClient.get(`/family/${householdId}/journal`, { params })),
  create: (householdId, payload) => call(apiClient.post(`/family/${householdId}/journal`, payload)),
  getById: (householdId, id) => call(apiClient.get(`/family/${householdId}/journal/${id}`)),
  update: (householdId, id, payload) => call(apiClient.patch(`/family/${householdId}/journal/${id}`, payload)),
  delete: (householdId, id) => call(apiClient.delete(`/family/${householdId}/journal/${id}`)),
};
