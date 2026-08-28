import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardForRole } from '../../utils/constants';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  BookOpen,
  ArrowRight,
  Building2,
  Lock,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handlePortalClick = () => {
    if (isAuthenticated && user?.role) {
      try {
        const dest = getDashboardForRole(user.role);
        navigate(dest);
      } catch {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="ag-landing-page" style={{ minHeight: '100vh', background: 'var(--bg-gradient, #f8fafc)', color: '#0f172a' }}>
      {/* Top Public Navigation Bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 2rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>
            AcademyGrowth
          </span>
        </div>

        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontWeight: 600, fontSize: '0.9375rem' }}>
          <Link to="/" style={{ color: '#4f46e5', textDecoration: 'none' }}>
            Home
          </Link>
          <a href="#programs" style={{ color: '#475569', textDecoration: 'none' }}>
            Programs
          </a>
          <a href="#courses" style={{ color: '#475569', textDecoration: 'none' }}>
            Courses
          </a>
          <a href="#about" style={{ color: '#475569', textDecoration: 'none' }}>
            About Us
          </a>
          <a href="#contact" style={{ color: '#475569', textDecoration: 'none' }}>
            Contact
          </a>

          {isAuthenticated ? (
            <Button leftIcon={<GraduationCap size={18} />} onClick={handlePortalClick}>
              Go to Dashboard ({user?.firstName || 'User'})
            </Button>
          ) : (
            <Button leftIcon={<Lock size={18} />} onClick={() => navigate('/login')}>
              Sign In / Login
            </Button>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '0.375rem 1rem',
            background: 'rgba(99, 102, 241, 0.1)',
            color: '#4f46e5',
            borderRadius: '9999px',
            fontWeight: 600,
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
          }}
        >
          Next-Gen Multi-Tenant Education Management Platform
        </span>

        <h1 style={{ fontSize: '3.25rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem', color: '#0f172a' }}>
          Empowering Institutions with Intelligent Campus & Academic Automation
        </h1>

        <p style={{ fontSize: '1.125rem', color: '#475569', maxWidth: '750px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
          AcademyGrowth provides unified hierarchical control for System Administrators, College Deans, School Principals, Faculty Teachers, and Students across multi-tenant environments.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button size="lg" leftIcon={<ArrowRight size={20} />} onClick={handlePortalClick}>
            {isAuthenticated ? 'Enter Portal Dashboard' : 'Access Institutional Portal'}
          </Button>
          <a href="#programs" style={{ textDecoration: 'none' }}>
            <Button size="lg" variant="outline">
              Explore Programs
            </Button>
          </a>
        </div>
      </section>

      {/* Key Feature Cards */}
      <section id="programs" style={{ padding: '4rem 2rem', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 700 }}>Built for Multi-Tier Education Ecosystems</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.5rem' }}>
              Role-based isolation ensuring secure data control and instant academic oversight.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#4f46e5', marginBottom: '1rem' }}><Building2 size={32} /></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Multi-Tenant Architecture</h3>
              <p style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                100% data isolation per institution with custom tenant codes and central system administrator oversight.
              </p>
            </div>

            <div style={{ padding: '2rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#7c3aed', marginBottom: '1rem' }}><Users size={32} /></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Hierarchical User Controls</h3>
              <p style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                Granular RBAC permissions for System Admins, College Admins, Principals, Faculty, and Students.
              </p>
            </div>

            <div style={{ padding: '2rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#059669', marginBottom: '1rem' }}><BookOpen size={32} /></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Real-Time Attendance & Parent Alerts</h3>
              <p style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                Automated SMS & WhatsApp notifications for absentee tracking and parent communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '3rem 2rem', background: '#0f172a', color: '#94a3b8', textAlign: 'center', fontSize: '0.875rem' }}>
        <p>© 2026 AcademyGrowth. All rights reserved. Connected to backend API gateway.</p>
      </footer>
    </div>
  );
};

export default HomePage;
