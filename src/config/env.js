// VITE_* vars are inlined at build time by Vite. Override via VITE_API_URL in .env.local.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://192.168.1.16:5000/api/v1';

export const IS_DEV = import.meta.env.DEV;
