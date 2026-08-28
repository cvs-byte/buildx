import React from 'react';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { useTenant } from '../../hooks/useTenant';
import { BookOpen, Award, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { ResultPDFButton } from '../../components/pdf/ResultPDFButton';
import { StudentMyAttendance } from '../../components/StudentMyAttendance';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { activeTenant } = useTenant();

  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">Student Learning Portal</h1>
          <p className="ag-page-subtitle">
            Welcome back, <strong>{user?.firstName || user?.name || 'Student'} {user?.lastName || ''}</strong> | {activeTenant?.name || user?.schoolName || 'Institution'}
          </p>
        </div>
        <ResultPDFButton />
      </div>

      <div className="ag-grid-stats">
        <StatCard
          title="Current Cumulative GPA"
          value="N/A"
          icon={<Award size={24} />}
          subtitle="Academic Evaluation Pending"
          variant="amber"
        />
        <StatCard
          title="Enrolled Subjects"
          value="0 Subjects"
          icon={<BookOpen size={24} />}
          subtitle="Current Semester"
          variant="blue"
        />
        <StatCard
          title="My Attendance Rate"
          value="0.0%"
          icon={<CheckCircle2 size={24} />}
          subtitle="0 Sessions Logged"
          variant="emerald"
        />
        <StatCard
          title="Upcoming Examinations"
          value="0 Papers"
          icon={<Calendar size={24} />}
          subtitle="No Active Exams Scheduled"
          variant="purple"
        />
      </div>

      {/* Student Personal Attendance Module (My Attendance Only) */}
      <StudentMyAttendance records={[]} />

      <div className="ag-section-grid">
        <div className="ag-card">
          <div className="ag-card-header">
            <h3>My Active Enrolled Courses</h3>
            <span className="ag-card-tag">SEMESTER</span>
          </div>
          <div className="ag-card-body">
            <div className="ag-table-empty" style={{ padding: '2rem', textAlign: 'center' }}>
              <p className="ag-text-muted">No enrolled courses registered yet.</p>
            </div>
          </div>
        </div>

        <div className="ag-card">
          <div className="ag-card-header">
            <h3>Recent Assignments</h3>
            <Clock size={18} className="ag-text-muted" />
          </div>
          <div className="ag-card-body">
            <div className="ag-table-empty" style={{ padding: '2rem', textAlign: 'center' }}>
              <p className="ag-text-muted">No active assignments assigned.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
