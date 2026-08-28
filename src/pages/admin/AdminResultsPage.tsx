import React, { useState } from 'react';
import { Plus, FileSpreadsheet } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

export const AdminResultsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Academic Results & Examination Management</h1>
          <p className="text-xs text-slate-400">Configure exams, review teacher marksheets, and publish results to portal.</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Create Examination Term
        </Button>
      </div>

      <Table isEmpty emptyMessage="No examination results submitted for publication yet.">
        <TableHeader>
          <TableRow>
            <TableHead>Exam Title</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Submitted Marks</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>
    </div>
  );
};
