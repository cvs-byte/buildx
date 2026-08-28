import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Building, Users, Key, Settings, FileSearch, ArrowLeft, School } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Badge } from '../components/ui/Badge';

export const SuperAdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const superNav = [
    { label: 'System Overview', href: '/super-admin/dashboard', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Institutions Registry', href: '/super-admin/institutions', icon: <Building className="w-4 h-4" /> },
    { label: 'Global Users Directory', href: '/super-admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Roles & Permissions', href: '/super-admin/roles', icon: <Key className="w-4 h-4" /> },
    { label: 'System Settings', href: '/super-admin/system-settings', icon: <Settings className="w-4 h-4" /> },
    { label: 'AWS Audit Logs', href: '/super-admin/audit-logs', icon: <FileSearch className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="h-16 border-b border-slate-800 bg-black px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <School className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-white">AcademyGrowth</span>
          </Link>
          <span className="text-slate-800">|</span>
          <Badge variant="danger" size="sm">SUPER ADMIN GOVERNANCE</Badge>
        </div>

        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Portal</span>
        </button>
      </header>

      <div className="flex-1 flex min-w-0">
        <aside className="w-64 bg-black border-r border-slate-900 p-4 space-y-1 shrink-0 hidden md:block">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-3 mb-3">
            Platform Control
          </div>
          {superNav.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === item.href
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </aside>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
