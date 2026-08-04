import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { analyticsAlertApi } from '../api/analyticsAlert.api';
import { useOfflineMutation } from '../../../services/offlineSync';

const ruleKey = ['alertRules'];
const alertKey = ['analyticsAlerts'];

export function useAlertRules() {
  return useQuery({ queryKey: ruleKey, queryFn: () => analyticsAlertApi.listRules() });
}

export function useCreateAlertRule() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'alertRule', opType: 'create', method: 'POST', buildUrl: () => '/analytics/alert-rules',
    apiCall: (payload) => analyticsAlertApi.createRule(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ruleKey }),
  });
}

export function useUpdateAlertRule() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'alertRule', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/analytics/alert-rules/${id}`,
    apiCall: ({ id, payload }) => analyticsAlertApi.updateRule(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ruleKey }),
  });
}

export function useDeleteAlertRule() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'alertRule', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/analytics/alert-rules/${id}`,
    apiCall: (id) => analyticsAlertApi.deleteRule(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ruleKey }),
  });
}

export function useEvaluateAlertRulesNow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => analyticsAlertApi.evaluateNow(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: alertKey }),
  });
}

export function useAnalyticsAlerts(params) {
  return useQuery({ queryKey: [...alertKey, params], queryFn: () => analyticsAlertApi.listAlerts(params) });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => analyticsAlertApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: alertKey }),
  });
}

export function useMarkAllAlertsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => analyticsAlertApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: alertKey }),
  });
}
