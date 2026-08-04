import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const taskApi = {
  // Unlike every other endpoint, list responses carry pagination metadata
  // alongside the array, so this bypasses the generic unwrap() to keep both.
  list: async (params) => {
    try {
      const res = await apiClient.get('/tasks', { params });
      return { items: res.data.data, pagination: res.data.pagination };
    } catch (error) {
      throw toApiError(error);
    }
  },

  counts: () => call(apiClient.get('/tasks/counts')),

  todaySummary: () => call(apiClient.get('/tasks/today-summary')),

  meta: () => call(apiClient.get('/tasks/meta')),

  getById: (id) => call(apiClient.get(`/tasks/${id}`)),

  create: (payload) => call(apiClient.post('/tasks', payload)),

  update: (id, payload) => call(apiClient.patch(`/tasks/${id}`, payload)),

  remove: (id) => call(apiClient.delete(`/tasks/${id}`)),

  restore: (id) => call(apiClient.post(`/tasks/${id}/restore`)),

  permanentDelete: (id) => call(apiClient.delete(`/tasks/${id}/permanent`)),

  duplicate: (id) => call(apiClient.post(`/tasks/${id}/duplicate`)),

  archive: (id) => call(apiClient.patch(`/tasks/${id}/archive`)),

  unarchive: (id) => call(apiClient.patch(`/tasks/${id}/unarchive`)),

  markStatus: (id, status) => call(apiClient.patch(`/tasks/${id}/status`, { status })),

  toggleSubtask: (id, subtaskId) => call(apiClient.patch(`/tasks/${id}/subtasks/${subtaskId}/toggle`)),

  reorder: (items) => call(apiClient.patch('/tasks/reorder', { items })),

  bulkComplete: (ids) => call(apiClient.post('/tasks/bulk/complete', { ids })),

  bulkDelete: (ids) => call(apiClient.post('/tasks/bulk/delete', { ids })),
};
