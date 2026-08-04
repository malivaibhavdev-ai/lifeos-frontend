import { COLORS } from '../theme/colors';

// Shown briefly while a lazy-loaded route chunk downloads. Same spinner
// treatment as RootLayout's SplashLoader for visual consistency.
export function RouteLoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center py-24" role="status" aria-label="Loading">
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700"
        style={{ borderTopColor: COLORS.primary }}
      />
    </div>
  );
}
