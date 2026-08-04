import { useQuery, useQueryClient } from '@tanstack/react-query';
import { careerProfileApi } from '../api/careerProfile.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const careerProfileKeys = { all: ['careerProfile'] };

function invalidateCareerProfile(queryClient) {
  queryClient.invalidateQueries({ queryKey: careerProfileKeys.all });
  queryClient.invalidateQueries({ queryKey: ['careerHub'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useCareerProfile() {
  return useQuery({ queryKey: careerProfileKeys.all, queryFn: () => careerProfileApi.get() });
}

export function useUpdateCareerProfile() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'careerProfile', opType: 'update', method: 'PATCH', buildUrl: () => '/career-profile',
    apiCall: (payload) => careerProfileApi.update(payload),
    onSuccess: () => invalidateCareerProfile(queryClient),
  });
}
