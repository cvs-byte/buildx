import React, { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import type { User } from '../../types/user.types';
import { formatDate } from '../../utils/formatters';
import { Search, ShieldCheck, Building2 } from 'lucide-react';

export const AdminsManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const schoolId = currentUser?.schoolId || currentUser?.tenantId || undefined;
  const { users: admins, isLoading } = useUsers('SCHOOLADMIN', schoolId);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<User>[] = [
    {
      header: 'Admin Name',
      accessor: (row) => {
        const initials = row.name
          .split(' ')
          .map((n) => n.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'SA';

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
      header: 'Assigned School',
      accessor: (row) => (
        <div className="ag-tenant-cell">
          <Building2 size={14} />
          <span>{row.schoolName || row.schoolId || 'Assigned School'}</span>
        </div>
      ),
    },
    {
      header: 'Role Scope',
      accessor: () => (
        <div className="ag-department-cell">
          <ShieldCheck size={14} />
          <span>SCHOOLADMIN</span>
        </div>
      ),
    },
    {
      header: 'Appointed On',
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
          <h1 className="ag-page-title">School Administrators Directory</h1>
          <p className="ag-page-subtitle">
            Principal scope: Operational School Administrators assigned to {currentUser?.schoolName || schoolId || 'your school'}.
          </p>
        </div>
      </div>

      <div className="ag-filter-bar">
        <div className="ag-search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search admin by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredAdmins}
        keyExtractor={(a) => a.userId || a.id}
        isLoading={isLoading}
        emptyMessage="No school administrators assigned to this school."
      />
    </div>
  );
};
