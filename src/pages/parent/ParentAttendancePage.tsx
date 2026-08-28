import React from 'react';
import { Card } from '../../components/ui/Card';

export const ParentAttendancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Child Attendance Monitor</h1>
        <p className="text-xs text-slate-500 mt-1">Review present, absent, and late log records for your associated student.</p>
      </div>

      <Card className="p-16 text-center text-slate-500">
        <p className="text-base font-bold text-slate-700 dark:text-slate-200">No attendance records available for selected child.</p>
      </Card>
    </div>
  );
};
