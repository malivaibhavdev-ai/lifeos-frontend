import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useDarkMode } from '../utils/useDarkMode';
import { RouteLoadingFallback } from './RouteLoadingFallback';

// Establishes the full-viewport flex height context that Screen's `flex-1`
// classes need — without an ancestor like this, `flex-1` has no effect and
// content doesn't fill/center in the viewport.
export function AuthLayout() {
  useDarkMode();
  return (
    <div className="flex h-screen w-screen flex-col bg-surface-light dark:bg-surface-dark">
      <Suspense fallback={<RouteLoadingFallback />}>
        <Outlet />
      </Suspense>
    </div>
  );
}
