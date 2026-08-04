import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../Store/authStore';
import { authApi } from '../api/auth.api';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => authApi.login(email, password),
    onSuccess: (result) => setSession(result),
  });

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password }) => authApi.register(name, email, password),
    onSuccess: (result) => setSession(result),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: ({ email }) => authApi.forgotPassword(email),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }) => authApi.resetPassword(token, password),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        // Best-effort: even if the server call fails, the local session still clears.
        await authApi.logout(refreshToken).catch(() => {});
      }
    },
    onSettled: () => clearSession(),
  });

  return {
    user,
    isAuthenticated,
    isHydrated,
    login: loginMutation,
    register: registerMutation,
    forgotPassword: forgotPasswordMutation,
    resetPassword: resetPasswordMutation,
    logout: logoutMutation,
  };
}
