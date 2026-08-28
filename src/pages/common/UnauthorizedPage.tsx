import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { ROLE_ROUTES } from '../../utils/constants';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoHome = () => {
    if (user?.role && ROLE_ROUTES[user.role]) {
      navigate(ROLE_ROUTES[user.role], { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="ag-error-page">
      <div className="ag-error-card">
        <div className="ag-error-icon danger">
          <ShieldAlert size={48} />
        </div>
        <h2>403 - Access Denied</h2>
        <p className="ag-error-message">
          You do not have permission to access this page.
        </p>
        <p className="ag-error-sub">
          Your account role (<strong>{user?.role || 'Guest'}</strong>) is restricted from accessing this area of AcademyGrowth.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <Button leftIcon={<ArrowLeft size={18} />} onClick={handleGoHome}>
            Return to Dashboard
          </Button>
          <Button variant="outline" leftIcon={<LogOut size={18} />} onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
