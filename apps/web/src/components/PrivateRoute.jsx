import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (role && user.role !== role) {
    const fallbackPath = user.role === 'ADMIN' ? '/admin' : '/waiter';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}