import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

export const AdminParentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Parent Directory</h1>
          <p className="text-xs text-slate-400">Link guardians to student roll numbers and manage guardian access.</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Add Parent Account
        </Button>
      </div>

      <Table isEmpty emptyMessage="No parent accounts found. Ready for AWS database synchronization.">
        <TableHeader>
          <TableRow>
            <TableHead>Parent Name</TableHead>
            <TableHead>Email Address</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Linked Students</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>
    </div>
  );
};
