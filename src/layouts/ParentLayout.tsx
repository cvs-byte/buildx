import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  School,
  LayoutDashboard,
  UserCheck,
  FileSpreadsheet,
  DollarSign,
  Calendar,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Avatar } from '../components/ui/Avatar';
import { Dropdown } from '../components/ui/Dropdown';

export const ParentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/parent/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Attendance', href: '/parent/attendance', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Exam Results', href: '/parent/results', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { label: 'Fee Payments', href: '/parent/fees', icon: <DollarSign className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Parent Portal';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100">
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 dark:bg-amber-500 flex items-center justify-center text-white font-bold">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight">AcademyGrowth</span>
              <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Parent Portal
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <Link to="/profile" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <User className="w-5 h-5 text-slate-400" />
            <span>Profile</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-xl text-slate-600">
            <Menu className="w-6 h-6" />
          </button>

          <span className="font-bold text-sm text-slate-600 dark:text-slate-300">Guardian Access Console</span>

          <Dropdown
            align="right"
            trigger={
              <div className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-slate-100">
                <Avatar name={displayName} size="sm" />
                <span className="text-xs font-bold hidden sm:block">{displayName}</span>
              </div>
            }
            items={[
              { id: 'prof', label: 'Profile', icon: <User className="w-4 h-4" />, onClick: () => navigate('/profile') },
              { id: 'out', label: 'Sign Out', icon: <LogOut className="w-4 h-4" />, onClick: handleLogout, destructive: true },
            ]}
          />
        </header>

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
