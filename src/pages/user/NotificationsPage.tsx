import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { NotificationItem } from '../../types';
import { Card } from '../../components/ui/Card';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    async function load() {
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    }
    load();
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>
        <p className="text-xs text-slate-500 mt-1">Platform updates, course announcements, and system alerts.</p>
      </div>

      {notifications.length === 0 ? (
        <Card className="p-16 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold">You have no notifications.</h3>
          <p className="text-xs text-slate-500">
            System announcements and progress milestones will appear here once active.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map(n => (
            <Card key={n.id} className="p-4">
              <h4 className="font-bold text-sm">{n.title}</h4>
              <p className="text-xs text-slate-500">{n.message}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
