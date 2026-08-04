import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const workoutApi = {
  list: (params) => call(apiClient.get('/workout', { params })),
  create: (payload) => call(apiClient.post('/workout', payload)),
  update: (id, payload) => call(apiClient.patch(`/workout/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/workout/${id}`)),
  streak: () => call(apiClient.get('/workout/streak')),

  listTemplates: () => call(apiClient.get('/workout/templates')),
  createTemplate: (payload) => call(apiClient.post('/workout/templates', payload)),
  updateTemplate: (id, payload) => call(apiClient.patch(`/workout/templates/${id}`, payload)),
  deleteTemplate: (id) => call(apiClient.delete(`/workout/templates/${id}`)),
};
