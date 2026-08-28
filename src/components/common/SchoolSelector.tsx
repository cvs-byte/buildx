import React from 'react';
import { Building2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTenant } from '../../hooks/useTenant';

export interface SchoolSelectorProps {
  selectedSchoolId?: string;
  schools?: any[];
  isLocked?: boolean;
  lockedSchoolName?: string;
  onSelectSchool?: (schoolId: string) => void;
}

export const SchoolSelector: React.FC<SchoolSelectorProps> = ({
  selectedSchoolId,
  schools,
  isLocked,
  lockedSchoolName,
  onSelectSchool,
}) => {
  const { user } = useAuth();
  const { tenants, activeTenant, selectTenant } = useTenant();

  const displayName =
    lockedSchoolName ||
    user?.schoolName ||
    user?.tenantName ||
    activeTenant?.name ||
    'Assigned College';

  const isSuperAdmin =
    !isLocked &&
    (user?.role === 'SYSTEM_ADMIN' ||
      user?.role === 'SUPERADMIN' ||
      user?.role === 'ADMIN');

  if (!isSuperAdmin) {
    return (
      <div
        className="ag-school-badge"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.875rem',
          background: 'rgba(99, 102, 241, 0.08)',
          borderRadius: '8px',
          border: '1px solid rgba(99, 102, 241, 0.2)',
        }}
      >
        <Building2 size={16} style={{ color: 'var(--primary-color, #4f46e5)' }} />
        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-color, #1e293b)' }}>
          {displayName}
        </span>
      </div>
    );
  }

  const availableTenants = schools && schools.length > 0 ? schools : tenants;

  return (
    <div className="ag-school-selector" style={{ position: 'relative', display: 'inline-block' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.875rem',
          background: 'var(--card-bg, #fff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        <Building2 size={16} className="ag-text-primary" />
        <select
          value={selectedSchoolId || activeTenant?.id || ''}
          onChange={(e) => {
            const val = e.target.value;
            if (onSelectSchool) onSelectSchool(val);
            selectTenant(val);
          }}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            paddingRight: '1rem',
          }}
        >
          {availableTenants.map((tenant: any) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name || tenant.schoolName} ({tenant.code || tenant.id})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
