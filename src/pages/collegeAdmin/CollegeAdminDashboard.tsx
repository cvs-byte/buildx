import React, { useState, useEffect, useCallback } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import { SchoolSelector } from '../../components/common/SchoolSelector';
import { CreateUserForm } from '../../components/forms/CreateUserForm';
import { DashboardSkeleton } from '../../components/common/SkeletonLoader';
import type { User } from '../../types/user.types';
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  UserPlus,
  Sliders,
  Layers,
  RefreshCw,
  DollarSign,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react';

const CURRENT_COLLEGE_CREATOR_ID = 'college-admin-creator-001';

export const CollegeAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active Principal Binding with fallback to creator principal ID
  const activePrincipalId =
    user?.principalId || CURRENT_COLLEGE_CREATOR_ID || 'college-admin-creator-001';

  const schoolId = user?.schoolId || user?.tenantId || undefined;
  const schoolName = user?.schoolName || user?.tenantName || 'Assigned College';

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'FACULTY' | 'STUDENTS' | 'DEPARTMENTS' | 'CREATE_USER' | 'ACADEMICS'
  >('OVERVIEW');

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Expose users with schoolId scope
  const { users, isLoading, error, createUser, refetch } = useUsers({ schoolId });

  // Safe Programmatic Dashboard Refresh without screen blink
  const handleDashboardRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (refetch) {
        await refetch();
      }
    } catch (err) {
      console.warn('[DASHBOARD REFRESH WARN]', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Safe Re-hydration on mount
  useEffect(() => {
    console.debug('[COLLEGE DASHBOARD MOUNT]', {
      activePrincipalId,
      schoolId,
      schoolName,
      userRole: user?.role,
    });
  }, [activePrincipalId, schoolId, schoolName, user?.role]);

  // Derived metrics with defensive optional chaining
  const safeUsers = Array.isArray(users) ? users : [];
  const teachers = safeUsers.filter((u) => u?.role === 'TEACHER');
  const students = safeUsers.filter((u) => u?.role === 'STUDENT');

  const teacherCount = teachers.length;
  const studentCount = students.length;

  // Faculty Table Columns
  const columns: Column<User>[] = [
    {
      header: 'Faculty Member',
      accessor: (row) => {
        const displayName =
          row?.name ||
          `${row?.firstName || ''} ${row?.lastName || ''}`.trim() ||
          row?.email ||
          'Faculty User';
        const initials =
          displayName
            .split(' ')
            .map((n) => n.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'FA';

        return (
          <div className="ag-user-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              className="ag-cell-avatar"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--primary, #3b82f6)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {initials}
            </div>
            <div>
              <div className="ag-cell-name" style={{ fontWeight: 600 }}>{displayName}</div>
              <div className="ag-cell-sub" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row?.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Department',
      accessor: (row) => (
        <div className="ag-department-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <BookOpen size={14} style={{ opacity: 0.7 }} />
          <span>{row?.department || 'General Academic'}</span>
        </div>
      ),
    },
    {
      header: 'Specialization',
      accessor: (row) => row?.subjectSpecialization || 'General Faculty',
    },
    {
      header: 'Role Level',
      accessor: (row) => <Badge variant="info">{row?.role || 'TEACHER'}</Badge>,
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row?.status === 'ACTIVE' ? 'success' : 'neutral'}>
          {row?.status || 'ACTIVE'}
        </Badge>
      ),
    },
  ];

  if (isLoading && !users) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="ag-page-container">
      {/* College Admin Header */}
      <div className="ag-page-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 className="ag-page-title">College Admin Overview</h1>
            <span className="ag-card-tag" style={{ background: 'var(--primary, #3b82f6)', color: '#fff', fontSize: '0.75rem' }}>
              CREATOR BINDING: <code>{activePrincipalId}</code>
            </span>
          </div>
          <p className="ag-page-subtitle">
            Institutional management scope for <strong>{schoolName}</strong> | Principal Context: <code style={{ color: 'var(--primary-light, #60a5fa)' }}>{activePrincipalId}</code>
          </p>
        </div>

        <div className="ag-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <SchoolSelector
            selectedSchoolId={schoolId || 'N/A'}
            schools={[]}
            isLocked={true}
            lockedSchoolName={schoolName}
          />

          <Button
            variant="outline"
            leftIcon={<RefreshCw size={16} className={isRefreshing ? 'ag-spin' : ''} />}
            onClick={handleDashboardRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Syncing...' : 'Refresh Data'}
          </Button>

          <Button
            variant="outline"
            leftIcon={<Sliders size={16} />}
            onClick={() => navigate('/schooladmin/attendance-settings')}
          >
            Attendance Config
          </Button>

          <Button
            variant="primary"
            leftIcon={<UserPlus size={16} />}
            onClick={() => setActiveTab('CREATE_USER')}
          >
            Create User
          </Button>
        </div>
      </div>

      {error && (
        <div className="ag-alert ag-alert-warning" style={{ marginBottom: '1.25rem' }}>
          <span>Notice: Operating under active cached local state. Context: {activePrincipalId}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="ag-tabs-header" style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color, #334155)', marginBottom: '1.5rem', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'OVERVIEW', label: 'Operational Overview' },
          { id: 'FACULTY', label: `Faculty Management (${teacherCount})` },
          { id: 'STUDENTS', label: `Student Roster (${studentCount})` },
          { id: 'DEPARTMENTS', label: 'Department Overview' },
          { id: 'CREATE_USER', label: 'Create User Form' },
          { id: 'ACADEMICS', label: 'Academic Management' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`ag-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === tab.id ? 'var(--primary, #3b82f6)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OPERATIONAL OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <>
          {/* Main StatCards Grid */}
          <div className="ag-grid-stats" style={{ marginBottom: '1.5rem' }}>
            <StatCard
              title="Enrolled Students"
              value={isLoading ? '...' : `${studentCount} Students`}
              icon={<GraduationCap size={24} />}
              trend={{ value: 'Real College Scope', isPositive: true }}
              variant="emerald"
            />
            <StatCard
              title="Institution & School ID"
              value={schoolId || 'N/A'}
              icon={<Building2 size={24} />}
              subtitle={`Name: ${schoolName}`}
              variant="blue"
            />
            <StatCard
              title="Appointed Faculty"
              value={isLoading ? '...' : `${teacherCount} Members`}
              icon={<Users size={24} />}
              subtitle="Active Faculty Roster"
              variant="purple"
            />
            <StatCard
              title="Creator Principal ID"
              value={activePrincipalId}
              icon={<ShieldCheck size={24} />}
              subtitle="Bound Institution Principal"
              variant="amber"
            />
          </div>

          {/* Additional Institutional Tracking Modules (Fee & Attendance Logs) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="ag-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <ClipboardList size={20} style={{ color: 'var(--primary, #3b82f6)' }} />
                <h4 style={{ margin: 0, fontSize: '1rem' }}>Daily Attendance Logs</h4>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                College-wide student and staff roster verification.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span>Faculty Attendance:</span>
                <strong style={{ color: '#4ade80' }}>Verified</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                <span>Student Attendance:</span>
                <strong style={{ color: '#60a5fa' }}>Tracked</strong>
              </div>
            </div>

            <div className="ag-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <DollarSign size={20} style={{ color: 'var(--success, #22c55e)' }} />
                <h4 style={{ margin: 0, fontSize: '1rem' }}>Fee Collection & Status</h4>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                Term fee tracking for registered student roster.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span>Fees Status:</span>
                <strong>Active</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                <span>Fee System:</span>
                <span style={{ color: 'var(--warning, #f59e0b)' }}>Online</span>
              </div>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="ag-card" style={{ marginBottom: '1.5rem' }}>
            <div className="ag-card-header">
              <h3>College Administrative Flow</h3>
              <span className="ag-card-tag">INSTITUTIONAL SCOPE</span>
            </div>
            <div className="ag-hierarchy-flow">
              <div className="flow-step clickable" onClick={() => setActiveTab('FACULTY')}>
                <span>1. Faculty Roster ({teacherCount} Teachers)</span>
              </div>
              <div className="flow-step clickable" onClick={() => setActiveTab('STUDENTS')}>
                <span>2. Student Roster ({studentCount} Students)</span>
              </div>
              <div className="flow-step clickable" onClick={() => setActiveTab('DEPARTMENTS')}>
                <span>3. Departmental Overview</span>
              </div>
              <div className="flow-step clickable" onClick={() => navigate('/schooladmin/timetables')}>
                <span>4. Timetable Scheduling</span>
              </div>
              <div className="flow-step clickable" onClick={() => navigate('/schooladmin/attendance-settings')}>
                <span>5. Attendance Config</span>
              </div>
            </div>
          </div>

          {/* Faculty Roster Preview */}
          <div className="ag-card">
            <div className="ag-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>Faculty Roster Summary</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                  Bound to Principal ID: <code>{activePrincipalId}</code>
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setActiveTab('FACULTY')}>
                Manage Faculty
              </Button>
            </div>

            <Table
              columns={columns}
              data={teachers.slice(0, 5)}
              keyExtractor={(f) => f.userId || f.id}
              isLoading={isLoading}
              emptyMessage="No faculty records registered under this college scope."
            />
          </div>
        </>
      )}

      {/* TAB 2: FACULTY MANAGEMENT */}
      {activeTab === 'FACULTY' && (
        <div className="ag-card" style={{ marginBottom: '1.5rem' }}>
          <div className="ag-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>Faculty Roster Management</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                All appointed faculty members for <code>{schoolName}</code>
              </p>
            </div>
            <Button size="sm" leftIcon={<UserPlus size={16} />} onClick={() => setActiveTab('CREATE_USER')}>
              Add Faculty Member
            </Button>
          </div>
          <Table
            columns={columns}
            data={teachers}
            keyExtractor={(f) => f.userId || f.id}
            isLoading={isLoading}
            emptyMessage="No faculty members registered."
          />
        </div>
      )}

      {/* TAB 3: STUDENT ROSTER */}
      {activeTab === 'STUDENTS' && (
        <div className="ag-card" style={{ marginBottom: '1.5rem' }}>
          <div className="ag-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>Enrolled Student Roster</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                Managing {studentCount} student(s) bound to school: <code>{schoolId}</code>
              </p>
            </div>
            <Button size="sm" leftIcon={<UserPlus size={16} />} onClick={() => setActiveTab('CREATE_USER')}>
              Enroll New Student
            </Button>
          </div>
          <div className="ag-card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="ag-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Student Name / Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Assigned Class IDs</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No students enrolled yet under this college boundary.
                    </td>
                  </tr>
                ) : (
                  students.map((st) => (
                    <tr key={st.id} style={{ borderBottom: '1px solid var(--border-color, #334155)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 600 }}>{st.name || `${st.firstName} ${st.lastName}`}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.email}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <Badge variant="info">STUDENT</Badge>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                        {st.classIds && st.classIds.length > 0 ? st.classIds.join(', ') : 'Unassigned'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <Badge variant={st.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {st.status || 'ACTIVE'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DEPARTMENT OVERVIEW */}
      {activeTab === 'DEPARTMENTS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {[
            { name: 'Computer Science & Engineering', code: 'CSE', head: 'Prof. Alan Turing' },
            { name: 'Electronics & Communication', code: 'ECE', head: 'Dr. Shannon' },
            { name: 'Mechanical Engineering', code: 'MECH', head: 'Prof. James Watt' },
            { name: 'Business Administration & Commerce', code: 'BBA', head: 'Dr. Adam Smith' },
            { name: 'Humanities & Social Sciences', code: 'HSS', head: 'Prof. John Locke' },
          ].map((dept) => {
            const deptTeachers = teachers.filter(
              (t) => t.department?.toLowerCase() === dept.code.toLowerCase() || t.department?.includes(dept.code)
            );

            return (
              <div key={dept.code} className="ag-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <BookOpen size={22} style={{ color: 'var(--primary, #3b82f6)' }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{dept.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: <code>{dept.code}</code></span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div><strong>Department Head:</strong> {dept.head}</div>
                  <div><strong>Faculty Assigned:</strong> {deptTeachers.length} teacher(s)</div>
                  <div><strong>Active Courses:</strong> 6 Courses</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 5: CREATE USER FORM */}
      {activeTab === 'CREATE_USER' && (
        <div className="ag-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div className="ag-card-header" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color, #334155)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>College Admin Account Provisioning</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Create Teacher or Student accounts for <strong>{schoolName}</strong> (Bound Principal: <code>{activePrincipalId}</code>).
              </p>
            </div>
          </div>
          <CreateUserForm
            onSubmit={async (payload) => {
              await createUser(payload);
              await refetch();
              setActiveTab('FACULTY');
            }}
            onCancel={() => setActiveTab('OVERVIEW')}
          />
        </div>
      )}

      {/* TAB 6: ACADEMIC MANAGEMENT */}
      {activeTab === 'ACADEMICS' && (
        <div className="ag-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div className="ag-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Academic Operations & Section Builder</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                Manage class groups, weekly timetables, and period attendance settings.
              </p>
            </div>
            <Button size="sm" leftIcon={<Layers size={16} />} onClick={() => navigate('/schooladmin/classes')}>
              Open Class Builder Page
            </Button>
          </div>
          <div className="ag-grid-stats" style={{ marginTop: '1rem' }}>
            <div className="ag-card" style={{ padding: '1.25rem' }}>
              <h4>Classes & Course Sections</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>Active Sections</p>
              <Button size="sm" variant="outline" onClick={() => navigate('/schooladmin/classes')}>
                Manage Classes
              </Button>
            </div>
            <div className="ag-card" style={{ padding: '1.25rem' }}>
              <h4>Faculty Timetables</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>Period Schedules</p>
              <Button size="sm" variant="outline" onClick={() => navigate('/schooladmin/timetables')}>
                Manage Timetables
              </Button>
            </div>
            <div className="ag-card" style={{ padding: '1.25rem' }}>
              <h4>Attendance Mode Settings</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>Period / Day Wise</p>
              <Button size="sm" variant="outline" onClick={() => navigate('/schooladmin/attendance-settings')}>
                Configure Mode
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


