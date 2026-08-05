import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { deviceApi } from '../api/device.api';

export const deviceKeys = {
  all: ['notificationDevices'],
  list: () => [...deviceKeys.all, 'list'],
  vapidKey: ['notificationVapidKey'],
};

export function useDevices() {
  return useQuery({ queryKey: deviceKeys.list(), queryFn: () => deviceApi.list() });
}

export function useVapidPublicKey() {
  return useQuery({ queryKey: deviceKeys.vapidKey, queryFn: () => deviceApi.getVapidPublicKey(), staleTime: Infinity });
}

export function useRegisterWebDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => deviceApi.registerWeb(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: deviceKeys.all }),
  });
}

export function useRemoveDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deviceApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: deviceKeys.all }),
  });
}
