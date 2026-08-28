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
import { UserPlus, Search, Trash2, Building2 } from 'lucide-react';

export const PrincipalsManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const schoolId = currentUser?.schoolId || currentUser?.tenantId || undefined;
  const { users: principals, isLoading, createUser, deleteUser } = useUsers('PRINCIPAL', schoolId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrincipals = principals.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.schoolName && p.schoolName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns: Column<User>[] = [
    {
      header: 'Principal Name',
      accessor: (row) => {
        const initials = row.name
          .split(' ')
          .map((n) => n.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'P';

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
      header: 'School / Institution',
      accessor: (row) => (
        <div className="ag-tenant-cell">
          <Building2 size={14} />
          <span>{row.schoolName || row.schoolId || 'Assigned School'}</span>
        </div>
      ),
    },
    {
      header: 'School ID',
      accessor: (row) => <code>{row.schoolId || '-'}</code>,
    },
    {
      header: 'Joining Date',
      accessor: (row) => formatDate(row.joiningDate || row.createdAt),
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
          title="Remove Principal"
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
          <h1 className="ag-page-title">Principals Management</h1>
          <p className="ag-page-subtitle">
            System Admin Scope: Create and appoint school Principals with embedded School Name & School ID.
          </p>
        </div>
        <Button
          leftIcon={<UserPlus size={18} />}
          onClick={() => setIsModalOpen(true)}
        >
          Appoint Principal
        </Button>
      </div>

      <div className="ag-filter-bar">
        <div className="ag-search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search principal by name, email or school..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredPrincipals}
        keyExtractor={(p) => p.userId || p.id}
        isLoading={isLoading}
        emptyMessage="No principals found in database. Click 'Appoint Principal' to add one."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Appoint New Principal"
        subtitle="Registers a new Principal and embedded School entry directly in Users DynamoDB table."
      >
        <CreateUserForm
          initialRole="PRINCIPAL"
          onSubmit={async (payload) => {
            await createUser(payload);
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
