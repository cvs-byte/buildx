import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, FileSpreadsheet, DollarSign, ChevronDown } from 'lucide-react';
import { parentService } from '../../services/parentService';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';

export const ParentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<{ id: string; name: string; className: string }[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  useEffect(() => {
    async function load() {
      const data = await parentService.getMyChildren();
      setChildren(data);
      if (data.length > 0) setSelectedChildId(data[0].id);
    }
    load();
  }, []);

  const selectedChild = children.find(c => c.id === selectedChildId);

  return (
    <div className="space-y-8">
      {/* Child Selector Top Banner */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="warning">PARENT DASHBOARD</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">Guardian Portal Oversight</h1>
          <p className="text-xs text-slate-400">Monitor academic performance, attendance logs, and fee balances for your children.</p>
        </div>

        {/* Child Selector Dropdown */}
        <div className="w-64">
          <Select
            label="Select Student"
            value={selectedChildId}
            onChange={e => setSelectedChildId(e.target.value)}
            options={
              children.length > 0
                ? children.map(c => ({ label: `${c.name} (${c.className})`, value: c.id }))
                : [{ label: 'No Linked Children', value: '' }]
            }
          />
        </div>
      </div>

      {/* Metrics Cards for Selected Child */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/parent/attendance')}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Attendance</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black">—</p>
          <p className="text-[10px] text-slate-400">Monthly percentage</p>
        </Card>

        <Card className="p-6 space-y-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/parent/results')}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Term Marks</span>
            <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black">—</p>
          <p className="text-[10px] text-slate-400">Published marksheets</p>
        </Card>

        <Card className="p-6 space-y-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/parent/fees')}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Pending Fee Balance</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black">—</p>
          <p className="text-[10px] text-slate-400">Ledger statement</p>
        </Card>
      </div>

      {children.length === 0 && (
        <Card className="p-16 text-center space-y-3">
          <Users className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold">No linked students found.</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Contact your academy administration to link your student roll numbers to your parent account.
          </p>
        </Card>
      )}
    </div>
  );
};
