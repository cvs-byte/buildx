import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../hooks/useAuth';
import { getDashboardForRole } from '../utils/constants';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { LoginPage } from '../pages/auth/LoginPage';

// System Admin / Super Admin (Platform Scope)
import { SystemAdminDashboard } from '../pages/systemAdmin/SystemAdminDashboard';
import { CollegeAdminsPage } from '../pages/systemAdmin/CollegeAdminsPage';
import { PrincipalsManagement } from '../pages/admin/PrincipalsManagement';
import { TenantsManagement } from '../pages/admin/TenantsManagement';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminStaffAttendancePage } from '../pages/admin/AdminStaffAttendancePage';

// School Admin / College Admin (School Tenant Scope)
import { CollegeAdminDashboard } from '../pages/collegeAdmin/CollegeAdminDashboard';
import { CollegeAdminTeachersPage } from '../pages/collegeAdmin/CollegeAdminTeachersPage';
import { CollegeAdminTimetablesPage } from '../pages/collegeAdmin/CollegeAdminTimetablesPage';
import { CollegeAdminClassesPage } from '../pages/collegeAdmin/CollegeAdminClassesPage';
import { CollegeAdminAttendancePage } from '../pages/collegeAdmin/CollegeAdminAttendancePage';
import { AttendanceSettings } from '../pages/collegeAdmin/AttendanceSettings';

// Principal Pages
import { PrincipalDashboard } from '../pages/principal/PrincipalDashboard';
import { AdminsManagement } from '../pages/principal/AdminsManagement';
import { TeachersManagement } from '../pages/principal/TeachersManagement';
import { PrincipalAttendancePage } from '../pages/principal/PrincipalAttendancePage';

// Teacher Pages
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { StudentsManagement } from '../pages/teacher/StudentsManagement';
import { TeacherAttendancePage } from '../pages/teacher/TeacherAttendancePage';
import { TeacherTimetablePage } from '../pages/teacher/TeacherTimetablePage';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentCoursesPage } from '../pages/student/StudentCoursesPage';
import { StudentGradesPage } from '../pages/student/StudentGradesPage';

// Core Shared Dashboards
import { ResultsDashboardPage } from '../pages/dashboards/ResultsDashboardPage';
import { AttendanceDashboardPage } from '../pages/dashboards/AttendanceDashboardPage';
import { TodayClassesDashboardPage } from '../pages/dashboards/TodayClassesDashboardPage';

