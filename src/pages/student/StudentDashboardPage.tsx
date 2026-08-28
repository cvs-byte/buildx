import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, FileSpreadsheet, DollarSign, Calendar, Sparkles, Activity, AlertCircle } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { attendanceService, AttendanceSummary } from '../../services/attendanceService';
import { feeService, FeeSummary } from '../../services/feeService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [attSummary, setAttSummary] = useState<AttendanceSummary | null>(null);
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [att, fee] = await Promise.all([
          attendanceService.getStudentAttendance(),
          feeService.getStudentFees(),
        ]);
        setAttSummary(att.summary);
        setFeeSummary(fee.summary);
      } catch {
        // Safe empty state handling
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const studentName = user ? `${user.firstName} ${user.lastName}` : 'Student';

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Academy Student Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Welcome back, {studentName}
        </h1>
        <p className="text-xs text-slate-400">
          Track your attendance percentage, term marks, pending fee balances, and upcoming campus events.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/student/attendance')}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Overall Attendance</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {attSummary ? `${attSummary.overallPercentage}%` : '—'}
            </p>
          )}
          <p className="text-[10px] text-slate-400">Digital attendance summary</p>
        </Card>

        <Card className="p-6 space-y-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/student/results')}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Recent Term Grade</span>
            <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl font-black text-slate-900 dark:text-white">—</p>
          )}
          <p className="text-[10px] text-slate-400">Published marksheets</p>
        </Card>

        <Card className="p-6 space-y-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/student/fees')}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Pending Fee Balance</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {feeSummary ? `$${feeSummary.pendingFee}` : '—'}
            </p>
          )}
          <p className="text-[10px] text-slate-400">Tuition & ledger balance</p>
        </Card>

        <Card className="p-6 space-y-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/student/events')}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Upcoming Events</span>
            <Calendar className="w-4 h-4 text-sky-500" />
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl font-black text-slate-900 dark:text-white">—</p>
          )}
          <p className="text-[10px] text-slate-400">Scheduled campus events</p>
        </Card>
      </div>

      {/* Main Grid: Empty States */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-8 text-center space-y-3">
            <UserCheck className="w-10 h-10 text-indigo-500 mx-auto" />
            <h3 className="text-base font-bold">No attendance records available.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your daily class attendance records will appear here once recorded by your class teachers.
            </p>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-3">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>Campus Notices</span>
            </h3>
            <p className="text-xs text-slate-500">No notices available.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
