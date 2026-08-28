import React, { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type { Tenant } from '../types/tenant.types';
import { tenantApi } from '../api/tenant.api';
import { storage } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';

interface TenantContextType {
  tenants: Tenant[];
  activeTenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  selectTenant: (tenantId: string) => void;
  refreshTenants: () => Promise<void>;
  addTenant: (tenant: Tenant) => void;
}

export const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading, token } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenant, setActiveTenantState] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await tenantApi.getTenants();
      setTenants(data);

      const savedTenantId = storage.getActiveTenant();
      let current = data.find((t) => t.id === savedTenantId);
      if (!current && data.length > 0) {
        current = data[0];
        storage.setActiveTenant(current.id);
      }
      setActiveTenantState(current || null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tenants.');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (!isAuthenticated || !token) {
      setTenants([]);
      setActiveTenantState(null);
      setIsLoading(false);
      return;
    }
    fetchTenants();
  }, [isAuthLoading, isAuthenticated, token, fetchTenants]);

  const selectTenant = (tenantId: string) => {
    const selected = tenants.find((t) => t.id === tenantId);
    if (selected) {
      setActiveTenantState(selected);
      storage.setActiveTenant(selected.id);
    }
  };

  const addTenant = (newTenant: Tenant) => {
    setTenants((prev) => [newTenant, ...prev]);
    if (!activeTenant) {
      setActiveTenantState(newTenant);
      storage.setActiveTenant(newTenant.id);
    }
  };

  return (
    <TenantContext.Provider
      value={{
        tenants,
        activeTenant,
        isLoading,
        error,
        selectTenant,
        refreshTenants: fetchTenants,
        addTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};
