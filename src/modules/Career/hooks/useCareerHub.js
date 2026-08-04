import { useQuery } from '@tanstack/react-query';
import { careerHubApi } from '../api/careerHub.api';

export const careerHubKeys = {
  all: ['careerHub'],
  summary: () => [...careerHubKeys.all, 'summary'],
  timeline: (params) => [...careerHubKeys.all, 'timeline', params],
  activityLog: (params) => [...careerHubKeys.all, 'activityLog', params],
  recommendSkills: () => [...careerHubKeys.all, 'recommendSkills'],
  recommendLearning: () => [...careerHubKeys.all, 'recommendLearning'],
  predictSalary: () => [...careerHubKeys.all, 'predictSalary'],
};

export function useCareerSummary() {
  return useQuery({ queryKey: careerHubKeys.summary(), queryFn: () => careerHubApi.getSummary() });
}
export function useCareerTimeline(params) {
  return useQuery({ queryKey: careerHubKeys.timeline(params), queryFn: () => careerHubApi.getTimeline(params) });
}
export function useCareerActivityLog(params) {
  return useQuery({ queryKey: careerHubKeys.activityLog(params), queryFn: () => careerHubApi.getActivityLog(params) });
}
export function useRecommendedSkills() {
  return useQuery({ queryKey: careerHubKeys.recommendSkills(), queryFn: () => careerHubApi.recommendSkills() });
}
export function useRecommendedLearning() {
  return useQuery({ queryKey: careerHubKeys.recommendLearning(), queryFn: () => careerHubApi.recommendLearning() });
}
export function usePredictedSalary() {
  return useQuery({ queryKey: careerHubKeys.predictSalary(), queryFn: () => careerHubApi.predictSalary(), retry: false });
}
