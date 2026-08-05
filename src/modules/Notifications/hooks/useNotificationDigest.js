import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationDigestApi } from '../api/notificationDigest.api';
import { notificationKeys } from './useNotifications';

export function useGenerateNotificationDigest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (period) => notificationDigestApi.generate(period),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
