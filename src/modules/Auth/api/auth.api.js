import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const authApi = {
  register: (name, email, password) => call(apiClient.post('/auth/register', { name, email, password })),

  login: (email, password) => call(apiClient.post('/auth/login', { email, password })),

  googleLogin: (idToken) => call(apiClient.post('/auth/google', { idToken })),

  forgotPassword: (email) => call(apiClient.post('/auth/forgot-password', { email })),

  resetPassword: (token, password) => call(apiClient.post('/auth/reset-password', { token, password })),

  changePassword: (currentPassword, newPassword) =>
    call(apiClient.post('/auth/change-password', { currentPassword, newPassword })),

  logout: (refreshToken) => call(apiClient.post('/auth/logout', { refreshToken })),

  logoutAll: () => call(apiClient.post('/auth/logout-all')),

  setPin: (pin) => call(apiClient.post('/auth/pin/set', { pin })),

  verifyPin: (pin) => call(apiClient.post('/auth/pin/verify', { pin })),

  setBiometric: (enabled) => call(apiClient.patch('/auth/biometric', { enabled })),

  me: () => call(apiClient.get('/auth/me')),
};
