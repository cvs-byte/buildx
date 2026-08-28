import { apiClient } from './client';
import { storage } from '../utils/storage';
import { cleanUserPayload } from '../utils/payload.utils';
import type {
  User,
  CreateUserPayload,
  CreateAdminDTO,
  CreatePrincipalDTO,
  CreateTeacherDTO,
  CreateStudentDTO,
  UpdateUserDTO,
} from '../types/user.types';

/**
 * Normalizes raw API response objects into clean User entities.
 * Excludes passwordHash.
 */
function normalizeUser(raw: any): User {
  const userId = String(raw.userId || raw.id || raw._id || '');
  const name =
    raw.name ||
    raw.fullName ||
    `${raw.firstName || ''} ${raw.lastName || ''}`.trim() ||
    raw.email ||
    'User';
  const nameParts = name.split(' ');
  const firstName = raw.firstName || nameParts[0] || 'User';
  const lastName = raw.lastName || nameParts.slice(1).join(' ') || '';
  const schoolId = raw.schoolId || raw.tenantId || raw.school_id || raw.tenant_id || null;
  const schoolName = raw.schoolName || raw.tenantName || raw.school_name || raw.tenant_name || raw.organizationName || null;

  return {
    userId,
    id: userId,
    name,
    firstName,
    lastName,
    email: raw.email || '',
    phone: raw.phone || raw.phoneNumber || '',
    role: raw.role || 'STUDENT',
    schoolId,
    tenantId: schoolId,
    schoolName,
    tenantName: schoolName,
    principalId: raw.principalId || null,
    classIds: Array.isArray(raw.classIds) ? raw.classIds : [],
    status: raw.status || 'ACTIVE',
    createdAt: raw.createdAt || new Date().toISOString(),
    createdBy: raw.createdBy,
    updatedAt: raw.updatedAt,
    lastLoginAt: raw.lastLoginAt || null,
    avatarUrl: raw.avatarUrl,
    department: raw.department,
    subjectSpecialization: raw.subjectSpecialization,
    employeeId: raw.employeeId,
    rollNumber: raw.rollNumber,
    gradeLevel: raw.gradeLevel,
    section: raw.section,
    parentContact: raw.parentContact,
  };
}

/**
 * Multi-School User Management API Service
 * Endpoint: https://api.academygrowth.in/Users
 */
