import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <Card className="max-w-md p-8 space-y-6 shadow-2xl rounded-3xl border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Unauthorized Access</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Your account does not have permission to access this dashboard.
          </p>
          {user?.email && (
            <p className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-900 py-1.5 px-3 rounded-lg mt-2 truncate">
              Signed in as: {user.email}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button variant="primary" size="md" onClick={() => navigate('/')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to Home
          </Button>
          {isAuthenticated && (
            <Button variant="outline" size="md" onClick={() => signOut()} leftIcon={<LogOut className="w-4 h-4" />}>
              Sign Out
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
