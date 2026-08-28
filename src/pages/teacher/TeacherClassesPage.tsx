import React from 'react';
import { Card } from '../../components/ui/Card';

export const TeacherClassesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Assigned Classes</h1>
        <p className="text-xs text-slate-500 mt-1">Class sections, subjects, and student count allocated to you.</p>
      </div>

      <Card className="p-16 text-center text-slate-500">
        <p className="text-base font-bold text-slate-700 dark:text-slate-200">No classes assigned yet.</p>
      </Card>
    </div>
  );
};
