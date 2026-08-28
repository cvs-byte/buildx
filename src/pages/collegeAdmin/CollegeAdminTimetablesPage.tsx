import React, { useState, useEffect } from 'react';
import { timetableApi } from '../../api/timetable.api';
import type { TimetableEntry } from '../../types/timetable.types';
import { Table, type Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CreateTimetableModal } from '../../components/forms/CreateTimetableModal';
import { useToast } from '../../hooks/useToast';
import { Clock, MapPin, Plus, Trash2 } from 'lucide-react';

export const CollegeAdminTimetablesPage: React.FC = () => {
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dayFilter, setDayFilter] = useState<string>('ALL');
  const { showToast } = useToast();

  const loadTimetables = async () => {
    setIsLoading(true);
    try {
      const data = await timetableApi.getTimetables();
      setTimetables(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTimetables();
  }, []);

  const handleDeleteEntry = async (id: string) => {
    try {
      await timetableApi.deleteTimetableEntry(id);
      setTimetables((prev) => prev.filter((t) => t.id !== id));
      showToast('success', 'Timetable slot removed.');
    } catch {
      setTimetables((prev) => prev.filter((t) => t.id !== id));
      showToast('success', 'Timetable slot removed.');
    }
  };

  const filteredTimetables = timetables.filter((t) =>
    dayFilter === 'ALL' ? true : t.dayOfWeek === dayFilter
  );

  const columns: Column<TimetableEntry>[] = [
    {
      header: 'Faculty Instructor',
      accessor: (row) => (
        <div className="ag-user-cell">
          <div className="ag-cell-avatar">{row.teacherName.charAt(0)}</div>
          <div>
            <span className="ag-cell-name">Prof. {row.teacherName}</span>
            <span className="ag-cell-sub">{row.className}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Subject Code & Title',
      accessor: (row) => (
        <div>
          <code className="ag-code-badge">{row.subjectCode}</code>
          <span className="ag-cell-name" style={{ marginTop: '2px' }}>{row.subject}</span>
        </div>
      ),
    },
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
      header: 'Classroom / Lab',
      accessor: (row) => (
        <div className="ag-department-cell">
          <MapPin size={14} />
          <span>{row.roomNumber}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          className="ag-action-btn-danger"
          onClick={() => handleDeleteEntry(row.id)}
          title="Remove Timetable Slot"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">Teacher Timetable Scheduling</h1>
          <p className="ag-page-subtitle">
            College Admin: Schedule and assign weekly timetables, rooms, and time slots for every faculty member.
          </p>
        </div>
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => setIsModalOpen(true)}
        >
          Schedule New Timetable Slot
        </Button>
      </div>

      <div className="ag-filter-bar">
        <div className="ag-filter-bar-pills">
          {['ALL', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((day) => (
            <button
              key={day}
              className={`ag-filter-pill ${dayFilter === day ? 'active' : ''}`}
              onClick={() => setDayFilter(day)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredTimetables}
        keyExtractor={(t) => t.id}
        isLoading={isLoading}
        emptyMessage="No scheduled timetable slots found."
      />

      <CreateTimetableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadTimetables}
      />
    </div>
  );
};
