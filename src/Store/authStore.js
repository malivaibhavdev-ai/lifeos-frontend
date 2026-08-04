import { create } from 'zustand';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { getItem, getJSON, removeItem, setItem, setJSON } from '../utils/secureStorage';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isHydrated: false,
  isAuthenticated: false,

  // Runs once on app start to restore a session from storage before the
  // router decides whether to show the Auth routes or the App shell.
  hydrate: async () => {
    const [accessToken, refreshToken, user] = await Promise.all([
      getItem(STORAGE_KEYS.ACCESS_TOKEN),
      getItem(STORAGE_KEYS.REFRESH_TOKEN),
      getJSON(STORAGE_KEYS.USER),
    ]);

    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: Boolean(accessToken && refreshToken),
      isHydrated: true,
    });
  },

  setSession: async ({ user, accessToken, refreshToken }) => {
    await Promise.all([
      setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
      setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
      setJSON(STORAGE_KEYS.USER, user),
    ]);
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  // Called by the axios refresh interceptor — only the token pair changes.
  setTokens: async ({ accessToken, refreshToken }) => {
    await Promise.all([
      setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
      setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
    ]);
    set({ accessToken, refreshToken });
  },

  setUser: async (user) => {
    await setJSON(STORAGE_KEYS.USER, user);
    set({ user });
  },

  clearSession: async () => {
    await Promise.all([
      removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      removeItem(STORAGE_KEYS.USER),
    ]);
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  getRefreshToken: () => get().refreshToken,
}));
