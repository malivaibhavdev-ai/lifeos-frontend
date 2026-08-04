import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const dashboardKeys = {
  all: ['analyticsDashboards'],
  list: () => [...dashboardKeys.all, 'list'],
  default: () => [...dashboardKeys.all, 'default'],
  detail: (id) => [...dashboardKeys.all, 'detail', id],
  widgets: (id) => [...dashboardKeys.all, id, 'widgets'],
};

function invalidate(queryClient) {
  queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
}

export function useDashboards() {
  return useQuery({ queryKey: dashboardKeys.list(), queryFn: () => dashboardApi.list() });
}

export function useDefaultDashboard() {
  return useQuery({ queryKey: dashboardKeys.default(), queryFn: () => dashboardApi.getDefault() });
}

export function useDashboard(id) {
  return useQuery({ queryKey: dashboardKeys.detail(id), queryFn: () => dashboardApi.getById(id), enabled: Boolean(id) });
}

export function useCreateDashboard() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'analyticsDashboard', opType: 'create', method: 'POST', buildUrl: () => '/analytics/dashboards',
    apiCall: (payload) => dashboardApi.create(payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateDashboard() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'analyticsDashboard', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/analytics/dashboards/${id}`,
    apiCall: ({ id, payload }) => dashboardApi.update(id, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteDashboard() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id) => dashboardApi.delete(id), onSuccess: () => invalidate(queryClient) });
}

export function useWidgets(dashboardId) {
  return useQuery({
    queryKey: dashboardKeys.widgets(dashboardId),
    queryFn: () => dashboardApi.listWidgets(dashboardId),
    enabled: Boolean(dashboardId),
  });
}

export function useCreateWidget(dashboardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => dashboardApi.createWidget(dashboardId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardKeys.widgets(dashboardId) }),
  });
}

export function useUpdateWidget(dashboardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ widgetId, payload }) => dashboardApi.updateWidget(dashboardId, widgetId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardKeys.widgets(dashboardId) }),
  });
}

export function useReorderWidgets(dashboardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (widgets) => dashboardApi.reorderWidgets(dashboardId, widgets),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardKeys.widgets(dashboardId) }),
  });
}

export function useDeleteWidget(dashboardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (widgetId) => dashboardApi.deleteWidget(dashboardId, widgetId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardKeys.widgets(dashboardId) }),
  });
}
