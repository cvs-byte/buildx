import React, { useState } from 'react';
import { Plus, School } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const AdminTeachersPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Teacher Directory & Staff Management</h1>
          <p className="text-xs text-slate-400">Manage faculty accounts, subject allocations, and class responsibilities.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Add Teacher
        </Button>
      </div>

      <Table isEmpty emptyMessage="No teachers found. Ready for AWS Cognito User Pool sync.">
        <TableHeader>
          <TableRow>
            <TableHead>Teacher Name</TableHead>
            <TableHead>Email Address</TableHead>
            <TableHead>Subject Specializations</TableHead>
            <TableHead>Assigned Classes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Faculty Teacher">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" required />
            <Input label="Last Name" required />
          </div>
          <Input label="Email Address" type="email" required />
          <Input label="Subjects (Comma Separated)" placeholder="Mathematics, Physics" />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="button" onClick={() => setModalOpen(false)}>Create Teacher</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
