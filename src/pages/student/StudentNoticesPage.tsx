import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { noticeService } from '../../services/noticeService';
import { NoticeModel } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const StudentNoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<NoticeModel[]>([]);

  useEffect(() => {
    async function load() {
      const data = await noticeService.getNotices('students');
      setNotices(data);
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Academic Notices</h1>
        <p className="text-xs text-slate-500 mt-1">Official circulars, exam schedules, and administrative announcements.</p>
      </div>

      {notices.length === 0 ? (
        <Card className="p-16 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold">No notices available.</h3>
          <p className="text-xs text-slate-500">
            Institutional announcements published for students will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notices.map(notice => (
            <Card key={notice.id} className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={notice.priority === 'urgent' ? 'danger' : notice.priority === 'important' ? 'warning' : 'secondary'}>
                  {notice.priority.toUpperCase()}
                </Badge>
                <span className="text-xs text-slate-400">{notice.publishDate}</span>
              </div>
              <h3 className="text-base font-bold">{notice.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{notice.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
