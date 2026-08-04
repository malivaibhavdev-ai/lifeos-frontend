import { useRouteError, useNavigate, isRouteErrorResponse } from 'react-router-dom';
import { COLORS } from '../theme/colors';

// Route-tree-level counterpart to components/ui/ErrorBoundary.jsx — catches
// errors React Router itself surfaces (a lazy route chunk failing to fetch
// after a deploy, a malformed URL param, etc.) without tearing down
// everything outside the router (the top-level ErrorBoundary is the
// last-resort fallback for anything that escapes this).
export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const isChunkLoadError = error instanceof Error && /dynamically imported module|Failed to fetch/.test(error.message ?? '');

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-surface-light px-6 text-center dark:bg-surface-dark">
      <p className="text-xl font-bold text-gray-900 dark:text-white">
        {isRouteErrorResponse(error) ? `${error.status} — page not found` : 'Something went wrong'}
      </p>
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {isChunkLoadError
          ? 'A new version of the app may have been deployed — reloading should fix this.'
          : 'This page hit an unexpected error.'}
      </p>
      <div className="mt-6 flex flex-row gap-3">
        <button
          type="button"
          onClick={() => (isChunkLoadError ? window.location.reload() : navigate('/'))}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: COLORS.primary }}
        >
          {isChunkLoadError ? 'Reload' : 'Go to Dashboard'}
        </button>
      </div>
    </div>
  );
}
