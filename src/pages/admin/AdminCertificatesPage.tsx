import React from 'react';
import { Card } from '../../components/ui/Card';

export const AdminCertificatesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Certificate Registry</h1>
        <p className="text-xs text-slate-400">Issued credential tokens, cryptographic signatures, and revocation registry.</p>
      </div>

      <Card className="p-16 text-center bg-slate-950 border-slate-800 text-slate-400">
        <p className="text-base font-bold text-white">No certificates issued yet.</p>
      </Card>
    </div>
  );
};
