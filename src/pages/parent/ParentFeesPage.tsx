import React, { useState } from 'react';
import { DollarSign, CreditCard } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

export const ParentFeesPage: React.FC = () => {
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Fee Payments & Receipts</h1>
        <p className="text-xs text-slate-500 mt-1">Pay pending tuition fees and download payment receipts.</p>
      </div>

      {msg && <Alert variant="info" onClose={() => setMsg(null)}>{msg}</Alert>}

      <Card className="p-8 space-y-4">
        <h3 className="text-lg font-bold">Child Fee Summary</h3>
        <p className="text-xs text-slate-500">No active fee balance pending.</p>
        <Button variant="primary" size="sm" onClick={() => setMsg('Payment Gateway API integration point. Connecting to payment provider backend...')} leftIcon={<CreditCard className="w-4 h-4" />}>
          Pay Fees
        </Button>
      </Card>
    </div>
  );
};
