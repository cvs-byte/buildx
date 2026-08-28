import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { eventService } from '../../services/eventService';
import { EventModel } from '../../types';
import { Card } from '../../components/ui/Card';

export const StudentEventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventModel[]>([]);

  useEffect(() => {
    async function load() {
      const data = await eventService.getEvents('students');
      setEvents(data);
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Campus Events</h1>
        <p className="text-xs text-slate-500 mt-1">Upcoming academy events, schedules, competitions, and holiday notices.</p>
      </div>

      {events.length === 0 ? (
        <Card className="p-16 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold">No upcoming events.</h3>
          <p className="text-xs text-slate-500">
            Scheduled academy events will be posted here by event organizers.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(ev => (
            <Card key={ev.id} className="p-6 space-y-3">
              <h3 className="text-base font-bold">{ev.title}</h3>
              <p className="text-xs text-slate-500">{ev.date} • {ev.startTime} - {ev.endTime}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
