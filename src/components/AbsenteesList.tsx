import React, { useState } from 'react';
import { UserX, Search, Calendar, Send } from 'lucide-react';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Badge } from './common/Badge';

export interface AbsenteeRecord {
  id: string;
  studentName: string;
  rollNumber: string;
  gradeLevel: string;
  section: string;
  parentContact: string;
  absentDate: string;
  reason?: string;
  notified: boolean;
}

export const AbsenteesList: React.FC = () => {
  const [absentees, setAbsentees] = useState<AbsenteeRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const handleNotifyParent = (id: string) => {
    setNotifyingId(id);
    setTimeout(() => {
      setAbsentees((prev) =>
        prev.map((rec) => (rec.id === id ? { ...rec, notified: true } : rec))
      );
      setNotifyingId(null);
    }, 600);
  };

  const filtered = absentees.filter(
    (item) =>
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ag-card" style={{ marginBottom: '1.5rem' }}>
      <div className="ag-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserX className="ag-text-danger" size={20} />
            <h3 style={{ margin: 0 }}>Daily Student Absentees & Parent Alerts</h3>
          </div>
          <p className="ag-text-muted" style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Real-time automated SMS and WhatsApp absentee notifications for parents.
          </p>
        </div>
        <Badge variant={filtered.length > 0 ? 'warning' : 'neutral'}>
          {filtered.length} Students Absent Today
        </Badge>
      </div>

      <div className="ag-card-body">
        <div className="ag-table-toolbar" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <Input
              placeholder="Search student by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              leftIcon={<Calendar size={16} />}
            />
          </div>
        </div>

        <div className="ag-table-wrapper">
          <table className="ag-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Grade / Class</th>
                <th>Parent Contact</th>
                <th>Reason</th>
                <th>Notification Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((student) => (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 600 }}>{student.studentName}</td>
                    <td><code>{student.rollNumber}</code></td>
                    <td>{student.gradeLevel} - {student.section}</td>
                    <td>{student.parentContact}</td>
                    <td>
                      <span className="ag-tag ag-tag-neutral">
                        {student.reason || 'Unexcused'}
                      </span>
                    </td>
                    <td>
                      {student.notified ? (
                        <Badge variant="success">Parent Alert Sent</Badge>
                      ) : (
                        <Badge variant="warning">Alert Pending</Badge>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        size="sm"
                        variant={student.notified ? 'outline' : 'primary'}
                        disabled={student.notified || notifyingId === student.id}
                        isLoading={notifyingId === student.id}
                        leftIcon={<Send size={14} />}
                        onClick={() => handleNotifyParent(student.id)}
                      >
                        {student.notified ? 'Resend Alert' : 'Send Alert'}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    <p className="ag-text-muted">No absentee records found for selected date.</p>
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
