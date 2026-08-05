// VITE_* vars are inlined at build time by Vite. Override via VITE_API_URL in .env.local.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://192.168.1.16:5000/api/v1';

// Socket.IO connects to the bare server origin, not the REST /api/v1
// prefix — derive it from API_URL so a single env var still configures both.
export const SOCKET_URL = API_URL.replace(/\/api\/v\d+\/?$/, '');

export const IS_DEV = import.meta.env.DEV;
