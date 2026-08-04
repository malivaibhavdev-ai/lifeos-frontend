import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const choreApi = {
  list: (householdId, params) => call(apiClient.get(`/family/${householdId}/chores`, { params })),
  create: (householdId, payload) => call(apiClient.post(`/family/${householdId}/chores`, payload)),
  getById: (householdId, id) => call(apiClient.get(`/family/${householdId}/chores/${id}`)),
  update: (householdId, id, payload) => call(apiClient.patch(`/family/${householdId}/chores/${id}`, payload)),
  delete: (householdId, id) => call(apiClient.delete(`/family/${householdId}/chores/${id}`)),
  logCompletion: (householdId, id, payload) => call(apiClient.post(`/family/${householdId}/chores/${id}/completions`, payload)),
  listCompletions: (householdId, params) => call(apiClient.get(`/family/${householdId}/chores/completions`, { params })),
  leaderboard: (householdId, params) => call(apiClient.get(`/family/${householdId}/chores/leaderboard`, { params })),
};
