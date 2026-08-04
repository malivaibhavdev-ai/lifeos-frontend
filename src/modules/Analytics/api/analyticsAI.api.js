import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const analyticsAIApi = {
  dailySummary: () => call(apiClient.get('/analytics/ai/daily-summary')),
  weeklySummary: () => call(apiClient.get('/analytics/ai/weekly-summary')),
  monthlySummary: () => call(apiClient.get('/analytics/ai/monthly-summary')),
  yearlySummary: () => call(apiClient.get('/analytics/ai/yearly-summary')),
  lifeReview: () => call(apiClient.get('/analytics/ai/life-review')),
  aiCoach: (prompt) => call(apiClient.post('/analytics/ai/coach', { prompt })),
  aiMentor: (prompt) => call(apiClient.post('/analytics/ai/mentor', { prompt })),
  financialAdvisor: (prompt) => call(apiClient.post('/analytics/ai/financial-advisor', { prompt })),
  healthCoach: (prompt) => call(apiClient.post('/analytics/ai/health-coach', { prompt })),
  careerCoach: (prompt) => call(apiClient.post('/analytics/ai/career-coach', { prompt })),
  relationshipCoach: (prompt) => call(apiClient.post('/analytics/ai/relationship-coach', { prompt })),
  naturalLanguageQuery: (query) => call(apiClient.post('/analytics/ai/nl-query', { query })),
  chatWithAnalytics: (query) => call(apiClient.post('/analytics/ai/chat', { query })),
  voiceAnalytics: (query) => call(apiClient.post('/analytics/ai/voice', { query })),
  scenarioSimulation: (scenario) => call(apiClient.post('/analytics/ai/scenario-simulation', { scenario })),
};
