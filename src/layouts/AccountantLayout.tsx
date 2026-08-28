import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  School,
  LayoutDashboard,
  Users,
  DollarSign,
  FileCheck,
  BarChart3,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Avatar } from '../components/ui/Avatar';

export const AccountantLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/accountant/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Students Ledger', href: '/accountant/students', icon: <Users className="w-5 h-5" /> },
    { label: 'Fee Structures', href: '/accountant/fee-structures', icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Payments Record', href: '/accountant/payments', icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Receipts Registry', href: '/accountant/receipts', icon: <FileCheck className="w-5 h-5" /> },
    { label: 'Financial Reports', href: '/accountant/reports', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100">
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight">AcademyGrowth</span>
              <span className="block text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                Accountant Desk
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                location.pathname === item.href
                  ? 'bg-violet-50 text-violet-600 dark:bg-violet-950/70 dark:text-violet-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between">
          <span className="font-bold text-sm text-slate-600">Bursar & Accounting Desk</span>
          <Avatar name={user?.firstName || 'Accountant'} size="sm" />
        </header>

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
