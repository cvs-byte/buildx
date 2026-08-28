import React from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export const AdminSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Platform Governance Settings</h1>
        <p className="text-xs text-slate-400">AWS Region, Cognito User Pool ID, API Gateway URL configuration parameters.</p>
      </div>

      <Card className="p-6 bg-slate-950 border-slate-800 space-y-4 text-slate-300">
        <Input label="AWS Region" disabled value={import.meta.env.VITE_AWS_REGION || 'us-east-1 (Default)'} />
        <Input label="Cognito User Pool ID" disabled value={import.meta.env.VITE_COGNITO_USER_POOL_ID || 'Not Configured Yet'} />
        <Input label="API Gateway Base URL" disabled value={import.meta.env.VITE_API_BASE_URL || 'Not Configured Yet'} />
      </Card>
    </div>
  );
};
