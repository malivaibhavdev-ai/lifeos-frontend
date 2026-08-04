import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const householdApi = {
  listMine: () => call(apiClient.get('/households')),
  create: (payload) => call(apiClient.post('/households', payload)),
  getById: (id) => call(apiClient.get(`/households/${id}`)),
  update: (id, payload) => call(apiClient.patch(`/households/${id}`, payload)),
  leave: (id) => call(apiClient.post(`/households/${id}/leave`)),

  listMembers: (id) => call(apiClient.get(`/households/${id}/members`)),
  updateMemberRole: (id, memberId, role) => call(apiClient.patch(`/households/${id}/members/${memberId}`, { role })),
  removeMember: (id, memberId) => call(apiClient.delete(`/households/${id}/members/${memberId}`)),

  invite: (id, payload) => call(apiClient.post(`/households/${id}/invitations`, payload)),
  listPendingInvitations: (id) => call(apiClient.get(`/households/${id}/invitations`)),
  revokeInvitation: (id, invitationId) => call(apiClient.delete(`/households/${id}/invitations/${invitationId}`)),
  acceptInvitation: (token) => call(apiClient.post(`/households/invitations/${token}/accept`)),
  declineInvitation: (token) => call(apiClient.post(`/households/invitations/${token}/decline`)),

  addEmergencyChecklistItem: (id, label) => call(apiClient.post(`/households/${id}/emergency-checklist`, { label })),
  toggleEmergencyChecklistItem: (id, itemId, isDone) =>
    call(apiClient.patch(`/households/${id}/emergency-checklist/${itemId}`, { isDone })),
};
