import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ShieldCheck, Mail, Lock, Building2 } from 'lucide-react';
import { getDashboardForRole, API_BASE_URL } from '../../utils/constants';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantCode, setTenantCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const user = await login({
        email: email.trim(),
        username: email.trim(),
        password,
        passwordHash: password,
        tenantCode: tenantCode.trim() || undefined,
      });

      showToast('success', `Welcome back, ${user.firstName || user.name || 'User'}!`);

      try {
        const dashboardPath = getDashboardForRole(user.role);
        navigate(dashboardPath, { replace: true });
      } catch (roleErr: any) {
        console.error('[AUTH ERROR] Unknown role routing failure:', roleErr);
        navigate('/unauthorized', { replace: true });
      }
    } catch (err: any) {
      console.error('[AUTH ERROR] Login failed:', err?.message || err);
    }
  };

  return (
    <div className="ag-auth-page">
      <div className="ag-auth-card">
        <div className="ag-auth-header">
          <div className="ag-auth-logo">
            <ShieldCheck size={32} />
          </div>
          <h2>AcademyGrowth Portal</h2>
          <p className="ag-auth-subtitle">
            Multi-Tenant Hierarchical Education Management
          </p>
        </div>

        {error && (
          <div className="ag-alert ag-alert-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="ag-form-stack" noValidate>
          <Input
            label="Tenant Code (Optional)"
            placeholder="e.g. OIC-MAIN"
            value={tenantCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTenantCode(e.target.value)}
            leftIcon={<Building2 size={18} />}
            helperText="Leave empty for global System Admin"
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="your.name@school.edu"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            leftIcon={<Mail size={18} />}
            required
            autoComplete="username"
          />

          <Input
            label="Password *"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            leftIcon={<Lock size={18} />}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="ag-btn-block"
            disabled={isLoading || !email.trim() || !password}
          >
            {isLoading ? 'Signing in...' : 'Sign In to Account'}
          </Button>
        </form>

        <div className="ag-auth-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Connected to Backend API: <code>{API_BASE_URL}</code>
          </p>
        </div>
      </div>
    </div>
  );
};
