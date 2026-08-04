import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../Store/authStore';
import { COLORS } from '../theme/colors';

function SplashLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-surface-light dark:bg-surface-dark">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700"
        style={{ borderTopColor: COLORS.primary }}
      />
    </div>
  );
}

// Mirrors RootNavigator: hydrate the session from storage once before any
// route decides whether to show Auth or the App shell.
export function RootLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated) return <SplashLoader />;

  return <Outlet />;
}
