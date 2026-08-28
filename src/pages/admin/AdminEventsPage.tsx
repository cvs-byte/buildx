import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';

export const AdminEventsPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Campus Events & Calendar Manager</h1>
          <p className="text-xs text-slate-400">Schedule academy events, target specific audiences, and publish notifications.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Create Campus Event
        </Button>
      </div>

      <Card className="p-16 text-center bg-slate-950 border-slate-800 text-slate-400 space-y-3">
        <Calendar className="w-10 h-10 text-indigo-500 mx-auto" />
        <h3 className="text-base font-bold text-white">No campus events scheduled.</h3>
        <p className="text-xs max-w-sm mx-auto">
          Create events to notify students, parents, and teachers across their portal dashboards.
        </p>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Schedule New Campus Event">
        <form className="space-y-4">
          <Input label="Event Title" required placeholder="e.g. Annual Sports & Athletic Meet 2026" />
          <Textarea label="Description" rows={3} placeholder="Event outline..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Event Date" type="date" required />
            <Select
              label="Audience"
              options={[
                { label: 'All Users', value: 'all' },
                { label: 'Students Only', value: 'students' },
                { label: 'Teachers Only', value: 'teachers' },
                { label: 'Parents Only', value: 'parents' },
              ]}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="button" onClick={() => setModalOpen(false)}>Publish Event</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
