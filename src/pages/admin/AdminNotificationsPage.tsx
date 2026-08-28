import React, { useState } from 'react';
import { BellRing, Send } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

export const AdminNotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Broadcast System Notifications</h1>
        <p className="text-xs text-slate-400">Send platform-wide or role-targeted announcements.</p>
      </div>

      <Card className="p-6 bg-slate-950 border-slate-800 space-y-4">
        <Input label="Notification Title" placeholder="e.g. Scheduled AWS Infrastructure Maintenance" />
        <Textarea label="Message Content" rows={4} placeholder="Enter broadcast message details..." />
        <Button variant="primary" size="md" leftIcon={<Send className="w-4 h-4" />}>
          Dispatch Broadcast
        </Button>
      </Card>
    </div>
  );
};
