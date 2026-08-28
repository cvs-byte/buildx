import React from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from './common/Badge';

export interface StudentAttendanceRecord {
  date: string;
  subject: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  time: string;
}

export interface StudentMyAttendanceProps {
  records?: StudentAttendanceRecord[];
}

export const StudentMyAttendance: React.FC<StudentMyAttendanceProps> = ({ records = [] }) => {
  const attendanceData = records;

  return (
    <div className="ag-card" style={{ marginBottom: '1.5rem' }}>
      <div className="ag-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar className="ag-text-primary" size={20} />
          <h3 style={{ margin: 0 }}>My Attendance History</h3>
        </div>
        <Badge variant={attendanceData.length > 0 ? 'success' : 'neutral'}>
          {attendanceData.length > 0 ? 'Logged Sessions' : 'No Sessions Logged'}
        </Badge>
      </div>

      <div className="ag-card-body">
        <div className="ag-table-wrapper">
          <table className="ag-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject / Session</th>
                <th>Scheduled Time</th>
                <th>Attendance Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length > 0 ? (
                attendanceData.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.date}</td>
                    <td style={{ fontWeight: 600 }}>{item.subject}</td>
                    <td>{item.time}</td>
                    <td>
                      {item.status === 'PRESENT' ? (
                        <span className="ag-badge ag-badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle size={14} /> Present
                        </span>
                      ) : (
                        <span className="ag-badge ag-badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <XCircle size={14} /> Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                    <p className="ag-text-muted">No attendance records recorded yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
