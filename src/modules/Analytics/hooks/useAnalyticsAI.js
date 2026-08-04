import { useMutation } from '@tanstack/react-query';
import { analyticsAIApi } from '../api/analyticsAI.api';

// Every AI action returns `{available:false, ...}` today (see the
// backend's analyticsAI.service.js) — hooks exist so screens can be wired
// against the final contract now and start receiving real answers later.
export function useDailySummary() {
  return useMutation({ mutationFn: () => analyticsAIApi.dailySummary() });
}
export function useWeeklySummary() {
  return useMutation({ mutationFn: () => analyticsAIApi.weeklySummary() });
}
export function useMonthlySummary() {
  return useMutation({ mutationFn: () => analyticsAIApi.monthlySummary() });
}
export function useYearlySummary() {
  return useMutation({ mutationFn: () => analyticsAIApi.yearlySummary() });
}
export function useLifeReview() {
  return useMutation({ mutationFn: () => analyticsAIApi.lifeReview() });
}
export function useAICoach() {
  return useMutation({ mutationFn: (prompt) => analyticsAIApi.aiCoach(prompt) });
}
export function useAIMentor() {
  return useMutation({ mutationFn: (prompt) => analyticsAIApi.aiMentor(prompt) });
}
export function useFinancialAdvisor() {
  return useMutation({ mutationFn: (prompt) => analyticsAIApi.financialAdvisor(prompt) });
}
export function useHealthCoach() {
  return useMutation({ mutationFn: (prompt) => analyticsAIApi.healthCoach(prompt) });
}
export function useCareerCoach() {
  return useMutation({ mutationFn: (prompt) => analyticsAIApi.careerCoach(prompt) });
}
export function useRelationshipCoach() {
  return useMutation({ mutationFn: (prompt) => analyticsAIApi.relationshipCoach(prompt) });
}
export function useNaturalLanguageQuery() {
  return useMutation({ mutationFn: (query) => analyticsAIApi.naturalLanguageQuery(query) });
}
export function useChatWithAnalytics() {
  return useMutation({ mutationFn: (query) => analyticsAIApi.chatWithAnalytics(query) });
}
export function useVoiceAnalytics() {
  return useMutation({ mutationFn: (query) => analyticsAIApi.voiceAnalytics(query) });
}
export function useScenarioSimulation() {
  return useMutation({ mutationFn: (scenario) => analyticsAIApi.scenarioSimulation(scenario) });
}
