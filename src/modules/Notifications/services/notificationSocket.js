import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../../config/env';
import { useAuthStore } from '../../../Store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { queryClient } from '../../../contexts/QueryProvider';
import { notificationKeys } from '../hooks/useNotifications';

// Web port of the mobile app's own notificationSocket.js — a single
// module-level socket instance shared by every page, same idempotent
// connect/disconnect contract.
let socket = null;

function handleIncomingNotification() {
  useNotificationStore.getState().incrementUnread(1);
  queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  queryClient.invalidateQueries({ queryKey: notificationKeys.dashboard() });
}

function handleUpdated() {
  queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  queryClient.invalidateQueries({ queryKey: notificationKeys.dashboard() });
}

function handleAllRead() {
  useNotificationStore.getState().resetUnread();
  queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  queryClient.invalidateQueries({ queryKey: notificationKeys.dashboard() });
}

export function connectNotificationSocket(householdIds = []) {
  const { accessToken, isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated || !accessToken) return;
  if (socket?.connected) return;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token: accessToken },
    transports: ['websocket'],
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  socket.on('connect', () => {
    useNotificationStore.getState().setSocketConnected(true);
    householdIds.forEach((id) => socket.emit('household:join', id));
  });

  socket.on('disconnect', () => useNotificationStore.getState().setSocketConnected(false));
  socket.on('connect_error', () => useNotificationStore.getState().setSocketConnected(false));

  socket.on('notification:new', handleIncomingNotification);
  socket.on('notification:updated', handleUpdated);
  socket.on('notification:all-read', handleAllRead);
  socket.on('notification:deleted', handleUpdated);
}

export function joinHouseholdRoom(householdId) {
  if (socket?.connected && householdId) socket.emit('household:join', householdId);
}

export function disconnectNotificationSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  useNotificationStore.getState().setSocketConnected(false);
}
