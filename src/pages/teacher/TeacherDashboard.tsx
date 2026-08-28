import React, { useState } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import { CreateUserForm } from '../../components/forms/CreateUserForm';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import type { User } from '../../types/user.types';
import { GraduationCap, UserPlus, BookOpen, Clock, ArrowRight, Award, Users } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const schoolId = currentUser?.schoolId || currentUser?.tenantId || undefined;

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STUDENTS' | 'CREATE_STUDENT'>('OVERVIEW');

  const { users: students, isLoading, createUser, refetch } = useUsers('STUDENT', schoolId);

  const studentCount = students.length;

  const studentColumns: Column<User>[] = [
    {
      header: 'Student Name',
      accessor: (row) => {
        const displayName = row.name || `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.email;
        const initials = displayName
          .split(' ')
          .map((n) => n.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'ST';

        return (
          <div className="ag-user-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              className="ag-cell-avatar"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--emerald-500, #10b981)',
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
              <div className="ag-cell-sub" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Class / Grade',
      accessor: (row) => row.gradeLevel || 'Class Roster',
    },
    {
      header: 'Assigned Classes',
      accessor: (row) => (row.classIds && row.classIds.length > 0 ? row.classIds.join(', ') : 'General Class'),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'neutral'}>
          {row.status || 'ACTIVE'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="ag-page-container">
      {/* Header */}
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">Teacher Portal & Student Management</h1>
          <p className="ag-page-subtitle">
            Welcome back, <strong>{currentUser?.firstName || currentUser?.name} {currentUser?.lastName}</strong> ({currentUser?.department || 'Faculty Member'}) | School Scope: {currentUser?.schoolName || schoolId || 'Assigned School'}
          </p>
        </div>
        <div className="ag-header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            leftIcon={<Users size={18} />}
            onClick={() => setActiveTab('STUDENTS')}
          >
            View Student Roster
          </Button>
          <Button
            leftIcon={<UserPlus size={18} />}
            onClick={() => setActiveTab('CREATE_STUDENT')}
          >
            Add Student Account
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="ag-tabs-header" style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color, #334155)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        {[
          { id: 'OVERVIEW', label: 'Teacher Overview' },
          { id: 'STUDENTS', label: `Enrolled Students (${studentCount})` },
          { id: 'CREATE_STUDENT', label: 'Add Student Account' },
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

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <>
          <div className="ag-grid-stats">
            <StatCard
              title="Enrolled Students"
              value={isLoading ? '...' : `${studentCount} Students`}
              icon={<GraduationCap size={24} />}
              trend={{ value: 'Classroom Scope', isPositive: true }}
              variant="emerald"
            />
            <StatCard
              title="Active Courses"
              value="Classroom Scope"
              icon={<BookOpen size={24} />}
              subtitle="Assigned Faculty Subjects"
              variant="blue"
            />
            <StatCard
              title="Class Attendance"
              value="Tracked"
              icon={<Clock size={24} />}
              subtitle="Session records"
              variant="purple"
            />
            <StatCard
              title="Submissions"
              value="Active"
              icon={<Award size={24} />}
              subtitle="Classroom assignments"
              variant="amber"
            />
          </div>

          <div className="ag-card" style={{ marginTop: '1.5rem' }}>
            <div className="ag-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>Classroom Student Roster</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                  Students enrolled in your classes.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setActiveTab('CREATE_STUDENT')}>
                Add Student
              </Button>
            </div>
            <Table
              columns={studentColumns}
              data={students.slice(0, 5)}
              keyExtractor={(s) => s.userId || s.id}
              isLoading={isLoading}
              emptyMessage="No students currently registered in your class."
            />
          </div>

          <div className="ag-card" style={{ marginTop: '1.5rem' }}>
            <div className="ag-card-header">
              <h3>Role Creation Hierarchy</h3>
              <span className="ag-card-tag">TEACHER ACCESS</span>
            </div>
            <div className="ag-card-body">
              <p className="ag-text-muted">
                Teachers have authority to enroll students into assigned grade levels, classes, and subjects.
              </p>
              <div className="ag-hierarchy-flow">
                <div className="flow-step disabled">
                  <span>1. Admin</span>
                </div>
                <ArrowRight size={16} className="flow-arrow" />
                <div className="flow-step disabled">
                  <span>2. Principal</span>
                </div>
                <ArrowRight size={16} className="flow-arrow" />
                <div className="flow-step active">
                  <span>3. Teacher</span>
                </div>
                <ArrowRight size={16} className="flow-arrow" />
                <div className="flow-step clickable" onClick={() => setActiveTab('CREATE_STUDENT')}>
                  <span>4. Add Student Account</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: ENROLLED STUDENTS */}
      {activeTab === 'STUDENTS' && (
        <div className="ag-card">
          <div className="ag-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>All Enrolled Students</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                Managing {studentCount} student record(s) for your classroom.
              </p>
            </div>
            <Button size="sm" leftIcon={<UserPlus size={16} />} onClick={() => setActiveTab('CREATE_STUDENT')}>
              Add Student
            </Button>
          </div>
          <Table
            columns={studentColumns}
            data={students}
            keyExtractor={(s) => s.userId || s.id}
            isLoading={isLoading}
            emptyMessage="No students enrolled yet."
          />
        </div>
      )}

      {/* TAB 3: CREATE STUDENT FORM */}
      {activeTab === 'CREATE_STUDENT' && (
        <div className="ag-card" style={{ padding: '1.5rem' }}>
          <div className="ag-card-header" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color, #334155)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Add New Student Account</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Direct student provisioning for <strong>{currentUser?.schoolName || schoolId || 'your school'}</strong>.
              </p>
            </div>
          </div>
          <CreateUserForm
            defaultRole="STUDENT"
            onSubmit={async (payload) => {
              const teacherSchoolId = (schoolId || currentUser?.schoolId || currentUser?.tenantId) || undefined;
              const teacherSchoolName = (currentUser?.schoolName || currentUser?.tenantName) || undefined;

              await createUser({
                ...payload,
                role: 'STUDENT',
                schoolId: payload.schoolId || teacherSchoolId,
                tenantId: payload.tenantId || teacherSchoolId,
                schoolName: payload.schoolName || teacherSchoolName,
                tenantName: payload.tenantName || teacherSchoolName,
              });
              await refetch();
              setActiveTab('STUDENTS');
            }}
            onCancel={() => setActiveTab('OVERVIEW')}
          />
        </div>
      )}
    </div>
  );
};
