import { useSyncExternalStore } from 'react';

// Web replacement for the mobile app's expo-network wrapper. Same public API
// (getIsOnline/initNetworkMonitor/subscribeNetworkStatus/useIsOnline) so
// syncManager.js and consumers need zero changes — only the underlying signal
// differs (navigator.onLine + online/offline events instead of expo-network).
let isOnline = navigator.onLine;
let listeners = [];
let initialized = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function setOnline(next) {
  if (next === isOnline) return;
  isOnline = next;
  emit();
}

export function initNetworkMonitor() {
  if (initialized) return;
  initialized = true;

  window.addEventListener('online', () => setOnline(true));
  window.addEventListener('offline', () => setOnline(false));
}

export function getIsOnline() {
  return isOnline;
}

function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function subscribeNetworkStatus(listener) {
  return subscribe(listener);
}

export function useIsOnline() {
  return useSyncExternalStore(subscribe, getIsOnline, getIsOnline);
}
