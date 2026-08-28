import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, UserCheck, FileSpreadsheet, Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const TeacherDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-2">
        <Badge variant="primary">TEACHER DASHBOARD</Badge>
        <h1 className="text-3xl font-extrabold tracking-tight">Faculty Management Portal</h1>
        <p className="text-xs text-slate-400">Mark daily attendance, submit examination marks, and view assigned class rosters.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/teacher/classes')}>
          <span className="text-xs font-semibold text-slate-500">Assigned Classes</span>
          <p className="text-2xl font-black">—</p>
          <p className="text-[10px] text-slate-400">Active class sections</p>
        </Card>

        <Card className="p-6 space-y-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/teacher/attendance')}>
          <span className="text-xs font-semibold text-slate-500">Attendance Pending</span>
          <p className="text-2xl font-black text-amber-600">—</p>
          <p className="text-[10px] text-slate-400">Today's class logs</p>
        </Card>

        <Card className="p-6 space-y-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/teacher/results')}>
          <span className="text-xs font-semibold text-slate-500">Results Pending</span>
          <p className="text-2xl font-black text-indigo-600">—</p>
          <p className="text-[10px] text-slate-400">Term exam entries</p>
        </Card>

        <Card className="p-6 space-y-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/teacher/students')}>
          <span className="text-xs font-semibold text-slate-500">Total Students</span>
          <p className="text-2xl font-black text-emerald-600">—</p>
          <p className="text-[10px] text-slate-400">Enrolled learners</p>
        </Card>
      </div>

      <Card className="p-16 text-center text-slate-500">
        <p className="text-base font-bold text-slate-700 dark:text-slate-200">No data available.</p>
        <p className="text-xs text-slate-400 mt-1">Class schedules will load dynamically from your AWS DynamoDB teacher allocation table.</p>
      </Card>
    </div>
  );
};
