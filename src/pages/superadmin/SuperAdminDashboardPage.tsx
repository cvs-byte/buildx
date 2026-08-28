import React from 'react';
import { ShieldAlert, Building, Users, Key } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const SuperAdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <Badge variant="danger">SUPER ADMIN CONSOLE</Badge>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">Platform Governance & Multi-Tenant Oversight</h1>
        <p className="text-xs text-slate-400 mt-1">Global institution management, Cognito User Pool security, and CloudTrail audit streams.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card className="p-6 bg-slate-950 border-slate-800 text-white space-y-2">
          <span className="text-xs font-semibold text-slate-400">Total Institutions</span>
          <p className="text-3xl font-black">—</p>
        </Card>
        <Card className="p-6 bg-slate-950 border-slate-800 text-white space-y-2">
          <span className="text-xs font-semibold text-slate-400">Global Users</span>
          <p className="text-3xl font-black">—</p>
        </Card>
        <Card className="p-6 bg-slate-950 border-slate-800 text-white space-y-2">
          <span className="text-xs font-semibold text-slate-400">Cognito Groups</span>
          <p className="text-3xl font-black">6 Roles</p>
        </Card>
        <Card className="p-6 bg-slate-950 border-slate-800 text-white space-y-2">
          <span className="text-xs font-semibold text-slate-400">Audit Stream</span>
          <p className="text-3xl font-black text-emerald-400">Active</p>
        </Card>
      </div>

      <Card className="p-16 text-center bg-slate-950 border-slate-800 text-slate-400">
        <p className="text-base font-bold text-white">Super Admin Control Engine Online.</p>
      </Card>
    </div>
  );
};
