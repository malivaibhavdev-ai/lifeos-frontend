import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../Store/authStore';

// Mirrors RootNavigator's `isAuthenticated ? AppDrawerNavigator : AuthNavigator`
// exclusivity — an authenticated user can't land on /login, an
// unauthenticated one can't land on the app shell.
export function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RedirectIfAuthed() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}
