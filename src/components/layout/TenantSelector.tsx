import React from 'react';
import { useTenant } from '../../hooks/useTenant';
import { Building2, ChevronDown } from 'lucide-react';

export const TenantSelector: React.FC = () => {
  const { tenants, activeTenant, selectTenant } = useTenant();

  if (tenants.length === 0) {
    return (
      <div className="ag-tenant-badge">
        <Building2 size={16} />
        <span>Academy Growth System</span>
      </div>
    );
  }

  return (
    <div className="ag-tenant-selector">
      <Building2 size={16} className="tenant-icon" />
      <select
        value={activeTenant?.id || ''}
        onChange={(e) => selectTenant(e.target.value)}
        aria-label="Select School / College Tenant"
        className="tenant-dropdown"
      >
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name} ({tenant.code})
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="dropdown-arrow" />
    </div>
  );
};
