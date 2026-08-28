import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserCheck, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from './useAuth';
import { UserRole } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface RoleGuardProps {
  roles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ roles, children }) => {
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated in Cognito but has no assigned role / cognito:groups
  if (!user || !user.role) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-md p-8 space-y-6 shadow-2xl rounded-3xl border-slate-200 dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <UserCheck className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Authentication Successful</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your account is authenticated, but no AcademyGrowth role has been assigned yet.
            </p>
            <p className="text-xs font-semibold text-slate-500 pt-1">
              Please contact your administrator to assign a portal role (e.g. STUDENT, TEACHER, PARENT, ADMIN).
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button variant="outline" size="md" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isAllowed = roles.includes(user.role);

  if (!isAllowed) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
