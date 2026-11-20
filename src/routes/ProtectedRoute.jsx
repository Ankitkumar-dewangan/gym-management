import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Route guard scaffold ready for Step 2 authentication enforcement.
 * In frontend foundation preview mode (`allowPreview = true`), layouts remain
 * directly inspectable across roles without blocking URL verification.
 */
export function ProtectedRoute({ allowedRoles = [], allowPreview = true, children }) {
  const { user, isAuthenticated } = useAuth();

  if (!allowPreview && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    !allowPreview &&
    allowedRoles.length > 0 &&
    user &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
