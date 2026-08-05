import { useEffect } from 'react';
import { useAuthStore } from '../../../Store/authStore';
import { useUnreadCountSync } from '../hooks/useNotifications';
import { connectNotificationSocket, disconnectNotificationSocket } from '../services/notificationSocket';

// Invisible — mounted once near the app root (see App.jsx), inside
// QueryProvider (unlike App itself, which renders QueryProvider and so
// can't use react-query hooks directly). Owns the Notification OS's two
// pieces of always-on client state: the live Socket.IO connection and the
// unread-badge sync, exactly mirroring the mobile app's own
// RootNavigator wiring.
export function NotificationRealtimeBridge() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useUnreadCountSync(isHydrated && isAuthenticated);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      connectNotificationSocket();
    } else {
      disconnectNotificationSocket();
    }
  }, [isHydrated, isAuthenticated]);

  return null;
}
