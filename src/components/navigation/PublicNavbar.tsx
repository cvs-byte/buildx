import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { School, Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../auth/useAuth';
import { Drawer } from '../ui/Drawer';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Features', href: '/features' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ];

  const getDashboardRoute = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'STUDENT': return '/student/dashboard';
      case 'PARENT': return '/parent/dashboard';
      case 'TEACHER': return '/teacher/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      case 'ACCOUNTANT': return '/accountant/dashboard';
      case 'SUPER_ADMIN': return '/super-admin/dashboard';
      default: return '/dashboard';
    }
  };

  const handlePortalClick = () => {
    if (isAuthenticated) {
      navigate(getDashboardRoute());
    } else {
      navigate('/login?returnUrl=/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <School className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              AcademyGrowth
            </span>
            <span className="block text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase -mt-0.5">
              Manage. Learn. Grow.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/60 p-1.5 rounded-2xl">
          {navItems.map(item => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handlePortalClick}
              leftIcon={<LayoutDashboard className="w-4 h-4" />}
            >
              Portal Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')} leftIcon={<LogIn className="w-4 h-4" />}>
                Login
              </Button>
              <Button variant="primary" size="sm" onClick={handlePortalClick}>
                Portal Access
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <Drawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} title="AcademyGrowth Menu" position="right">
        <div className="flex flex-col space-y-4 pt-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => {
                setMobileMenuOpen(false);
                handlePortalClick();
              }}
            >
              Access Academy Portal
            </Button>
          </div>
        </div>
      </Drawer>
    </header>
  );
};
