import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

export const AdminClassesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Class & Section Management</h1>
          <p className="text-xs text-slate-400">Configure academic grades, sections, class teachers, and subject lists.</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Create Class
        </Button>
      </div>

      <Table isEmpty emptyMessage="No class sections created yet.">
        <TableHeader>
          <TableRow>
            <TableHead>Class Name</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Class Teacher</TableHead>
            <TableHead>Total Students</TableHead>
            <TableHead>Subjects</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>
    </div>
  );
};
