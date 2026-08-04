import axios from 'axios';
import { API_URL } from '../config/env';
import { useAuthStore } from '../Store/authStore';

// Endpoints that must never carry a stale Authorization header or trigger a
// refresh-and-retry loop on 401 — refreshing here would either be pointless
// (already the refresh call) or recurse forever.
const AUTH_EXEMPT_PATHS = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/google'];

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  const isExempt = AUTH_EXEMPT_PATHS.some((path) => config.url?.startsWith(path));
  if (accessToken && !isExempt) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Concurrent requests that 401 at the same time must share a single
// in-flight refresh call instead of each firing their own.
let refreshPromise = null;

async function refreshAccessToken() {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) throw new Error('No refresh token available');

  const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
  const tokens = data.data;
  await useAuthStore.getState().setTokens(tokens);
  return tokens.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isExempt = AUTH_EXEMPT_PATHS.some((path) => config?.url?.startsWith(path));

    if (response?.status === 401 && !isExempt && !config._retried) {
      config._retried = true;
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const accessToken = await refreshPromise;
        config.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(config);
      } catch (refreshError) {
        await useAuthStore.getState().clearSession();
        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
);

// Backend always responds { success, message, data }. Unwrap it here so
// callers deal in plain data/ApiError, never in axios/response envelopes.
export function unwrap(promise) {
  return promise.then((res) => res.data.data);
}

export class ApiRequestError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function toApiError(error) {
  if (error.response) {
    const { message, details } = error.response.data ?? {};
    return new ApiRequestError(message ?? 'Something went wrong', error.response.status, details);
  }
  if (error.request) {
    return new ApiRequestError('Unable to reach the server. Check your connection.', 0);
  }
  return new ApiRequestError(error.message ?? 'Unexpected error', 0);
}
