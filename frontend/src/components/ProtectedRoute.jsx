import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading, activeRole, switchRole } = useAuth();

  // If user has the required role in their roleset but it's not the activeRole, auto-switch
  const requiredRole = roles?.find((r) => user?.roleset?.includes(r));

  useEffect(() => {
    if (requiredRole && requiredRole !== activeRole && user?.roleset?.includes(requiredRole)) {
      switchRole(requiredRole);
    }
  }, [requiredRole, activeRole, user, switchRole]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.some((r) => user.roleset?.includes(r)))
    return <Navigate to="/" replace />;
  return children;
}
