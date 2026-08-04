import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const dreamApi = {
  list: (params) => call(apiClient.get('/dreams', { params })),
  create: (payload) => call(apiClient.post('/dreams', payload)),
  getById: (id) => call(apiClient.get(`/dreams/${id}`)),
  update: (id, payload) => call(apiClient.patch(`/dreams/${id}`, payload)),
  delete: (id) => call(apiClient.delete(`/dreams/${id}`)),
  addAttachment: (id, formData) =>
    call(apiClient.post(`/dreams/${id}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })),

  getSettings: () => call(apiClient.get('/dreams/settings')),
  updateSettings: (payload) => call(apiClient.patch('/dreams/settings', payload)),

  overview: (params) => call(apiClient.get('/dreams/analytics/overview', { params })),
  trend: (params) => call(apiClient.get('/dreams/analytics/trend', { params })),
  weeklyReport: () => call(apiClient.get('/dreams/analytics/weekly')),
  monthlyReport: () => call(apiClient.get('/dreams/analytics/monthly')),
  yearlyReport: () => call(apiClient.get('/dreams/analytics/yearly')),
  score: () => call(apiClient.get('/dreams/analytics/score')),
  topSymbols: () => call(apiClient.get('/dreams/analytics/top-symbols')),
  topPeople: () => call(apiClient.get('/dreams/analytics/top-people')),

  exportAll: () => call(apiClient.get('/dreams/export')),
  importAll: (payload) => call(apiClient.post('/dreams/import', payload)),

  // AI-ready placeholders — currently return { available: false, ... }.
  interpret: (id) => call(apiClient.get(`/dreams/ai/${id}/interpret`)),
  patterns: () => call(apiClient.get('/dreams/ai/patterns')),
  subconsciousInsights: () => call(apiClient.get('/dreams/ai/subconscious-insights')),
  lucidCoach: () => call(apiClient.get('/dreams/ai/lucid-coach')),
  nightmareCoach: () => call(apiClient.get('/dreams/ai/nightmare-coach')),
};
