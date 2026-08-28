export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://api.academygrowth.in').replace(/\/+$/, '');
export const ATTENDANCE_API_BASE_URL = (import.meta.env.VITE_ATTENDANCE_API_BASE_URL || API_BASE_URL).replace(/\/+$/, '');

export const STORAGE_KEYS = {
  AUTH_SESSION: 'authSession',
  AUTH_TOKEN: 'ag_auth_token',
  REFRESH_TOKEN: 'ag_refresh_token',
  USER_DATA: 'ag_user_data',
  ACTIVE_TENANT: 'ag_active_tenant',
} as const;

export const ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  COLLEGE_ADMIN: 'COLLEGE_ADMIN',
  SUPERADMIN: 'SYSTEM_ADMIN',
  SCHOOLADMIN: 'COLLEGE_ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  ADMIN: 'SYSTEM_ADMIN',
} as const;

export const ROLE_LABELS = {
  SYSTEM_ADMIN: 'System Admin',
  COLLEGE_ADMIN: 'College Admin',
  SUPERADMIN: 'System Admin',
  SCHOOLADMIN: 'College Admin',
  PRINCIPAL: 'Principal / Dean',
  TEACHER: 'Teacher / Faculty',
  STUDENT: 'Student',
  ADMIN: 'System Admin',
} as const;

export const ROLE_DASHBOARDS: Record<string, string> = {
  admin: '/superadmin/dashboard',
  superadmin: '/superadmin/dashboard',
  system_admin: '/superadmin/dashboard',
  systemadmin: '/superadmin/dashboard',
  sysadmin: '/superadmin/dashboard',
  college_admin: '/schooladmin/dashboard',
  collegeadmin: '/schooladmin/dashboard',
  schooladmin: '/schooladmin/dashboard',
  school_admin: '/schooladmin/dashboard',
  principal: '/principal/dashboard',
  dean: '/principal/dashboard',
  teacher: '/teacher/dashboard',
  faculty: '/teacher/dashboard',
  student: '/student/dashboard',
  pupil: '/student/dashboard',
  parent: '/parent/dashboard',
  staff: '/staff/dashboard',

  // Uppercase variations
  ADMIN: '/superadmin/dashboard',
  SUPERADMIN: '/superadmin/dashboard',
  SYSTEM_ADMIN: '/superadmin/dashboard',
  COLLEGE_ADMIN: '/schooladmin/dashboard',
  SCHOOLADMIN: '/schooladmin/dashboard',
  PRINCIPAL: '/principal/dashboard',
  TEACHER: '/teacher/dashboard',
  STUDENT: '/student/dashboard',
  PARENT: '/parent/dashboard',
  STAFF: '/staff/dashboard',
};

export function getDashboardForRole(role: string): string {
  if (!role) {
    throw new Error('Role is missing or undefined.');
  }

  const normalizedRole = role.toLowerCase().trim().replace(/[_-]/g, '');

  const dashboard =
    ROLE_DASHBOARDS[role] ||
    ROLE_DASHBOARDS[role.toLowerCase()] ||
    ROLE_DASHBOARDS[normalizedRole];

  if (!dashboard) {
    throw new Error(`Unsupported account role: "${role}". Please contact your administrator.`);
  }

  return dashboard;
}

export const ROLE_ROUTES: Record<string, string> = ROLE_DASHBOARDS;

export const ROLE_HIERARCHY = {
  SYSTEM_ADMIN: ['COLLEGE_ADMIN', 'SCHOOLADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT'],
  COLLEGE_ADMIN: ['PRINCIPAL', 'TEACHER', 'STUDENT'],
  SUPERADMIN: ['COLLEGE_ADMIN', 'SCHOOLADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT'],
  SCHOOLADMIN: ['PRINCIPAL', 'TEACHER', 'STUDENT'],
  PRINCIPAL: ['SCHOOLADMIN', 'TEACHER', 'STUDENT'],
  TEACHER: ['STUDENT'],
  STUDENT: [],
  ADMIN: ['COLLEGE_ADMIN', 'SCHOOLADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT'],
} as const;
