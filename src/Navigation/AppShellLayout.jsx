import { Suspense, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarContent } from './SidebarContent';
import { RouteLoadingFallback } from './RouteLoadingFallback';
import { Icon } from '../components/ui/Icon';
import { useDarkMode } from '../utils/useDarkMode';
import { COLORS } from '../theme/colors';

// Desktop gets a persistent sidebar (>= md); narrow viewports get a
// hamburger-toggled slide-in drawer instead — same navigation content
// (SidebarContent) either way, mirroring the mobile app's
// AppDrawerContent module list plus the 4 primary bottom-tab destinations.
// >= xl also gets a wider sidebar and a max-width-constrained, centered
// content column so text/card grids don't stretch edge-to-edge on large
// desktop monitors — the mobile-width single-column reading measure is
// preserved, just centered with breathing room either side.
export function AppShellLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef(null);
  useDarkMode();

  // Move focus to the new page's main region on every route change — the
  // single most important keyboard/screen-reader fix for an SPA shell,
  // otherwise focus silently stays on whatever link/button was clicked.
  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-light dark:bg-surface-dark">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <nav aria-label="Primary" className="hidden md:flex md:w-72 xl:w-80 md:flex-shrink-0 md:border-r md:border-gray-100 md:dark:border-gray-800">
        <SidebarContent />
      </nav>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <nav aria-label="Primary" className="relative flex h-full w-72 max-w-[82%] flex-col">
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </nav>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-shrink-0 flex-row items-center border-b border-gray-100 px-4 py-3 dark:border-gray-800 md:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="mr-3 h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
            aria-label="Open menu"
          >
            <Icon name="menu-outline" size={20} color={COLORS.mutedDark} />
          </button>
          <span className="text-base font-bold text-gray-900 dark:text-white">SelfOS</span>
        </header>

        <main id="main-content" ref={mainRef} tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto outline-none">
          <Suspense fallback={<RouteLoadingFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
