import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const familyGoalApi = {
  list: (householdId, params) => call(apiClient.get(`/family/${householdId}/goals`, { params })),
  create: (householdId, payload) => call(apiClient.post(`/family/${householdId}/goals`, payload)),
  getById: (householdId, id) => call(apiClient.get(`/family/${householdId}/goals/${id}`)),
  update: (householdId, id, payload) => call(apiClient.patch(`/family/${householdId}/goals/${id}`, payload)),
  delete: (householdId, id) => call(apiClient.delete(`/family/${householdId}/goals/${id}`)),
  addContribution: (householdId, id, payload) => call(apiClient.post(`/family/${householdId}/goals/${id}/contributions`, payload)),
  toggleMilestone: (householdId, id, milestoneId, isCompleted) =>
    call(apiClient.patch(`/family/${householdId}/goals/${id}/milestones/${milestoneId}`, { isCompleted })),
};
