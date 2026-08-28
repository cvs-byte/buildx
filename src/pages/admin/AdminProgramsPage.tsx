import React, { useState } from 'react';
import { Plus, Layers } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';

export const AdminProgramsPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Programs Manager</h1>
          <p className="text-xs text-slate-400">Create, edit, publish, and archive learning path programs.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Create Program
        </Button>
      </div>

      <Card className="p-16 text-center bg-slate-950 border-slate-800 text-slate-400 space-y-3">
        <Layers className="w-10 h-10 text-indigo-500 mx-auto" />
        <h3 className="text-base font-bold text-white">No custom programs created yet.</h3>
        <p className="text-xs max-w-sm mx-auto">
          Create new learning program tracks or load existing program items from your AWS DynamoDB table.
        </p>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Program Path">
        <form className="space-y-4">
          <Input label="Program Title" placeholder="e.g. AWS Cloud Solutions Architecture" />
          <Textarea label="Description" placeholder="Program overview..." />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="button" onClick={() => setModalOpen(false)}>Create Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
