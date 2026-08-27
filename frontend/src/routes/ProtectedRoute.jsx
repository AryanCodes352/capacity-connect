/**
 * src/routes/ProtectedRoute.jsx — JWT + RBAC Route Guard
 *
 * Wraps any route that requires authentication and optionally a specific role.
 *
 * Usage in AppRouter:
 *
 *   // Any logged-in user
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 *   // Admin only
 *   <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
 *     <Route path="/admin/employees" element={<Employees />} />
 *   </Route>
 *
 * Logic:
 *   1. If isLoading → show spinner (prevents flash of login page on refresh)
 *   2. If not authenticated → redirect to /login (save intended URL)
 *   3. If role not allowed → redirect to /unauthorized
 *   4. Otherwise → render child routes
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While checking localStorage for existing session, show nothing
  // (prevents a flash redirect to /login on page refresh)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Not logged in — redirect to login, save the page they were trying to visit
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks passed — render child routes
  return <Outlet />;
}
