import React, { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';

export const AdminNoticesPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Notice & Announcement Board</h1>
          <p className="text-xs text-slate-400">Publish academic circulars, exam notices, and urgent alerts.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Publish Notice
        </Button>
      </div>

      <Card className="p-16 text-center bg-slate-950 border-slate-800 text-slate-400 space-y-3">
        <FileText className="w-10 h-10 text-sky-500 mx-auto" />
        <h3 className="text-base font-bold text-white">No notices published yet.</h3>
        <p className="text-xs max-w-sm mx-auto">
          Create circular notices to broadcast to students, faculty, or parents.
        </p>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Circular Notice">
        <form className="space-y-4">
          <Input label="Notice Title" required placeholder="e.g. Mid-Term Examination Schedule & Guidelines" />
          <Textarea label="Notice Content" rows={4} required placeholder="Detailed notice content..." />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Audience"
              options={[
                { label: 'All Users', value: 'all' },
                { label: 'Students', value: 'students' },
                { label: 'Teachers', value: 'teachers' },
                { label: 'Parents', value: 'parents' },
              ]}
            />
            <Select
              label="Priority"
              options={[
                { label: 'Normal', value: 'normal' },
                { label: 'Important', value: 'important' },
                { label: 'Urgent', value: 'urgent' },
              ]}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="button" onClick={() => setModalOpen(false)}>Publish Circular</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
