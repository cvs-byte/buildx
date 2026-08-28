import type { Role } from '../types/auth.types';

/**
 * Returns array of unique roles that a user with userRole is authorized to create.
 * Hierarchical Rules:
 * - SYSTEM_ADMIN / SUPERADMIN / ADMIN: Can create COLLEGE_ADMIN, PRINCIPAL, TEACHER, STUDENT.
 * - PRINCIPAL: Can create COLLEGE_ADMIN, TEACHER, STUDENT. Cannot create Superadmin.
 * - COLLEGE_ADMIN / SCHOOLADMIN: Cannot create Superadmin or Principal. Can ONLY create TEACHER or STUDENT.
 * - TEACHER: Can ONLY create STUDENT.
 * - STUDENT: Can create NO ONE.
 */
export function getCreatableRoles(userRole?: string | null): Role[] {
  if (!userRole) return [];

  const normalized = userRole.toLowerCase().replace(/[_-]/g, '');

  if (
    normalized === 'systemadmin' ||
    normalized === 'superadmin' ||
    normalized === 'admin'
  ) {
    return ['COLLEGE_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT'];
  }

  if (normalized === 'principal' || normalized === 'dean') {
    return ['SCHOOLADMIN', 'TEACHER', 'STUDENT'];
  }

  if (
    normalized === 'collegeadmin' ||
    normalized === 'schooladmin' ||
    normalized === 'collegeadministrator' ||
    normalized === 'schooladministrator'
  ) {
    return ['TEACHER', 'STUDENT'];
  }

  if (normalized === 'teacher' || normalized === 'faculty') {
    return ['STUDENT'];
  }

  return [];
}

/**
 * Checks whether userRole has permission to create account with targetRole.
 */
export function canCreateRole(
  userRole?: string | null,
  targetRole?: string | null
): boolean {
  if (!userRole || !targetRole) return false;
  const creatable = getCreatableRoles(userRole);
  const targetNorm = targetRole.toUpperCase() as Role;
  const targetStr = targetRole.toLowerCase().replace(/[_-]/g, '');

  return creatable.some((r) => {
    const rNorm = r.toUpperCase();
    const rStr = r.toLowerCase().replace(/[_-]/g, '');
    return rNorm === targetNorm || rStr === targetStr;
  });
}
