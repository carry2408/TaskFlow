import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/ui';

export function ProtectedRoute({ children, requiredRole }) {
  const { user, token, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function PublicOnlyRoute({ children }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  if (token && user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

