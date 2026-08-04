import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const documentAnalyticsApi = {
  storageUsage: () => call(apiClient.get('/documents/analytics/storage')),
  growthTrend: (params) => call(apiClient.get('/documents/analytics/growth', { params })),
  categoriesBreakdown: () => call(apiClient.get('/documents/analytics/categories')),
  largestFiles: (limit) => call(apiClient.get('/documents/analytics/largest-files', { params: { limit } })),
  duplicateSummary: () => call(apiClient.get('/documents/analytics/duplicates')),
  uploadTrend: (params) => call(apiClient.get('/documents/analytics/upload-trend', { params })),
  downloadTrend: (params) => call(apiClient.get('/documents/analytics/download-trend', { params })),
  shareAnalytics: () => call(apiClient.get('/documents/analytics/shares')),
  folderAnalytics: () => call(apiClient.get('/documents/analytics/folders')),
  retentionAnalytics: () => call(apiClient.get('/documents/analytics/retention')),
  activityHeatmap: (windowDays) => call(apiClient.get('/documents/analytics/heatmap', { params: { windowDays } })),
  score: () => call(apiClient.get('/documents/analytics/score')),
};
