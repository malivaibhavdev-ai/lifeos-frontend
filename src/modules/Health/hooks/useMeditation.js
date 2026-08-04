import { useQuery, useQueryClient } from '@tanstack/react-query';
import { meditationApi } from '../api/meditation.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const meditationKeys = {
  all: ['meditation'],
  list: (params) => [...meditationKeys.all, 'list', params],
  streak: () => [...meditationKeys.all, 'streak'],
};

function invalidateMeditation(queryClient) {
  queryClient.invalidateQueries({ queryKey: meditationKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useMeditationList(params) {
  return useQuery({ queryKey: meditationKeys.list(params), queryFn: () => meditationApi.list(params) });
}

export function useMeditationStreak() {
  return useQuery({ queryKey: meditationKeys.streak(), queryFn: () => meditationApi.streak() });
}

export function useCreateMeditation() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'meditationSession', opType: 'create', method: 'POST', buildUrl: () => '/meditation',
    apiCall: (payload) => meditationApi.create(payload),
    onSuccess: () => invalidateMeditation(queryClient),
  });
}

export function useDeleteMeditation() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'meditationSession', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/meditation/${id}`,
    apiCall: (id) => meditationApi.delete(id),
    onSuccess: () => invalidateMeditation(queryClient),
  });
}
