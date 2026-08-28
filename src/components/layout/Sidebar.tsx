import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  Award,
  ShieldAlert,
  CalendarCheck,
  BarChart3,
  Calendar,
  Landmark,
  ShieldCheck,
  UserCheck,
  Sliders,
  QrCode,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;

  const renderNavLinks = () => {
    switch (role) {
      case 'SYSTEM_ADMIN':
      case 'SUPERADMIN':
      case 'ADMIN':
        return (
          <>
            <div className="ag-nav-section-title">PLATFORM SYSTEM ADMIN</div>
            <NavLink
              to="/superadmin/dashboard"
              end
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Platform Overview</span>
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>User Directory</span>
            </NavLink>
            <NavLink
              to="/admin/students"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <GraduationCap size={18} />
              <span>Student Roster</span>
            </NavLink>
            <NavLink
              to="/admin/qr"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <QrCode size={18} />
              <span>Bulk QR Cards</span>
            </NavLink>
            <NavLink
              to="/admin/tenants"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <Building2 size={18} />
              <span>Schools & Tenants</span>
            </NavLink>
            <NavLink
              to="/superadmin/college-admins"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <ShieldCheck size={18} />
              <span>School Admins</span>
            </NavLink>
            <NavLink
              to="/superadmin/principals"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <UserCheck size={18} />
              <span>Platform Principals</span>
            </NavLink>
            <NavLink
              to="/admin/attendance"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <UserCheck size={18} />
              <span>Staff Attendance</span>
            </NavLink>

            <div className="ag-nav-section-title">PLATFORM DASHBOARDS</div>
            <NavLink
              to="/dashboards/results"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              <span>Results Overview</span>
            </NavLink>
            <NavLink
              to="/dashboards/attendance"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <CalendarCheck size={18} />
              <span>Attendance Tracker</span>
            </NavLink>
            <NavLink
              to="/dashboards/classes"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <Calendar size={18} />
              <span>Today's Classes</span>
            </NavLink>
          </>
        );

      case 'COLLEGE_ADMIN':
      case 'SCHOOLADMIN':
        return (
          <>
            <div className="ag-nav-section-title">COLLEGE ADMIN PORTAL</div>
            <NavLink
              to="/schooladmin/dashboard"
              end
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <Landmark size={18} />
              <span>School Overview</span>
            </NavLink>
            <NavLink
              to="/schooladmin/users"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>User Directory</span>
            </NavLink>
            <NavLink
              to="/schooladmin/students"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <GraduationCap size={18} />
              <span>Student Roster</span>
            </NavLink>
            <NavLink
              to="/schooladmin/qr"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <QrCode size={18} />
              <span>Bulk QR Cards</span>
            </NavLink>
            <NavLink
              to="/schooladmin/teachers"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <UserCheck size={18} />
              <span>Manage Teachers</span>
            </NavLink>
            <NavLink
              to="/schooladmin/timetables"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <Calendar size={18} />
              <span>Schedule Timetables</span>
            </NavLink>
            <NavLink
              to="/schooladmin/classes"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <Building2 size={18} />
              <span>Student Class Groups</span>
            </NavLink>
            <NavLink
              to="/schooladmin/attendance-settings"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <Sliders size={18} />
              <span>Attendance Settings</span>
            </NavLink>
          </>
        );

      case 'PRINCIPAL':
        return (
          <>
            <div className="ag-nav-section-title">PRINCIPAL PORTAL</div>
            <NavLink
              to="/principal/dashboard"
              end
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/principal/users"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>User Directory</span>
            </NavLink>
            <NavLink
              to="/principal/admins"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <ShieldCheck size={18} />
              <span>School Admins</span>
            </NavLink>
            <NavLink
              to="/principal/teachers"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Teachers Directory</span>
            </NavLink>
            <NavLink
              to="/principal/attendance"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <UserCheck size={18} />
              <span>Mark Attendance</span>
            </NavLink>

            <div className="ag-nav-section-title">ANALYTICS & SCHEDULES</div>
            <NavLink
              to="/dashboards/results"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              <span>Results Overview</span>
            </NavLink>
            <NavLink
              to="/dashboards/attendance"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <CalendarCheck size={18} />
              <span>Attendance Tracker</span>
            </NavLink>
            <NavLink
              to="/dashboards/classes"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <Calendar size={18} />
              <span>Today's Classes</span>
            </NavLink>
          </>
        );

      case 'TEACHER':
        return (
          <>
            <div className="ag-nav-section-title">TEACHER PORTAL</div>
            <NavLink
              to="/teacher/dashboard"
              end
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/teacher/students"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <GraduationCap size={18} />
              <span>Students Directory</span>
            </NavLink>
            <NavLink
              to="/teacher/attendance"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <UserCheck size={18} />
              <span>Mark Class Attendance</span>
            </NavLink>
            <NavLink
              to="/teacher/timetable"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <Calendar size={18} />
              <span>My Timetable</span>
            </NavLink>

            <div className="ag-nav-section-title">CLASSROOM TOOLS</div>
            <NavLink
              to="/dashboards/classes"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <Calendar size={18} />
              <span>Today's Timetable</span>
            </NavLink>
            <NavLink
              to="/dashboards/results"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              <span>Class Results</span>
            </NavLink>
          </>
        );

      case 'STUDENT':
        return (
          <>
            <div className="ag-nav-section-title">STUDENT PORTAL</div>
            <NavLink
              to="/student/dashboard"
              end
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>My Portal</span>
            </NavLink>
            <NavLink
              to="/student/qr"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <QrCode size={18} />
              <span>My Attendance QR</span>
            </NavLink>
            <NavLink
              to="/student/courses"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <BookOpen size={18} />
              <span>My Courses</span>
            </NavLink>
            <NavLink
              to="/student/grades"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <Award size={18} />
              <span>Grades & PDF Report</span>
            </NavLink>
            <NavLink
              to="/dashboards/classes"
              className={({ isActive }) => `ag-nav-link ${isActive ? 'active' : ''}`}
            >
              <Calendar size={18} />
              <span>Daily Class Schedule</span>
            </NavLink>
          </>
        );

      default:
        return (
          <NavLink to="/unauthorized" className="ag-nav-link">
            <ShieldAlert size={18} />
            <span>Unauthorized</span>
          </NavLink>
        );
    }
  };

  return (
    <aside className="ag-sidebar">
      <div className="ag-sidebar-brand">
        <div className="ag-brand-logo">
          <span>AG</span>
        </div>
        <div className="ag-brand-text">
          <span className="ag-brand-title">AcademyGrowth</span>
          <span className="ag-brand-tagline">Multi-Tenant LMS</span>
        </div>
      </div>

      <nav className="ag-sidebar-nav">{renderNavLinks()}</nav>

      <div className="ag-sidebar-footer">
        <div className="ag-hierarchy-card">
          <span className="ag-hierarchy-label">5-Tier RBAC Hierarchy</span>
          <p className="ag-hierarchy-desc">
            SYSTEM_ADMIN → COLLEGE_ADMIN → PRINCIPAL → TEACHER → STUDENT
          </p>
        </div>
      </div>
    </aside>
  );
};
