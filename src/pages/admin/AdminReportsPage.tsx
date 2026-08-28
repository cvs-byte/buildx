import React, { useState } from 'react';
import { BarChart3, Download, FileText, Eye } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';

export const AdminReportsPage: React.FC = () => {
  const [category, setCategory] = useState('attendance');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const handleExport = (format: 'PDF' | 'CSV') => {
    setAlertMsg(`Report export service initiated (${format} format). Connecting to AWS Lambda PDF/CSV generator...`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Institutional Reports & Export Center</h1>
        <p className="text-xs text-slate-400">Generate, view, and export PDF/CSV reports for attendance, examination results, and fee ledgers.</p>
      </div>

      {alertMsg && <Alert variant="info" onClose={() => setAlertMsg(null)}>{alertMsg}</Alert>}

      {/* Filter Bar */}
      <Card className="p-6 bg-slate-950 border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Report Category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            options={[
              { label: 'Attendance Report', value: 'attendance' },
              { label: 'Academic Results Report', value: 'results' },
              { label: 'Fees & Payment Ledger Report', value: 'fees' },
              { label: 'Student Directory Report', value: 'student' },
              { label: 'Faculty Staff Report', value: 'teacher' },
              { label: 'Event Summary Report', value: 'event' },
            ]}
          />
          <Select
            label="Academic Year"
            options={[
              { label: '2026 - 2027', value: '2026' },
              { label: '2025 - 2026', value: '2025' },
            ]}
          />
          <Select
            label="Class Filter"
            options={[
              { label: 'All Classes', value: 'all' },
              { label: 'Grade 10', value: 'Grade 10' },
              { label: 'Grade 11', value: 'Grade 11' },
            ]}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 mt-4">
          <Button variant="outline" size="sm" className="border-slate-700 text-white" onClick={() => handleExport('CSV')} leftIcon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => handleExport('PDF')} leftIcon={<FileText className="w-4 h-4" />}>
            Export PDF
          </Button>
        </div>
      </Card>

      <Card className="p-16 text-center bg-slate-950 border-slate-800 text-slate-400 space-y-3">
        <BarChart3 className="w-10 h-10 text-indigo-500 mx-auto" />
        <h3 className="text-base font-bold text-white">No compiled report data generated.</h3>
        <p className="text-xs max-w-md mx-auto">
          Generated reports will preview here once connected to AWS S3 report bucket URLs.
        </p>
      </Card>
    </div>
  );
};
