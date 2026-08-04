import { useQuery } from '@tanstack/react-query';
import { documentAnalyticsApi } from '../api/documentAnalytics.api';

export function useDocumentStorageUsage() {
  return useQuery({ queryKey: ['documentAnalytics', 'storage'], queryFn: () => documentAnalyticsApi.storageUsage() });
}

export function useDocumentGrowthTrend(params) {
  return useQuery({ queryKey: ['documentAnalytics', 'growth', params], queryFn: () => documentAnalyticsApi.growthTrend(params) });
}

export function useDocumentCategoriesBreakdown() {
  return useQuery({ queryKey: ['documentAnalytics', 'categories'], queryFn: () => documentAnalyticsApi.categoriesBreakdown() });
}

export function useDocumentLargestFiles(limit) {
  return useQuery({ queryKey: ['documentAnalytics', 'largestFiles', limit], queryFn: () => documentAnalyticsApi.largestFiles(limit) });
}

export function useDocumentDuplicateSummary() {
  return useQuery({ queryKey: ['documentAnalytics', 'duplicates'], queryFn: () => documentAnalyticsApi.duplicateSummary() });
}

export function useDocumentUploadTrend(params) {
  return useQuery({ queryKey: ['documentAnalytics', 'uploadTrend', params], queryFn: () => documentAnalyticsApi.uploadTrend(params) });
}

export function useDocumentDownloadTrend(params) {
  return useQuery({ queryKey: ['documentAnalytics', 'downloadTrend', params], queryFn: () => documentAnalyticsApi.downloadTrend(params) });
}

export function useDocumentShareAnalytics() {
  return useQuery({ queryKey: ['documentAnalytics', 'shares'], queryFn: () => documentAnalyticsApi.shareAnalytics() });
}

export function useDocumentFolderAnalytics() {
  return useQuery({ queryKey: ['documentAnalytics', 'folders'], queryFn: () => documentAnalyticsApi.folderAnalytics() });
}

export function useDocumentRetentionAnalytics() {
  return useQuery({ queryKey: ['documentAnalytics', 'retention'], queryFn: () => documentAnalyticsApi.retentionAnalytics() });
}

export function useDocumentActivityHeatmap(windowDays) {
  return useQuery({ queryKey: ['documentAnalytics', 'heatmap', windowDays], queryFn: () => documentAnalyticsApi.activityHeatmap(windowDays) });
}

export function useDocumentScore() {
  return useQuery({ queryKey: ['documentAnalytics', 'score'], queryFn: () => documentAnalyticsApi.score() });
}
