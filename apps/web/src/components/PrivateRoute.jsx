import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function PrivateRoute({ children, role, requireSuperAdmin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (requireSuperAdmin && !user.isSuperAdmin) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/waiter'} replace />;
  }

  if (role) {
    const rolesAllowed = Array.isArray(role) ? role : [role];
    if (!rolesAllowed.includes(user.role) && !user.isSuperAdmin) {
      const fallbackPath = user.role === 'ADMIN' ? '/admin' : '/waiter';
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return children;
}