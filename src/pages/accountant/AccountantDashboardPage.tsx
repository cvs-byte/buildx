import React from 'react';
import { DollarSign, Users, FileCheck, BarChart3 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const AccountantDashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <Badge variant="primary">BURSAR DESK</Badge>
          <span className="text-xs text-slate-500">Financial Ledger Management</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mt-2">Accountant Overview</h1>
        <p className="text-xs text-slate-500">Track tuition collections, pending fee balances, and payment receipts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-500">Total Revenue Collected</span>
          <p className="text-2xl font-black">—</p>
          <p className="text-[10px] text-slate-400">Total ledger balance</p>
        </Card>
        <Card className="p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-500">Pending Balances</span>
          <p className="text-2xl font-black text-amber-600">—</p>
          <p className="text-[10px] text-slate-400">Uncollected fees</p>
        </Card>
        <Card className="p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-500">Overdue Receipts</span>
          <p className="text-2xl font-black text-rose-600">—</p>
          <p className="text-[10px] text-slate-400">Past due date</p>
        </Card>
        <Card className="p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-500">Transactions Today</span>
          <p className="text-2xl font-black text-emerald-600">—</p>
          <p className="text-[10px] text-slate-400">Receipts processed</p>
        </Card>
      </div>

      <Card className="p-16 text-center text-slate-500">
        <p className="text-base font-bold text-slate-700 dark:text-slate-200">No financial ledger records available.</p>
        <p className="text-xs text-slate-400 mt-1">Financial data will stream from AWS API Gateway payment endpoints.</p>
      </Card>
    </div>
  );
};
