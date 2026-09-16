import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/waiter'} replace />;
  }

  return children;
}
