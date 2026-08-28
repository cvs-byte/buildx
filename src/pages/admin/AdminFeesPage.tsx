import React from 'react';
import { DollarSign, Plus, Download, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

export const AdminFeesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Institutional Fee Management</h1>
          <p className="text-xs text-slate-400">Fee structure configurations, payment ledger, pending balances, and receipt generation.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-slate-700 text-white" leftIcon={<Plus className="w-4 h-4" />}>
            Create Fee Structure
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Record Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-950 border-slate-800 text-white space-y-2">
          <span className="text-xs font-semibold text-slate-400">Total Collected</span>
          <p className="text-3xl font-black">—</p>
        </Card>
        <Card className="p-6 bg-slate-950 border-slate-800 text-white space-y-2">
          <span className="text-xs font-semibold text-slate-400">Pending Balances</span>
          <p className="text-3xl font-black text-amber-400">—</p>
        </Card>
        <Card className="p-6 bg-slate-950 border-slate-800 text-white space-y-2">
          <span className="text-xs font-semibold text-slate-400">Overdue Fees</span>
          <p className="text-3xl font-black text-rose-400">—</p>
        </Card>
      </div>

      <Table isEmpty emptyMessage="No fee transaction records available in database ledger.">
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Roll Number</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Fee Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>
    </div>
  );
};
