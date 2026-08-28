import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Download, FileCheck } from 'lucide-react';
import { feeService, FeeSummary } from '../../services/feeService';
import { PaymentRecord } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

export const StudentFeesPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [paymentMsg, setPaymentMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await feeService.getStudentFees();
      setPayments(res.payments);
      setSummary(res.summary);
    }
    load();
  }, []);

  const handlePayNow = () => {
    setPaymentMsg('Payment Gateway API integration point. Connecting to payment provider backend...');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Fee Ledger</h1>
        <p className="text-xs text-slate-500 mt-1">Review tuition, transport, hostel fees, payment receipts, and pending balances.</p>
      </div>

      {paymentMsg && <Alert variant="info" onClose={() => setPaymentMsg(null)}>{paymentMsg}</Alert>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Total Fee Amount</span>
          <p className="text-2xl font-black">{summary ? `$${summary.totalFee}` : '—'}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Paid Amount</span>
          <p className="text-2xl font-black text-emerald-600">{summary ? `$${summary.paidFee}` : '—'}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Pending Balance</span>
          <p className="text-2xl font-black text-amber-600">{summary ? `$${summary.pendingFee}` : '—'}</p>
        </Card>
        <Card className="p-4 space-y-1 flex flex-col justify-between">
          <span className="text-xs text-slate-500 font-semibold">Next Due Date</span>
          <p className="text-lg font-bold text-rose-600">{summary?.dueDate || '—'}</p>
          <Button variant="primary" size="sm" onClick={handlePayNow} leftIcon={<CreditCard className="w-4 h-4" />}>
            Pay Now
          </Button>
        </Card>
      </div>

      {/* Fee Breakdown Card */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-bold">Fee Breakdown Schedule</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-slate-400 font-semibold">Tuition Fee</span>
            <p className="text-base font-bold mt-1">—</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-slate-400 font-semibold">Transport Fee</span>
            <p className="text-base font-bold mt-1">—</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-slate-400 font-semibold">Hostel Fee</span>
            <p className="text-base font-bold mt-1">—</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-slate-400 font-semibold">Other Charges</span>
            <p className="text-base font-bold mt-1">—</p>
          </div>
        </div>
      </Card>

      {/* Payment History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Payment History & Receipts</h3>
        <Table isEmpty={payments.length === 0} emptyMessage="No fee records available.">
          <TableHeader>
            <TableRow>
              <TableHead>Receipt #</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.receiptNumber || '—'}</TableCell>
                <TableCell>{p.feeType}</TableCell>
                <TableCell>${p.paidAmount}</TableCell>
                <TableCell>{p.paidAt || '—'}</TableCell>
                <TableCell>{p.paymentMethod || '—'}</TableCell>
                <TableCell><Badge variant="success">{p.status.toUpperCase()}</Badge></TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>Receipt</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
