import React, { useState } from 'react';
import { UserCheck, Filter } from 'lucide-react';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

export const AdminAttendancePage: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('All');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Institutional Attendance Management</h1>
        <p className="text-xs text-slate-400">Audit daily attendance logs, class percentages, and missing logs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input type="date" label="Filter Date" value={date} onChange={e => setDate(e.target.value)} />
        <Select
          label="Filter Class"
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          options={[
            { label: 'All Classes', value: 'All' },
            { label: 'Grade 10', value: 'Grade 10' },
            { label: 'Grade 11', value: 'Grade 11' },
          ]}
        />
      </div>

      <Table isEmpty emptyMessage="No attendance records available for selected date and class filters.">
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Roll Number</TableHead>
            <TableHead>Class & Section</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Recorded By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>
    </div>
  );
};