import { AdminStudentsPage } from '../pages/admin/AdminStudentsPage';
import { AdminQRManagementPage } from '../pages/admin/AdminQRManagementPage';
import { StudentQRPage } from '../pages/student/StudentQRPage';
import { UserManagementPage } from '../pages/users/UserManagementPage';
import { UnauthorizedPage } from '../pages/common/UnauthorizedPage';
import { NotFoundPage } from '../pages/common/NotFoundPage';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  const getRoleLandingPage = () => {
    if (!role) return '/login';
    try {
      return getDashboardForRole(role);
    } catch {
      return '/unauthorized';
    }
  };

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/programs" element={<HomePage />} />
      <Route path="/courses" element={<HomePage />} />
      <Route path="/about" element={<HomePage />} />
      <Route path="/resources" element={<HomePage />} />
      <Route path="/contact" element={<HomePage />} />
      <Route path="/faq" element={<HomePage />} />

      {/* Auth Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={getRoleLandingPage()} replace /> : <LoginPage />}
      />
      <Route
        path="/login.html"
        element={isAuthenticated ? <Navigate to={getRoleLandingPage()} replace /> : <LoginPage />}
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Generic Dashboard Redirect */}
      <Route
        path="/dashboard"
        element={<Navigate to={isAuthenticated ? getRoleLandingPage() : '/login'} replace />}
      />

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          {/* SYSTEM_ADMIN / SUPERADMIN / ADMIN Platform Exclusive Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'SUPERADMIN', 'ADMIN', 'system_admin']} />}>
            <Route path="/superadmin-dashboard" element={<SystemAdminDashboard />} />
            <Route path="/superadmin/dashboard" element={<SystemAdminDashboard />} />
            <Route path="/dashboard/superadmin" element={<SystemAdminDashboard />} />
            <Route path="/system-admin-dashboard.html" element={<SystemAdminDashboard />} />
            <Route path="/system-admin/dashboard" element={<SystemAdminDashboard />} />
            <Route path="/system-admin" element={<Navigate to="/superadmin/dashboard" replace />} />
            <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
            <Route path="/superadmin/users" element={<UserManagementPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/superadmin/college-admins" element={<CollegeAdminsPage />} />
            <Route path="/superadmin/principals" element={<PrincipalsManagement />} />
            <Route path="/admin/principals" element={<PrincipalsManagement />} />
            <Route path="/admin/tenants" element={<TenantsManagement />} />
            <Route path="/admin/attendance" element={<AdminStaffAttendancePage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/students" element={<AdminStudentsPage />} />
            <Route path="/admin/qr" element={<AdminQRManagementPage />} />
          </Route>

          {/* PRINCIPAL School-Scoped Routes */}
          <Route element={<ProtectedRoute allowedRoles={['PRINCIPAL', 'principal']} />}>
            <Route path="/principal/dashboard" element={<PrincipalDashboard />} />
            <Route path="/dashboard/principal" element={<PrincipalDashboard />} />
            <Route path="/principal-dashboard" element={<Navigate to="/principal/dashboard" replace />} />
            <Route path="/principal" element={<Navigate to="/principal/dashboard" replace />} />
            <Route path="/principal/users" element={<UserManagementPage />} />
            <Route path="/principal/admins" element={<AdminsManagement />} />
            <Route path="/principal/teachers" element={<TeachersManagement />} />
            <Route path="/principal/attendance" element={<PrincipalAttendancePage />} />
          </Route>

          {/* COLLEGE_ADMIN / SCHOOLADMIN School-Scoped Routes */}
          <Route element={<ProtectedRoute allowedRoles={['COLLEGE_ADMIN', 'SCHOOLADMIN', 'schooladmin', 'college_admin']} requireSchoolId />} >
            <Route path="/schooladmin/dashboard" element={<CollegeAdminDashboard />} />
            <Route path="/school-admin/dashboard" element={<CollegeAdminDashboard />} />
            <Route path="/dashboard/schooladmin" element={<CollegeAdminDashboard />} />
            <Route path="/dashboard/school-admin" element={<CollegeAdminDashboard />} />
            <Route path="/schooladmin-dashboard" element={<Navigate to="/schooladmin/dashboard" replace />} />
            <Route path="/college-admin-dashboard" element={<Navigate to="/schooladmin/dashboard" replace />} />
            <Route path="/college-admin-dashboard.html" element={<CollegeAdminDashboard />} />
            <Route path="/college-admin/dashboard" element={<CollegeAdminDashboard />} />
            <Route path="/schooladmin" element={<Navigate to="/schooladmin/dashboard" replace />} />
            <Route path="/school-admin" element={<Navigate to="/schooladmin/dashboard" replace />} />
            <Route path="/college-admin" element={<Navigate to="/schooladmin/dashboard" replace />} />
            <Route path="/schooladmin/users" element={<UserManagementPage />} />
            <Route path="/schooladmin/students" element={<AdminStudentsPage />} />
            <Route path="/schooladmin/qr" element={<AdminQRManagementPage />} />
            <Route path="/schooladmin/teachers" element={<CollegeAdminTeachersPage />} />
            <Route path="/college-admin/teachers" element={<CollegeAdminTeachersPage />} />
            <Route path="/schooladmin/timetables" element={<CollegeAdminTimetablesPage />} />
            <Route path="/college-admin/timetables" element={<CollegeAdminTimetablesPage />} />
            <Route path="/schooladmin/classes" element={<CollegeAdminClassesPage />} />
            <Route path="/college-admin/classes" element={<CollegeAdminClassesPage />} />
            <Route path="/schooladmin/attendance" element={<CollegeAdminAttendancePage />} />
            <Route path="/college-admin/attendance" element={<CollegeAdminAttendancePage />} />
            <Route path="/schooladmin/attendance-settings" element={<AttendanceSettings />} />
            <Route path="/college-admin/attendance-settings" element={<AttendanceSettings />} />
          </Route>

          {/* TEACHER Classroom-Scoped Routes */}
          <Route element={<ProtectedRoute allowedRoles={['TEACHER', 'teacher', 'faculty', 'STAFF', 'staff']} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher-dashboard" element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="/teacher/students" element={<AdminStudentsPage />} />
            <Route path="/teacher/attendance" element={<TeacherAttendancePage />} />
            <Route path="/teacher/timetable" element={<TeacherTimetablePage />} />
            <Route path="/staff/dashboard" element={<TeacherDashboard />} />
          </Route>

          {/* STUDENT Personal-Scoped Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'student', 'pupil', 'PARENT', 'parent']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student-dashboard" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/qr" element={<StudentQRPage />} />
            <Route path="/student/courses" element={<StudentCoursesPage />} />
            <Route path="/student/grades" element={<StudentGradesPage />} />
            <Route path="/parent/dashboard" element={<StudentDashboard />} />
          </Route>

          {/* Shared User Directory Page for Authorized Roles */}
          <Route element={<ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'COLLEGE_ADMIN', 'SUPERADMIN', 'PRINCIPAL', 'SCHOOLADMIN', 'ADMIN']} />}>
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/users/create" element={<UserManagementPage />} />
          </Route>

          {/* Shared Core Dashboards */}
          <Route element={<ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'COLLEGE_ADMIN', 'SUPERADMIN', 'PRINCIPAL', 'SCHOOLADMIN', 'TEACHER', 'STUDENT', 'ADMIN', 'PARENT', 'STAFF']} />}>
            <Route path="/dashboards/results" element={<ResultsDashboardPage />} />
            <Route path="/dashboards/attendance" element={<AttendanceDashboardPage />} />
            <Route path="/dashboards/classes" element={<TodayClassesDashboardPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
