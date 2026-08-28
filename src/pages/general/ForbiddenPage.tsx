import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">403 — Access Forbidden</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          You do not have permission to access this portal route under your current authenticated role.
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Return to Home
        </Button>
      </div>
    </div>
  );
};
