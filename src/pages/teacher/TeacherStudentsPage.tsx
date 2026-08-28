import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SearchInput } from '../../components/ui/SearchInput';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

export const TeacherStudentsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Assigned Students Roster</h1>
        <p className="text-xs text-slate-500 mt-1">Search student roster by name, roll number, or class section.</p>
      </div>

      <div className="max-w-md">
        <SearchInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search by student name or roll number..."
        />
      </div>

      <Table isEmpty emptyMessage="No students found matching search criteria.">
        <TableHeader>
          <TableRow>
            <TableHead>Roll Number</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Class & Section</TableHead>
            <TableHead>Parent Contact</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>
    </div>
  );
};
