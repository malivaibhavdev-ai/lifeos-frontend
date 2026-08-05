import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { notificationRuleApi } from '../api/notificationRule.api';

export const notificationRuleKeys = {
  all: ['notificationRules'],
  list: () => [...notificationRuleKeys.all, 'list'],
  detail: (id) => [...notificationRuleKeys.all, 'detail', id],
};

function invalidate(queryClient) {
  queryClient.invalidateQueries({ queryKey: notificationRuleKeys.all });
}

export function useNotificationRules() {
  return useQuery({ queryKey: notificationRuleKeys.list(), queryFn: () => notificationRuleApi.list() });
}

export function useNotificationRule(id) {
  return useQuery({
    queryKey: notificationRuleKeys.detail(id),
    queryFn: () => notificationRuleApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateNotificationRule() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload) => notificationRuleApi.create(payload), onSuccess: () => invalidate(queryClient) });
}

export function useUpdateNotificationRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => notificationRuleApi.update(id, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteNotificationRule() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id) => notificationRuleApi.delete(id), onSuccess: () => invalidate(queryClient) });
}
