import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try { return await unwrap(promise); }
  catch (error) { throw toApiError(error); }
}

export const careerHubApi = {
  getSummary: () => call(apiClient.get('/career/summary')),
  getTimeline: (params) => call(apiClient.get('/career/timeline', { params })),
  getActivityLog: (params) => call(apiClient.get('/career/activity-log', { params })),
  recommendSkills: () => call(apiClient.get('/career/ai/recommend-skills')),
  recommendLearning: () => call(apiClient.get('/career/ai/recommend-learning')),
  predictSalary: () => call(apiClient.get('/career/ai/predict-salary')),
};
