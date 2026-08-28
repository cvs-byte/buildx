import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types/auth.types';
import { Loader } from '../components/common/Loader';
import { normalizeRole } from '../utils/roleNormalizer';
import { getDashboardForRole } from '../utils/constants';

export interface ProtectedRouteProps {
  allowedRoles?: (Role | string)[];
  requireSchoolId?: boolean;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader fullScreen message="Verifying authentication credentials..." />;
  }

  if (!isAuthenticated || !role) {
    console.warn(`[AUTH GUARD] Unauthenticated access attempt to "${location.pathname}". Bouncing to /login.`);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let currentNormalizedRole: Role;
  try {
    currentNormalizedRole = normalizeRole(role);
  } catch (err) {
    console.error(`[AUTH GUARD] Account role "${role}" is not configured for this application.`);
    return <Navigate to="/unauthorized" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const isAllowed = allowedRoles.some((r) => {
      try {
        const normR = normalizeRole(r);
        return normR === currentNormalizedRole;
      } catch {
        return String(r).toLowerCase().trim() === String(role).toLowerCase().trim();
      }
    });

    if (!isAllowed) {
      console.warn(
        `[AUTH GUARD] ACCESS DENIED: Role "${currentNormalizedRole}" attempted to access restricted route "${location.pathname}".`
      );
      try {
        const assignedDashboard = getDashboardForRole(currentNormalizedRole);
        if (location.pathname !== assignedDashboard) {
          return <Navigate to={assignedDashboard} replace />;
        }
      } catch {
        // Fall through to unauthorized
      }
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export const RoleRoute = ProtectedRoute;
