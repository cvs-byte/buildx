import React, { useState } from 'react';
import { useTenant } from '../../hooks/useTenant';
import { Table, type Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { CreateTenantForm } from '../../components/forms/CreateTenantForm';
import type { Tenant } from '../../types/tenant.types';
import { formatDate } from '../../utils/formatters';
import { Building2, Plus } from 'lucide-react';

export const TenantsManagement: React.FC = () => {
  const { tenants, isLoading } = useTenant();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns: Column<Tenant>[] = [
    {
      header: 'Institution / School Name',
      accessor: (row) => (
        <div className="ag-tenant-info-cell">
          <div className="ag-tenant-avatar">
            <Building2 size={18} />
          </div>
          <div>
            <span className="ag-cell-name">{row.name}</span>
            <span className="ag-cell-sub">{row.contactEmail}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Tenant Code',
      accessor: (row) => <code className="ag-code-badge">{row.code}</code>,
    },
    {
      header: 'Principals',
      accessor: (row) => row.principalCount ?? 1,
    },
    {
      header: 'Teachers',
      accessor: (row) => row.teacherCount ?? 0,
    },
    {
      header: 'Students',
      accessor: (row) => row.studentCount ?? 0,
    },
    {
      header: 'Created On',
      accessor: (row) => formatDate(row.createdAt),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'warning'}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">Schools & Multi-Tenant Management</h1>
          <p className="ag-page-subtitle">
            Manage multi-tenant institution isolation, custom domains, and school accounts.
          </p>
        </div>
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => setIsModalOpen(true)}
        >
          Create School Tenant
        </Button>
      </div>

      <Table
        columns={columns}
        data={tenants}
        keyExtractor={(t) => t.id}
        isLoading={isLoading}
        emptyMessage="No tenants registered yet."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New School Tenant"
        subtitle="Creates an isolated database tenant scope with custom headers and isolated data."
      >
        <CreateTenantForm
          onSuccess={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
