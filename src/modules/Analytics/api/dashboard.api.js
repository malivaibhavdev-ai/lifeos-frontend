import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const dashboardApi = {
  list: () => call(apiClient.get('/analytics/dashboards')),
  getDefault: () => call(apiClient.get('/analytics/dashboards/default')),
  create: (payload) => call(apiClient.post('/analytics/dashboards', payload)),
  getById: (id) => call(apiClient.get(`/analytics/dashboards/${id}`)),
  update: (id, payload) => call(apiClient.patch(`/analytics/dashboards/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/analytics/dashboards/${id}`)),

  listWidgets: (dashboardId) => call(apiClient.get(`/analytics/dashboards/${dashboardId}/widgets`)),
  createWidget: (dashboardId, payload) => call(apiClient.post(`/analytics/dashboards/${dashboardId}/widgets`, payload)),
  updateWidget: (dashboardId, widgetId, payload) => call(apiClient.patch(`/analytics/dashboards/${dashboardId}/widgets/${widgetId}`, payload)),
  reorderWidgets: (dashboardId, widgets) => call(apiClient.patch(`/analytics/dashboards/${dashboardId}/widgets/reorder`, { widgets })),
  deleteWidget: (dashboardId, widgetId) => call(apiClient.delete(`/analytics/dashboards/${dashboardId}/widgets/${widgetId}`)),
};
