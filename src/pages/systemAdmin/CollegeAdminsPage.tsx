import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { CreateUserForm } from '../../components/forms/CreateUserForm';
import { userApi } from '../../api/user.api';
import type { User, CreateUserPayload } from '../../types/user.types';
import { Building2, Shield, UserPlus, RefreshCw } from 'lucide-react';

export const CollegeAdminsPage: React.FC = () => {
  const [admins, setAdmins] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userApi.getAdmins();
      setAdmins(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load college administrators.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (payload: CreateUserPayload) => {
    await userApi.createUser(payload);
    setIsModalOpen(false);
    await fetchAdmins();
  };

  const columns: Column<User>[] = [
    {
      header: 'Administrator Name',
      render: (row: User) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          <div className="ag-text-muted" style={{ fontSize: '0.8125rem' }}>{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Assigned College / School',
      render: (row: User) => row.schoolName || row.tenantName || 'Global Platform',
    },
    {
      header: 'Phone Contact',
      render: (row: User) => row.phone || 'N/A',
    },
    {
      header: 'Account Status',
      render: (row: User) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'danger'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Date Registered',
      render: (row: User) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">College Administrators Management</h1>
          <p className="ag-page-subtitle">
            System Admin Portal: Provision and manage College Admin accounts for tenant institutions.
          </p>
        </div>
        <div className="ag-header-actions">
          <Button variant="outline" leftIcon={<RefreshCw size={16} />} onClick={fetchAdmins}>
            Refresh
          </Button>
          <Button leftIcon={<UserPlus size={16} />} onClick={() => setIsModalOpen(true)}>
            Add College Admin
          </Button>
        </div>
      </div>

      <div className="ag-grid-stats">
        <StatCard
          title="Total College Admins"
          value={admins.length}
          icon={<Shield size={24} />}
          variant="purple"
        />
        <StatCard
          title="Active Accounts"
          value={admins.filter((a) => a.status === 'ACTIVE').length}
          icon={<Building2 size={24} />}
          variant="emerald"
        />
      </div>

      {error && (
        <div className="ag-alert ag-alert-error" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <Table<User>
        columns={columns}
        data={admins}
        isLoading={isLoading}
        emptyMessage="No college admin accounts found."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New College Administrator Account"
      >
        <CreateUserForm
          initialRole="COLLEGE_ADMIN"
          onSubmit={handleCreateAdmin}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default CollegeAdminsPage;
