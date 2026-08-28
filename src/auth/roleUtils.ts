import { UserRole } from '../types';

export const getUserRole = (profile: any): UserRole | null => {
  if (!profile) return null;

  const customRole = profile['custom:role'] as string;
  const groups = profile['cognito:groups'] as string[];

  if (customRole && ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT'].includes(customRole.toUpperCase())) {
    return customRole.toUpperCase() as UserRole;
  }

  if (Array.isArray(groups) && groups.length > 0) {
    const topGroup = groups[0].toUpperCase();
    if (['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT'].includes(topGroup)) {
      return topGroup as UserRole;
    }
  }

  return null;
};

export const getDashboardPath = (role: UserRole | null | undefined): string => {
  if (!role) return '/unauthorized';

  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'TEACHER':
      return '/teacher/dashboard';
    case 'STUDENT':
      return '/student/dashboard';
    case 'PARENT':
      return '/parent/dashboard';
    case 'ACCOUNTANT':
      return '/accountant/dashboard';
    case 'SUPER_ADMIN':
      return '/super-admin/dashboard';
    default:
      return '/unauthorized';
  }
};
