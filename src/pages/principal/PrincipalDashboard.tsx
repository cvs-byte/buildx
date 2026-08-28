import React, { useState } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import { Badge } from '../../components/common/Badge';
import { CreateUserForm } from '../../components/forms/CreateUserForm';
import { Users, GraduationCap, UserPlus, Building2, UserCheck } from 'lucide-react';

export const PrincipalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SCHOOLADMINS' | 'CREATE_USER' | 'STAFF_STUDENTS'>('OVERVIEW');

  const schoolId = currentUser?.schoolId || currentUser?.tenantId || undefined;
  const schoolName = currentUser?.schoolName || currentUser?.tenantName || 'Your School';

  const { users, isLoading, createUser, refetch } = useUsers({ schoolId });

  const teacherCount = users.filter((u) => u.role === 'TEACHER').length;
  const studentCount = users.filter((u) => u.role === 'STUDENT').length;
  const schoolAdminCount = users.filter((u) => u.role === 'SCHOOLADMIN' || u.role === 'COLLEGE_ADMIN' || u.role === 'ADMIN').length;

  const schoolAdminsList = users.filter((u) => u.role === 'SCHOOLADMIN' || u.role === 'COLLEGE_ADMIN' || u.role === 'ADMIN');
  const staffAndStudentsList = users.filter((u) => u.role === 'TEACHER' || u.role === 'STUDENT');

  return (
    <div className="ag-page-container">
      {/* Header */}
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">Principal Dashboard</h1>
          <p className="ag-page-subtitle">
            Academic Leadership for <strong>{schoolName}</strong> (School ID: <code>{schoolId || 'N/A'}</code>)
          </p>
        </div>
        <div className="ag-header-actions">
          <Button
            variant="outline"
            leftIcon={<Users size={18} />}
            onClick={() => setActiveTab('STAFF_STUDENTS')}
          >
            Staff & Students
          </Button>
          <Button
            leftIcon={<UserPlus size={18} />}
            onClick={() => setActiveTab('CREATE_USER')}
          >
            Create User Account
          </Button>
        </div>
      </div>

      {/* Principal Dashboard Navigation Tabs */}
      <div className="ag-tabs-header" style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-color, #334155)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        {[
          { id: 'OVERVIEW', label: 'School Overview' },
          { id: 'SCHOOLADMINS', label: `SchoolAdmins (${schoolAdminCount})` },
          { id: 'CREATE_USER', label: 'Create User Form' },
          { id: 'STAFF_STUDENTS', label: `Staff & Students (${teacherCount + studentCount})` },
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
            }}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SCHOOL OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <>
          <div className="ag-grid-stats" style={{ marginBottom: '1.5rem' }}>
            <StatCard
              title="School Administrators"
              value={isLoading ? '...' : `${schoolAdminCount} Accounts`}
              icon={<Building2 size={24} />}
              subtitle={`Assigned to ${schoolId || 'School'}`}
              variant="purple"
            />
            <StatCard
              title="Active Teachers"
              value={isLoading ? '...' : `${teacherCount} Faculty`}
              icon={<UserCheck size={24} />}
              trend={{ value: 'School Scope', isPositive: true }}
              variant="blue"
            />
            <StatCard
              title="Enrolled Students"
              value={isLoading ? '...' : `${studentCount} Students`}
              icon={<GraduationCap size={24} />}
              subtitle="School Scope Boundary"
              variant="emerald"
            />
          </div>

          <div className="ag-card">
            <div className="ag-card-header">
              <h3>Principal Role Creation Hierarchy</h3>
              <span className="ag-card-tag">SCHOOL SCOPE</span>
            </div>
            <div className="ag-card-body">
              <p className="ag-text-muted" style={{ marginBottom: '1rem' }}>
                As Principal of <strong>{schoolName}</strong>, you can create and manage SchoolAdmins, Teachers, and Students. School ID <code>{schoolId}</code> is automatically attached to all new accounts.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Button size="sm" onClick={() => setActiveTab('CREATE_USER')}>
                  Launch Create User Form
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/principal/users')}>
                  Manage Full Roster
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: SCHOOLADMINS TABLE */}
      {activeTab === 'SCHOOLADMINS' && (
        <div className="ag-card" style={{ marginBottom: '1.5rem' }}>
          <div className="ag-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>School Administrators Directory</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                SchoolAdmins assigned to <code>{schoolName}</code> (ID: {schoolId})
              </p>
            </div>
            <Button size="sm" onClick={() => setActiveTab('CREATE_USER')}>
              Create SchoolAdmin
            </Button>
          </div>
          <div className="ag-card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="ag-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Admin Name / Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Assigned Principal ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {schoolAdminsList.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No SchoolAdmins found for this school boundary.
                    </td>
                  </tr>
                ) : (
                  schoolAdminsList.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color, #334155)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 600 }}>{u.name || `${u.firstName} ${u.lastName}`}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <Badge variant="primary">{u.role}</Badge>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                        <code>{u.principalId || currentUser?.id || 'Self-Linked'}</code>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <Badge variant={u.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {u.status || 'ACTIVE'}
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

      {/* TAB 3: CREATE USER FORM */}
      {activeTab === 'CREATE_USER' && (
        <div className="ag-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div className="ag-card-header" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color, #334155)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Principal User Provisioning</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Create SchoolAdmin, Teacher, or Student accounts for <strong>{schoolName}</strong> (Auto-filled schoolId: <code>{schoolId}</code>).
              </p>
            </div>
          </div>
          <CreateUserForm
            onSubmit={async (payload) => {
              await createUser({
                ...payload,
                schoolId: payload.schoolId || currentUser?.schoolId || currentUser?.tenantId || undefined,
                schoolName: payload.schoolName || currentUser?.schoolName || currentUser?.tenantName || undefined,
              });
              await refetch();
              setActiveTab('STAFF_STUDENTS');
            }}
            onCancel={() => setActiveTab('OVERVIEW')}
          />
        </div>
      )}

      {/* TAB 4: STAFF & STUDENTS */}
      {activeTab === 'STAFF_STUDENTS' && (
        <div className="ag-card" style={{ marginBottom: '1.5rem' }}>
          <div className="ag-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>Faculty Teachers & Enrolled Students</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                Managing {staffAndStudentsList.length} total user(s) under school: <code>{schoolId}</code>
              </p>
            </div>
            <Button size="sm" onClick={() => setActiveTab('CREATE_USER')}>
              Add Teacher / Student
            </Button>
          </div>
          <div className="ag-card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="ag-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Full Name / Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Assigned Class IDs</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {staffAndStudentsList.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No teachers or students registered yet under this school boundary.
                    </td>
                  </tr>
                ) : (
                  staffAndStudentsList.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color, #334155)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 600 }}>{u.name || `${u.firstName} ${u.lastName}`}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <Badge variant={u.role === 'TEACHER' ? 'warning' : 'info'}>{u.role}</Badge>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                        {u.classIds && u.classIds.length > 0 ? u.classIds.join(', ') : 'None assigned'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <Badge variant={u.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {u.status || 'ACTIVE'}
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
    </div>
  );
};

