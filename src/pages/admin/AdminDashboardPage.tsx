import React from 'react';
import { ShieldAlert, Users, School, DollarSign, UserCheck, FileSpreadsheet, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <Badge variant="primary">ACADEMY ADMIN</Badge>
          <span className="text-xs text-slate-400 font-mono">AWS Cognito Operational Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">Institutional Management Overview</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time student metrics, attendance oversight, fee ledgers, and academic results.</p>
      </div>

      {/* Metrics Grid showing STRICT empty states */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-slate-950 border-slate-800 text-white space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Students</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-black">—</p>
          <p className="text-[10px] text-slate-500">Registered student profiles</p>
        </Card>

        <Card className="p-6 bg-slate-950 border-slate-800 text-white space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Teachers</span>
            <School className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-3xl font-black">—</p>
          <p className="text-[10px] text-slate-500">Active faculty accounts</p>
        </Card>

        <Card className="p-6 bg-slate-950 border-slate-800 text-white space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Today's Attendance</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black">—</p>
          <p className="text-[10px] text-slate-500">Daily verification rate</p>
        </Card>

        <Card className="p-6 bg-slate-950 border-slate-800 text-white space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pending Fees</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black">—</p>
          <p className="text-[10px] text-slate-500">Outstanding ledger balance</p>
        </Card>
      </div>

      <Card className="p-16 text-center bg-slate-950 border-slate-800 text-slate-400 space-y-3">
        <ShieldAlert className="w-10 h-10 text-indigo-500 mx-auto" />
        <h3 className="text-base font-bold text-white">AWS Infrastructure Prepared</h3>
        <p className="text-xs max-w-md mx-auto">
          Connect your API Gateway base URL and DynamoDB table identifiers to stream live student counts and financial ledgers into this dashboard.
        </p>
      </Card>
    </div>
  );
};
