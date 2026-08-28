import type { Role, AuthResponse, AuthUser } from '../types/auth.types';

/**
 * Normalizes user role strings into recognized Role types.
 * Supports various backend naming conventions (e.g. systemadmin, college_admin, admin, etc.).
 */
export function normalizeRole(roleInput: any): Role {
  if (!roleInput) {
    throw new Error('Role is missing or undefined.');
  }

  const roleStr = String(roleInput).trim().toLowerCase().replace(/[_-]/g, '');

  switch (roleStr) {
    case 'systemadmin':
    case 'sysadmin':
    case 'superadmin':
    case 'admin':
    case 'platformadmin':
      return 'SYSTEM_ADMIN';
    case 'collegeadmin':
    case 'collegeadministrator':
    case 'schooladmin':
    case 'schooladministrator':
    case 'tenantadmin':
      return 'COLLEGE_ADMIN';
    case 'principal':
    case 'dean':
    case 'headmaster':
      return 'PRINCIPAL';
    case 'teacher':
    case 'faculty':
    case 'instructor':
    case 'prof':
    case 'professor':
      return 'TEACHER';
    case 'student':
    case 'pupil':
    case 'learner':
      return 'STUDENT';
    default: {
      const upper = String(roleInput).toUpperCase() as Role;
      if (['SYSTEM_ADMIN', 'COLLEGE_ADMIN', 'SUPERADMIN', 'PRINCIPAL', 'SCHOOLADMIN', 'TEACHER', 'STUDENT', 'ADMIN'].includes(upper)) {
        return upper;
      }
      throw new Error(`Role "${roleInput}" is not configured.`);
    }
  }
}

/**
 * Parses raw HTTP login responses into strongly-typed AuthResponse objects.
 */
export function parseAuthResponse(data: any): AuthResponse {
  if (!data) {
    throw new Error('Empty response received from authentication server.');
  }

  const res = data.data || data;

  const token =
    res.token ||
    res.accessToken ||
    res.access_token ||
    res.jwt ||
    data.token ||
    data.accessToken ||
    data.access_token;

  if (!token) {
    throw new Error('Authentication response did not contain a valid security token.');
  }

  const rawUser =
    res.user ||
    res.userData ||
    res.account ||
    (res.id || res.userId ? res : data.user || data);

  if (!rawUser) {
    throw new Error('Authentication response did not contain user details.');
  }

  const rawRole = rawUser.role || rawUser.userRole || rawUser.type || rawUser.roles?.[0];
  const role = normalizeRole(rawRole);

  const userId = String(rawUser.id || rawUser.userId || rawUser._id || rawUser.sub || '');
  const email = rawUser.email || rawUser.username || '';
  const name =
    rawUser.name ||
    `${rawUser.firstName || ''} ${rawUser.lastName || ''}`.trim() ||
    email ||
    'User';

  const nameParts = name.split(' ');
  const firstName = rawUser.firstName || nameParts[0] || 'User';
  const lastName = rawUser.lastName || nameParts.slice(1).join(' ') || '';

  const schoolId =
    rawUser.schoolId !== undefined && rawUser.schoolId !== null && String(rawUser.schoolId).trim() !== ''
      ? String(rawUser.schoolId)
      : rawUser.tenantId !== undefined && rawUser.tenantId !== null && String(rawUser.tenantId).trim() !== ''
      ? String(rawUser.tenantId)
      : rawUser.school_id !== undefined && rawUser.school_id !== null && String(rawUser.school_id).trim() !== ''
      ? String(rawUser.school_id)
      : rawUser.tenant_id !== undefined && rawUser.tenant_id !== null && String(rawUser.tenant_id).trim() !== ''
      ? String(rawUser.tenant_id)
      : null;

  const schoolName =
    rawUser.schoolName ||
    rawUser.tenantName ||
    rawUser.school_name ||
    rawUser.tenant_name ||
    rawUser.organizationName ||
    null;

  const user: AuthUser = {
    id: userId,
    userId,
    email,
    name,
    firstName,
    lastName,
    role,
    schoolId,
    schoolName,
    tenantId: schoolId,
    tenantName: schoolName,
    principalId: rawUser.principalId ? String(rawUser.principalId) : null,
    department: rawUser.department,
    rollNumber: rawUser.rollNumber,
    gradeLevel: rawUser.gradeLevel,
    avatarUrl: rawUser.avatarUrl,
    status: rawUser.status || 'ACTIVE',
    createdAt: rawUser.createdAt || new Date().toISOString(),
  };

  return {
    user,
    token,
    refreshToken: res.refreshToken || res.refresh_token || data.refreshToken,
    expiresIn: res.expiresIn || res.expires_in || data.expiresIn,
    success: true,
    message: data.message || 'Login successful',
  };
}
