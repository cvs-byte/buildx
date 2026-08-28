import React, { useState, useEffect } from 'react';
import { timetableApi } from '../../api/timetable.api';
import type { TimetableEntry } from '../../types/timetable.types';
import { useAuth } from '../../hooks/useAuth';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Clock, MapPin, BookOpen } from 'lucide-react';

export const TeacherTimetablePage: React.FC = () => {
  const { user } = useAuth();
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTimetables = async () => {
      setIsLoading(true);
      try {
        const data = await timetableApi.getTimetables(user?.id);
        setTimetables(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadTimetables();
  }, [user]);

  const columns: Column<TimetableEntry>[] = [
    {
      header: 'Day of Week',
      accessor: (row) => <Badge variant="primary">{row.dayOfWeek}</Badge>,
    },
    {
      header: 'Time Slot',
      accessor: (row) => (
        <div className="ag-department-cell">
          <Clock size={14} />
          <span>{row.startTime} - {row.endTime}</span>
        </div>
      ),
    },
    {
      header: 'Subject & Code',
      accessor: (row) => (
        <div className="ag-user-cell">
          <BookOpen size={16} className="ag-text-primary" />
          <div>
            <span className="ag-cell-name">{row.subject}</span>
            <code className="ag-code-badge">{row.subjectCode}</code>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Class Group',
      accessor: (row) => row.className,
    },
    {
      header: 'Classroom / Lab',
      accessor: (row) => (
        <div className="ag-department-cell">
          <MapPin size={14} />
          <span>{row.roomNumber}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">My Personal Teaching Timetable</h1>
          <p className="ag-page-subtitle">
            Weekly schedule for <strong>Prof. {user?.firstName} {user?.lastName}</strong> ({user?.department || 'Faculty'})
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        data={timetables}
        keyExtractor={(t) => t.id}
        isLoading={isLoading}
        emptyMessage="No teaching slots scheduled for this week."
      />
    </div>
  );
};
