import React from 'react';
import { Card } from '../../components/ui/Card';

export const AccountantFeesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Fee Structure Management</h1>
        <p className="text-xs text-slate-500 mt-1">Configure tuition, transport, and hostel fee structures by grade level.</p>
      </div>

      <Card className="p-16 text-center text-slate-500">
        <p className="text-base font-bold text-slate-700 dark:text-slate-200">No fee structures configured yet.</p>
      </Card>
    </div>
  );
};
