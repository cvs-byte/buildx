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
export function normalizeUser(raw: any): User {
  if (!raw || typeof raw !== 'object') {
    return {
      userId: '',
      id: '',
      name: 'User',
      firstName: 'User',
      lastName: '',
      email: '',
      role: 'STUDENT',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
  }

  const userId = String(raw.userId || raw.id || raw._id || raw.studentId || raw.student_id || raw.user_id || '').trim();
  const rawEmail = String(raw.email || raw.userEmail || raw.studentEmail || raw.emailAddress || '').trim();

  const name =
    raw.name ||
    raw.fullName ||
    raw.studentName ||
    `${raw.firstName || ''} ${raw.lastName || ''}`.trim() ||
    rawEmail ||
    'Student User';

  const nameParts = name.split(' ');
  const firstName = raw.firstName || nameParts[0] || 'User';
  const lastName = raw.lastName || nameParts.slice(1).join(' ') || '';
  const schoolId = raw.schoolId || raw.tenantId || raw.school_id || raw.tenant_id || null;
  const schoolName = raw.schoolName || raw.tenantName || raw.school_name || raw.tenant_name || raw.organizationName || null;

  return {
    userId: userId || rawEmail,
    id: userId || rawEmail,
    name,
    firstName,
    lastName,
    email: rawEmail,
    phone: raw.phone || raw.phoneNumber || '',
    role: raw.role || 'STUDENT',
    schoolId,
    tenantId: schoolId,
    schoolName,
    tenantName: schoolName,
    principalId: raw.principalId || null,
    classIds: Array.isArray(raw.classIds) ? raw.classIds : (raw.classId ? [raw.classId] : []),
    status: raw.status || 'ACTIVE',
    createdAt: raw.createdAt || new Date().toISOString(),
    createdBy: raw.createdBy,
    updatedAt: raw.updatedAt,
    lastLoginAt: raw.lastLoginAt || null,
    avatarUrl: raw.avatarUrl,
    department: raw.department || raw.section || '',
    subjectSpecialization: raw.subjectSpecialization,
    employeeId: raw.employeeId,
    rollNumber: raw.rollNumber,
    gradeLevel: raw.gradeLevel || raw.className || (Array.isArray(raw.classIds) ? raw.classIds[0] : ''),
    section: raw.section || raw.department || '',
    parentContact: raw.parentContact,
  };
}

/**
 * Parses any shape of Users API response safely into User[] array.
 */
function extractUsersFromResponse(response: any): User[] {
  if (!response) return [];

  let rawList: any[] = [];

  if (Array.isArray(response)) {
    rawList = response;
  } else if (typeof response === 'object') {
    if (Array.isArray(response.data)) {
      rawList = response.data;
    } else if (Array.isArray(response.users)) {
      rawList = response.users;
    } else if (Array.isArray(response.items)) {
      rawList = response.items;
    } else if (Array.isArray(response.result)) {
      rawList = response.result;
    } else if (response.user) {
      rawList = [response.user];
    } else if (response.body && typeof response.body === 'string') {
      try {
        const parsed = JSON.parse(response.body);
        return extractUsersFromResponse(parsed);
      } catch {
        rawList = [];
      }
    }
  }

  return rawList.map(normalizeUser).filter((u) => u.userId || u.email);
}

// In-memory cache for user lookups during attendance scanning
let cachedUsers: { data: User[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 30000; // 30 seconds

/**
 * Multi-School User Management API Service
 * Primary Endpoint: https://api.academygrowth.in/Users
 */
export const userApi = {
  /**
   * Fetch all users across all institutions (or active school)
   * Endpoint: GET /Users
   */
  async getAllUsers(forceRefresh = false): Promise<User[]> {
    const now = Date.now();
    if (!forceRefresh && cachedUsers && now - cachedUsers.timestamp < CACHE_TTL_MS) {
      return cachedUsers.data;
    }

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

      const users = extractUsersFromResponse(response);
      cachedUsers = { data: users, timestamp: now };
      return users;
    } catch (err: any) {
      if (err.status === 403) {
        // Fallback: try querying users for the active tenant
        const activeTenantId = storage.getSchoolId();
        if (activeTenantId) {
          return this.getUsersBySchool(activeTenantId);
        }
        throw new Error('You do not have permission to view all users.');
      }
      if (err.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(err.message || 'Unable to load users. Please try again.');
    }
  },

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

      return extractUsersFromResponse(response);
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
   * Centralized Email -> User Lookup function.
   * Fetches users from GET /Users, reads response safely,
   * matches email case-insensitively, and returns the real User object.
   */
  async findUserByEmail(email: string): Promise<User | null> {
    if (!email || typeof email !== 'string') {
      return null;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return null;
    }

    console.log('[USER LOOKUP BY EMAIL] Searching for:', cleanEmail);

    let users: User[] = [];
    try {
      users = await this.getAllUsers();
    } catch (err) {
      console.warn('[USER LOOKUP] getAllUsers failed, attempting fallback...', err);
      const tenantId = storage.getSchoolId();
      if (tenantId) {
        try {
          users = await this.getUsersBySchool(tenantId);
        } catch {
          users = [];
        }
      }
    }

    // First attempt: match in currently loaded users
    let matched = users.find((u) => {
      const userEmail = String(u.email || '').trim().toLowerCase();
      return userEmail === cleanEmail;
    });

    // If not found in cache, force fresh refresh from server
    if (!matched && cachedUsers) {
      console.log('[USER LOOKUP] User not in cache, forcing fresh /Users fetch...');
      try {
        users = await this.getAllUsers(true);
        matched = users.find((u) => {
          const userEmail = String(u.email || '').trim().toLowerCase();
          return userEmail === cleanEmail;
        });
      } catch (err) {
        console.warn('[USER LOOKUP FRESH FETCH ERROR]', err);
      }
    }

    // Secondary fallback: check userId or rollNumber if identical to the search query
    if (!matched) {
      matched = users.find((u) => {
        const uid = String(u.userId || u.id || '').trim().toLowerCase();
        const roll = String(u.rollNumber || '').trim().toLowerCase();
        return uid === cleanEmail || roll === cleanEmail;
      });
    }

    if (matched) {
      console.log('[USER LOOKUP MATCH FOUND]', {
        userId: matched.userId,
        name: matched.name,
        email: matched.email,
        class: matched.classIds || matched.gradeLevel,
        section: matched.section,
      });
    } else {
      console.warn('[USER LOOKUP NOT FOUND] No user matches email:', cleanEmail);
    }

    return matched || null;
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
      // Invalidate user cache on creation
      cachedUsers = null;
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
    cachedUsers = null;
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
    cachedUsers = null;
  },
};

export const findUserByEmail = userApi.findUserByEmail.bind(userApi);
