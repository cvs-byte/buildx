import React from 'react';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../hooks/useTenant';
import { useUsers } from '../../hooks/useUsers';
import { AbsenteesList } from '../../components/AbsenteesList';
import { Building2, Users, UserPlus, ArrowRight, UserX } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tenants } = useTenant();
  const { users, isLoading } = useUsers({ isGlobal: true });

  const principalCount = users.filter((u) => u.role === 'PRINCIPAL').length;
  const teacherCount = users.filter((u) => u.role === 'TEACHER').length;
  const studentCount = users.filter((u) => u.role === 'STUDENT').length;

  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">System Admin Dashboard</h1>
          <p className="ag-page-subtitle">
            Global management portal for multi-tenant colleges, principal accounts, and daily absentee notifications.
          </p>
        </div>
        <div className="ag-header-actions">
          <Button
            leftIcon={<UserPlus size={16} />}
            onClick={() => navigate('/admin/principals')}
          >
            Add Principal
          </Button>
          <Button
            variant="outline"
            leftIcon={<Building2 size={16} />}
            onClick={() => navigate('/admin/tenants')}
          >
            New Tenant
          </Button>
        </div>
      </div>

      <div className="ag-grid-stats">
        <StatCard
          title="Registered Tenants"
          value={tenants.length}
          icon={<Building2 size={24} />}
          trend={{ value: '100% Isolated Data', isPositive: true }}
          variant="blue"
        />
        <StatCard
          title="Appointed Principals"
          value={isLoading ? '...' : `${principalCount} Active`}
          icon={<Users size={24} />}
          subtitle="Hierarchical User Level 1"
          variant="purple"
        />
        <StatCard
          title="Total Faculty Network"
          value={isLoading ? '...' : `${teacherCount} Teachers`}
          icon={<Users size={24} />}
          subtitle="Managed by Principals"
          variant="emerald"
        />
        <StatCard
          title="Total Enrolled Students"
          value={isLoading ? '...' : `${studentCount} Students`}
          icon={<UserX size={24} />}
          subtitle="Registered across tenants"
          variant="amber"
        />
      </div>

      {/* Absentees List & Parent Notifications Section */}
      <AbsenteesList />

      <div className="ag-card">
        <div className="ag-card-header">
          <h3>Quick Hierarchy Action</h3>
          <span className="ag-card-tag">ADMIN LEVEL</span>
        </div>
        <div className="ag-card-body">
          <p className="ag-text-muted">
            As a System Administrator, you hold top-level privilege to recruit school Principals and configure multi-tenant environments.
          </p>
          <div className="ag-hierarchy-flow">
            <div className="flow-step active">
              <span>1. Admin</span>
            </div>
            <ArrowRight size={16} className="flow-arrow" />
            <div className="flow-step clickable" onClick={() => navigate('/admin/principals')}>
              <span>2. Create Principal</span>
            </div>
            <ArrowRight size={16} className="flow-arrow" />
            <div className="flow-step disabled">
              <span>3. Teacher</span>
            </div>
            <ArrowRight size={16} className="flow-arrow" />
            <div className="flow-step disabled">
              <span>4. Student</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
