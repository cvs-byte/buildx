import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  UserCheck,
  FileSpreadsheet,
  DollarSign,
  Calendar,
  FileText,
  BarChart3,
  BellRing,
  FileSearch,
  Settings,
  ArrowLeft,
  School,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Badge } from '../components/ui/Badge';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const adminNav = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <ShieldAlert className="w-4 h-4" /> },
    { label: 'Student Directory', href: '/admin/students', icon: <Users className="w-4 h-4" /> },
    { label: 'Teacher Directory', href: '/admin/teachers', icon: <School className="w-4 h-4" /> },
    { label: 'Parent Directory', href: '/admin/parents', icon: <Users className="w-4 h-4" /> },
    { label: 'Classes & Sections', href: '/admin/classes', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Attendance Records', href: '/admin/attendance', icon: <UserCheck className="w-4 h-4" /> },
    { label: 'Academic Results', href: '/admin/results', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { label: 'Fee Management', href: '/admin/fees', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'Events Calendar', href: '/admin/events', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Notice Board', href: '/admin/notices', icon: <FileText className="w-4 h-4" /> },
    { label: 'Reports & Analytics', href: '/admin/reports', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Notifications', href: '/admin/notifications', icon: <BellRing className="w-4 h-4" /> },
    { label: 'User Directory', href: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Audit Trail', href: '/admin/audit-logs', icon: <FileSearch className="w-4 h-4" /> },
    { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="h-16 border-b border-slate-800 bg-slate-950 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <School className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-white">AcademyGrowth</span>
          </Link>
          <span className="text-slate-700 font-light">|</span>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">ACADEMY ADMIN</Badge>
            <span className="text-xs text-slate-400 font-mono">Role: {user?.role || 'ADMIN'}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Public Website</span>
        </button>
      </header>

      <div className="flex-1 flex min-w-0">
        <aside className="w-64 bg-slate-950 border-r border-slate-800 p-4 space-y-1 shrink-0 hidden md:block overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-3 mb-3">
            Administration Portal
          </div>
          {adminNav.map(item => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </aside>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
