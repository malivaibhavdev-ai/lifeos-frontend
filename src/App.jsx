import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryProvider } from './contexts/QueryProvider';
import { router } from './Navigation/router';
import { initializeOfflineSync } from './services/offlineSync';
import { initReminderPolling, stopReminderPolling } from './services/reminderPollingService';
import { ForcedReminderOverlay } from './components/ui/ForcedReminderOverlay';
import { NotificationRealtimeBridge } from './modules/Notifications/components/NotificationRealtimeBridge';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useAuthStore } from './Store/authStore';
import './modules/Notes/syncHandlers';
import './modules/Finance/syncHandlers';
import './modules/Goals/syncHandlers';
import './modules/Habits/syncHandlers';
import './modules/Health/syncHandlers';
import './modules/Career/syncHandlers';
import './modules/Dreams/syncHandlers';
import './modules/Family/syncHandlers';
import './modules/Documents/syncHandlers';
import './modules/Analytics/syncHandlers';
import './modules/Notifications/syncHandlers';

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    initializeOfflineSync();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      initReminderPolling();
      return stopReminderPolling;
    }
    stopReminderPolling();
    return undefined;
  }, [isAuthenticated]);

  return (
    <ErrorBoundary>
      <QueryProvider>
        <RouterProvider router={router} />
        <ForcedReminderOverlay />
        <NotificationRealtimeBridge />
      </QueryProvider>
    </ErrorBoundary>
  );
}
