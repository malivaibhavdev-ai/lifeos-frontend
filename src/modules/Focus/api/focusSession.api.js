import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const focusSessionApi = {
  start: ({ entityType, entityId, mode, plannedDurationSeconds }) =>
    call(apiClient.post('/focus-sessions', { entityType, entityId, mode, plannedDurationSeconds })),

  getActive: () => call(apiClient.get('/focus-sessions/active')),

  pause: (id) => call(apiClient.patch(`/focus-sessions/${id}/pause`)),

  resume: (id) => call(apiClient.patch(`/focus-sessions/${id}/resume`)),

  complete: (id, notes) => call(apiClient.post(`/focus-sessions/${id}/complete`, { notes })),

  interrupt: (id, notes) => call(apiClient.post(`/focus-sessions/${id}/interrupt`, { notes })),

  list: (params) => call(apiClient.get('/focus-sessions', { params })),

  stats: (from, to) => call(apiClient.get('/focus-sessions/stats', { params: { from, to } })),
};
