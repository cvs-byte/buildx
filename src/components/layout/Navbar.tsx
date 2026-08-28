import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { TenantSelector } from './TenantSelector';
import { Badge } from '../common/Badge';
import { getInitials, formatRoleName } from '../../utils/formatters';
import { LogOut, Bell } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const getRoleVariant = (role?: string) => {
    switch (role) {
      case 'SUPERADMIN':
      case 'ADMIN':
        return 'danger';
      case 'PRINCIPAL':
        return 'primary';
      case 'SCHOOLADMIN':
      case 'COLLEGE_ADMIN':
        return 'warning';
      case 'TEACHER':
        return 'info';
      case 'STUDENT':
        return 'success';
      default:
        return 'neutral';
    }
  };

  return (
    <header className="ag-navbar">
      <div className="ag-navbar-left">
        <TenantSelector />
      </div>

      <div className="ag-navbar-right">
        <button className="ag-icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="ag-notification-dot"></span>
        </button>

        <div className="ag-navbar-divider"></div>

        <div className="ag-user-profile">
          <div className="ag-avatar">
            {getInitials(user?.firstName, user?.lastName)}
          </div>
          <div className="ag-user-details">
            <span className="ag-user-name">
              {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email}
            </span>
            <Badge variant={getRoleVariant(user?.role)}>
              {formatRoleName(user?.role)}
            </Badge>
          </div>
        </div>

        <button
          className="ag-logout-btn"
          onClick={handleLogout}
          title="Sign Out"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
