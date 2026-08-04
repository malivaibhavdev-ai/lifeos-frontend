import { useQuery, useQueryClient } from '@tanstack/react-query';
import { skillApi } from '../api/skill.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const skillKeys = { all: ['skills'], list: (params) => [...skillKeys.all, 'list', params] };

function invalidateSkills(queryClient) {
  queryClient.invalidateQueries({ queryKey: skillKeys.all });
  queryClient.invalidateQueries({ queryKey: ['careerHub'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useSkillList(params) {
  return useQuery({ queryKey: skillKeys.list(params), queryFn: () => skillApi.list(params) });
}
export function useCreateSkill() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'skill', opType: 'create', method: 'POST', buildUrl: () => '/skills',
    apiCall: (payload) => skillApi.create(payload),
    onSuccess: () => invalidateSkills(queryClient),
  });
}
export function useUpdateSkill() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'skill', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/skills/${id}`,
    apiCall: ({ id, ...payload }) => skillApi.update(id, payload),
    onSuccess: () => invalidateSkills(queryClient),
  });
}
export function useDeleteSkill() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'skill', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/skills/${id}`,
    apiCall: (id) => skillApi.delete(id),
    onSuccess: () => invalidateSkills(queryClient),
  });
}
export function useMarkSkillPracticed() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'skill', opType: 'update', method: 'PATCH', buildUrl: (id) => `/skills/${id}/practiced`,
    apiCall: (id) => skillApi.markPracticed(id),
    onSuccess: () => invalidateSkills(queryClient),
  });
}
