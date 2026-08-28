import React, { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { CreateUserForm } from '../../components/forms/CreateUserForm';
import type { User } from '../../types/user.types';
import { formatDate } from '../../utils/formatters';
import { Search, GraduationCap, UserPlus, X } from 'lucide-react';

export const StudentsManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const schoolId = currentUser?.schoolId || currentUser?.tenantId || undefined;
  const { users: students, isLoading, createUser, refetch } = useUsers('STUDENT', schoolId);

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns: Column<User>[] = [
    {
      header: 'Student Name',
      accessor: (row) => {
        const initials = row.name
          .split(' ')
          .map((n) => n.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'S';

        return (
          <div className="ag-user-cell">
            <div className="ag-cell-avatar ag-avatar-student">{initials}</div>
            <div>
              <span className="ag-cell-name">{row.name}</span>
              <span className="ag-cell-sub">{row.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Roll / ID',
      accessor: (row) => <code className="ag-code-badge">{row.rollNumber || row.userId || 'STD-N/A'}</code>,
    },
    {
      header: 'Grade & Section',
      accessor: (row) => (
        <div className="ag-grade-cell">
          <GraduationCap size={14} />
          <span>{row.gradeLevel || 'Class'} ({row.section || 'Default'})</span>
        </div>
      ),
    },
    {
      header: 'School',
      accessor: (row) => row.schoolName || row.schoolId || 'Assigned School',
    },
    {
      header: 'Enrollment Date',
      accessor: (row) => formatDate(row.createdAt),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'neutral'}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">Student Directory</h1>
          <p className="ag-page-subtitle">
            Classroom execution scope: View and enroll student records for {currentUser?.schoolName || schoolId || 'your school'}.
          </p>
        </div>
        <Button
          leftIcon={showCreateForm ? <X size={18} /> : <UserPlus size={18} />}
          variant={showCreateForm ? 'outline' : 'primary'}
          onClick={() => setShowCreateForm((prev) => !prev)}
        >
          {showCreateForm ? 'Close Form' : 'Add Student Account'}
        </Button>
      </div>

      {showCreateForm && (
        <div className="ag-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div className="ag-card-header" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color, #334155)', paddingBottom: '0.75rem' }}>
            <h3 style={{ margin: 0 }}>Enroll New Student Account</h3>
          </div>
          <CreateUserForm
            defaultRole="STUDENT"
            onSubmit={async (payload) => {
              await createUser({
                ...payload,
                role: 'STUDENT',
                schoolId: payload.schoolId || currentUser?.schoolId || currentUser?.tenantId || undefined,
                schoolName: payload.schoolName || currentUser?.schoolName || currentUser?.tenantName || undefined,
              });
              await refetch();
              setShowCreateForm(false);
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      <div className="ag-filter-bar">
        <div className="ag-search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search student by name, roll number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredStudents}
        keyExtractor={(s) => s.userId || s.id}
        isLoading={isLoading}
        emptyMessage="No students registered yet in database for this school."
      />
    </div>
  );
};

