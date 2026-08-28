import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { School, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from './useAuth';
import { UserRole } from '../types';
import { Button } from '../components/ui/Button';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading, error, signIn } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20 animate-pulse mb-6">
          <School className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">AcademyGrowth</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
          <span>Verifying authentication session...</span>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Authentication Error</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-6">
          Unable to sign you in. Please verify your connection or try again.
        </p>
        <Button variant="primary" size="md" onClick={() => signIn()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !user.role || !allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children ? <>{children}</> : null;
};
