import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboard.api';
import type { ScheduledClass } from '../../types/dashboard.types';
import { Badge } from '../../components/common/Badge';
import { Clock, MapPin, UserCheck, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export const TodayClassesDashboardPage: React.FC = () => {
  const [classes, setClasses] = useState<ScheduledClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<ScheduledClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClasses = async () => {
      setIsLoading(true);
      try {
        const data = await dashboardApi.getTodayClasses();
        setClasses(data);
        if (data.length > 0) setSelectedClass(data[0]);
      } finally {
        setIsLoading(false);
      }
    };
    loadClasses();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <Badge variant="primary">LIVE IN PROGRESS</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">COMPLETED</Badge>;
      default:
        return <Badge variant="neutral">UPCOMING SESSION</Badge>;
    }
  };

  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">Today's Classes Dashboard</h1>
          <p className="ag-page-subtitle">
            Live schedule overview, room allocations, instructor status, and session attendance rosters.
          </p>
        </div>
        <div className="ag-date-pill">
          <Clock size={16} />
          <span>Live Daily Timetable</span>
        </div>
      </div>

      <div className="ag-section-grid">
        <div className="ag-card">
          <div className="ag-card-header">
            <h3>Scheduled Classes Today</h3>
            <span className="ag-card-tag">{classes.length} Sessions</span>
          </div>

          {isLoading ? (
            <p className="ag-text-muted">Loading timetable...</p>
          ) : (
            <div className="ag-classes-list">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className={`ag-class-card ${selectedClass?.id === cls.id ? 'active' : ''}`}
                  onClick={() => setSelectedClass(cls)}
                >
                  <div className="ag-class-card-header">
                    <div>
                      <code className="ag-code-badge">{cls.subjectCode}</code>
                      <h4 className="ag-class-title">{cls.subject}</h4>
                      <p className="ag-class-sub">{cls.className} • Prof. {cls.teacherName}</p>
                    </div>
                    {getStatusBadge(cls.status)}
                  </div>

                  <div className="ag-class-card-footer">
                    <div className="ag-class-meta">
                      <Clock size={14} />
                      <span>{cls.startTime} - {cls.endTime}</span>
                    </div>
                    <div className="ag-class-meta">
                      <MapPin size={14} />
                      <span>{cls.roomNumber}</span>
                    </div>
                    <div className="ag-class-meta highlight">
                      <Users size={14} />
                      <span>{cls.presentStudents} / {cls.totalStudents} Present</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance Detail Roster for Selected Session */}
        <div className="ag-card">
          <div className="ag-card-header">
            <h3>Session Roster & Attendance</h3>
            {selectedClass && <code className="ag-code-badge">{selectedClass.subjectCode}</code>}
          </div>

          {selectedClass ? (
            <div className="ag-roster-body">
              <div className="ag-roster-summary">
                <div className="roster-stat success">
                  <CheckCircle2 size={18} />
                  <div>
                    <span className="stat-val">{selectedClass.presentStudents}</span>
                    <span className="stat-lbl">Present</span>
                  </div>
                </div>
                <div className="roster-stat danger">
                  <AlertCircle size={18} />
                  <div>
                    <span className="stat-val">{selectedClass.absentStudents}</span>
                    <span className="stat-lbl">Absent</span>
                  </div>
                </div>
              </div>

              <div className="ag-roster-section">
                <h4>Present Students ({selectedClass.presentStudentList.length})</h4>
                {selectedClass.presentStudentList.length === 0 ? (
                  <p className="ag-text-muted">No attendance marked yet.</p>
                ) : (
                  <ul className="ag-roster-list">
                    {selectedClass.presentStudentList.map((s) => (
                      <li key={s.id} className="roster-item present">
                        <UserCheck size={14} className="ag-text-success" />
                        <span>{s.name} ({s.rollNumber})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="ag-roster-section">
                <h4>Absent Students ({selectedClass.absentStudentList.length})</h4>
                {selectedClass.absentStudentList.length === 0 ? (
                  <p className="ag-text-muted">No absent students recorded.</p>
                ) : (
                  <ul className="ag-roster-list">
                    {selectedClass.absentStudentList.map((s) => (
                      <li key={s.id} className="roster-item absent">
                        <AlertCircle size={14} className="ag-text-danger" />
                        <span>{s.name} ({s.rollNumber})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <p className="ag-text-muted">Select a class session to view attendance rosters.</p>
          )}
        </div>
      </div>
    </div>
  );
};