export const userApi = {
  /**
   * Fetch all users across all institutions (SUPERADMIN ONLY)
   * Endpoint: GET /Users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      let response: any;
      try {
        response = await apiClient.get<any>('/Users');
      } catch (err: any) {
        if (err?.status === 404) {
          response = await apiClient.get<any>('/users');
        } else {
          throw err;
        }
      }
      const rawList = Array.isArray(response)
        ? response
        : response.data || response.users || [];
      return rawList.map(normalizeUser);
    } catch (err: any) {
      if (err.status === 403) {
        throw new Error('You do not have permission to view all users.');
      }
      if (err.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(err.message || 'Unable to load users. Please try again.');
    }
  },

  /**
  /**
   * Fetch users belonging to a specific school and class (PRINCIPAL / SCHOOLADMIN / TEACHER)
   * Endpoint: GET /Users?schoolId=<schoolId>&classId=<classId>&sectionId=<sectionId>
   */
  async getUsersBySchool(schoolId: string, classId?: string, sectionId?: string): Promise<User[]> {
    try {
      const params = new URLSearchParams();
      if (schoolId) params.append('schoolId', schoolId);
      if (classId) params.append('classId', classId);
      if (sectionId) params.append('sectionId', sectionId);

      const queryString = params.toString();
      const endpoint = queryString ? `/Users?${queryString}` : '/Users';
      const fallbackEndpoint = queryString ? `/users?${queryString}` : '/users';

      let response: any;
      try {
        response = await apiClient.get<any>(endpoint);
      } catch (err: any) {
        if (err?.status === 404) {
          response = await apiClient.get<any>(fallbackEndpoint);
        } else {
          throw err;
        }
      }
      const rawList = Array.isArray(response)
        ? response
        : response.data || response.users || [];
      return rawList.map(normalizeUser);
    } catch (err: any) {
      if (err.status === 403) {
        throw new Error('You do not have permission to view users for this school.');
      }
      if (err.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(err.message || 'Unable to load users. Please try again.');
    }
  },

  /**
   * Create a new User via HTTPS POST /Users
   * Endpoint: POST /Users
   */
  async createUser(payload: CreateUserPayload): Promise<User> {
    const sessionUser: any = storage.getSession()?.user;
    const isSuperAdmin =
      sessionUser?.role === 'SUPERADMIN' ||
      sessionUser?.role === 'SYSTEM_ADMIN' ||
      sessionUser?.role === 'ADMIN';

    const effectiveSchoolId =
      (!isSuperAdmin && (sessionUser?.schoolId || sessionUser?.tenantId || sessionUser?.school_id || sessionUser?.tenant_id)) ||
      payload.schoolId ||
      payload.tenantId ||
      sessionUser?.schoolId ||
      sessionUser?.tenantId;

    const effectiveSchoolName =
      (!isSuperAdmin && (sessionUser?.schoolName || sessionUser?.tenantName || sessionUser?.school_name || sessionUser?.tenant_name)) ||
      payload.schoolName ||
      payload.tenantName ||
      sessionUser?.schoolName ||
      sessionUser?.tenantName;

    const rawBody: Record<string, any> = {
      name: payload.name || payload.fullName,
      fullName: payload.fullName || payload.name,
      email: payload.email,
      phone: payload.phone || payload.phoneNumber,
      phoneNumber: payload.phoneNumber || payload.phone,
      password: payload.password,
      role: payload.role,
      status: payload.status || 'ACTIVE',
      schoolId: effectiveSchoolId,
      tenantId: effectiveSchoolId,
      school_id: effectiveSchoolId,
      tenant_id: effectiveSchoolId,
      schoolName: effectiveSchoolName,
      tenantName: effectiveSchoolName,
      school_name: effectiveSchoolName,
      tenant_name: effectiveSchoolName,
      principalId: payload.principalId || sessionUser?.principalId,
      createdBy: payload.createdBy || sessionUser?.role?.toLowerCase(),
      createdByEmail: payload.createdByEmail || sessionUser?.email,
      createdByUserId: payload.createdByUserId || sessionUser?.userId || sessionUser?.id,
      classIds: payload.classIds,
    };

    const body = cleanUserPayload(rawBody, sessionUser);

    const token = storage.getToken();
    console.debug('[AUTH CHECK]', {
      authenticated: Boolean(storage.getSession()),
      hasToken: Boolean(token),
      role: storage.getSession()?.user?.role,
    });
    console.debug('[CREATE USER]', {
      method: 'POST',
      endpoint: 'https://api.academygrowth.in/Users',
      authenticated: Boolean(token),
      schoolIdSent: body.schoolId,
    });

    try {
      let response: any;
      try {
        response = await apiClient.post<any>('/Users', body);
      } catch (err: any) {
        if (err?.status === 404) {
          response = await apiClient.post<any>('/users', body);
        } else {
          throw err;
        }
      }
      const rawUser = response.user || response.data || response;
      return normalizeUser(rawUser);
    } catch (err: any) {
      if (err?.message === 'AUTHENTICATION_REQUIRED') {
        throw new Error('Your authentication session is unavailable. Please log in again.');
      }
      if (err?.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }
      if (err?.status === 403) {
        throw new Error('You do not have permission to create users.');
      }
      if (err?.status === 409) {
        throw new Error('User already exists.');
      }
      if (err?.status === 400) {
        throw new Error(err.data?.message || err.data?.error || err.message || 'Invalid user information.');
      }
      if (err?.status === 500) {
        throw new Error('Unable to create user.');
      }
      if (
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('NetworkError') ||
        err?.message?.includes('timed out') ||
        err?.name === 'TypeError'
      ) {
        throw new Error('Unable to connect to the API.');
      }
      throw new Error(err.data?.message || err.data?.error || err.message || 'Unable to create user.');
    }
  },

  // Legacy helper bindings for backward compatibility
  async getAdmins(tenantId?: string): Promise<User[]> {
    const all = tenantId ? await this.getUsersBySchool(tenantId) : await this.getAllUsers();
    return all.filter((u) => u.role === 'SCHOOLADMIN' || u.role === 'ADMIN');
  },

  async createAdmin(dto: CreateAdminDTO): Promise<User> {
    return this.createUser({
      name: `${dto.firstName} ${dto.lastName}`.trim(),
      email: dto.email,
      phone: dto.phone,
      password: dto.password || '',
      role: 'SCHOOLADMIN',
      schoolId: dto.tenantId,
      status: 'ACTIVE',
    });
  },

  async getPrincipals(tenantId?: string): Promise<User[]> {
    const all = tenantId ? await this.getUsersBySchool(tenantId) : await this.getAllUsers();
    return all.filter((u) => u.role === 'PRINCIPAL');
  },

  async createPrincipal(dto: CreatePrincipalDTO): Promise<User> {
    return this.createUser({
      name: `${dto.firstName} ${dto.lastName}`.trim(),
      email: dto.email,
      phone: dto.phone,
      password: dto.password || '',
      role: 'PRINCIPAL',
      schoolId: dto.tenantId,
      status: 'ACTIVE',
    });
  },

  async getTeachers(tenantId?: string): Promise<User[]> {
    const all = tenantId ? await this.getUsersBySchool(tenantId) : await this.getAllUsers();
    return all.filter((u) => u.role === 'TEACHER');
  },

  async createTeacher(dto: CreateTeacherDTO): Promise<User> {
    return this.createUser({
      name: `${dto.firstName} ${dto.lastName}`.trim(),
      email: dto.email,
      phone: dto.phone,
      password: dto.password || '',
      role: 'TEACHER',
      schoolId: dto.tenantId,
      status: 'ACTIVE',
    });
  },

  async getStudents(tenantId?: string): Promise<User[]> {
    const all = tenantId ? await this.getUsersBySchool(tenantId) : await this.getAllUsers();
    return all.filter((u) => u.role === 'STUDENT');
  },

  async createStudent(dto: CreateStudentDTO): Promise<User> {
    return this.createUser({
      name: `${dto.firstName} ${dto.lastName}`.trim(),
      email: dto.email,
      phone: dto.phone,
      password: dto.password || '',
      role: 'STUDENT',
      schoolId: dto.tenantId,
      status: 'ACTIVE',
    });
  },

  async updateUser(id: string, dto: UpdateUserDTO): Promise<User> {
    let response: any;
    try {
      response = await apiClient.put<any>(`/Users/${id}`, dto);
    } catch (err: any) {
      if (err?.status === 404) {
        response = await apiClient.put<any>(`/users/${id}`, dto);
      } else {
        throw err;
      }
    }
    return normalizeUser(response.user || response.data || response);
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`/Users/${id}`);
    } catch (err: any) {
      if (err?.status === 404) {
        await apiClient.delete(`/users/${id}`);
      } else {
        throw err;
      }
    }
  },
};
