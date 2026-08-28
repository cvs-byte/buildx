import React, { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { Table, type Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { CreateUserForm } from '../../components/forms/CreateUserForm';
import type { User } from '../../types/user.types';
import { formatDate } from '../../utils/formatters';
import { UserPlus, Search, Trash2, BookOpen } from 'lucide-react';

export const CollegeAdminTeachersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const schoolId = currentUser?.schoolId || currentUser?.tenantId || undefined;
  const { users: teachers, isLoading, createUser, deleteUser } = useUsers('TEACHER', schoolId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.department && t.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns: Column<User>[] = [
    {
      header: 'Teacher Name',
      accessor: (row) => {
        const initials = row.name
          .split(' ')
          .map((n) => n.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'T';

        return (
          <div className="ag-user-cell">
            <div className="ag-cell-avatar">{initials}</div>
            <div>
              <span className="ag-cell-name">{row.name}</span>
              <span className="ag-cell-sub">{row.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Department',
      accessor: (row) => (
        <div className="ag-department-cell">
          <BookOpen size={14} />
          <span>{row.department || 'General Faculty'}</span>
        </div>
      ),
    },
    {
      header: 'Specialization',
      accessor: (row) => row.subjectSpecialization || 'N/A',
    },
    {
      header: 'School',
      accessor: (row) => row.schoolName || row.tenantName || row.schoolId || '-',
    },
    {
      header: 'Joining Date',
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
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          className="ag-action-btn-danger"
          onClick={() => deleteUser(row.userId || row.id)}
          title="Remove Teacher"
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
          <h1 className="ag-page-title">School Admin: Teachers Management</h1>
          <p className="ag-page-subtitle">
            Recruit, manage, and assign faculty teachers within designated school boundary ({currentUser?.schoolName || schoolId}).
          </p>
        </div>
        <Button
          leftIcon={<UserPlus size={18} />}
          onClick={() => setIsModalOpen(true)}
        >
          Add New Teacher
        </Button>
      </div>

      <div className="ag-filter-bar">
        <div className="ag-search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search teacher by name, department, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredTeachers}
        keyExtractor={(t) => t.userId || t.id}
        isLoading={isLoading}
        emptyMessage="No teachers found in database for this school."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Recruit New Faculty Teacher"
        subtitle="Add teacher credentials within your school boundary."
      >
        <CreateUserForm
          initialRole="TEACHER"
          onSubmit={async (payload) => {
            await createUser({
              ...payload,
              role: 'TEACHER',
              schoolId: payload.schoolId || currentUser?.schoolId || currentUser?.tenantId || undefined,
              schoolName: payload.schoolName || currentUser?.schoolName || currentUser?.tenantName || undefined,
            });
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
