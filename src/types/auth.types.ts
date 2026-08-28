export type Role =
  | 'SYSTEM_ADMIN'
  | 'COLLEGE_ADMIN'
  | 'SUPERADMIN'
  | 'PRINCIPAL'
  | 'SCHOOLADMIN'
  | 'TEACHER'
  | 'STUDENT'
  | 'ADMIN';

export interface AuthUser {
  id: string;
  userId: string;
  email: string;
  name?: string;
  firstName: string;
  lastName: string;
  role: Role;
  schoolId: string | null;
  schoolName: string | null;
  principalId?: string | null;
  tenantId?: string | null;
  tenantName?: string | null;
  department?: string;
  rollNumber?: string;
  gradeLevel?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: {
    userId: string;
    id?: string;
    email: string;
    name: string;
    role: Role;
    schoolId: string | null;
    schoolName: string | null;
    tenantId?: string | null;
    tenantName?: string | null;
    firstName?: string;
    lastName?: string;
    status?: string;
    createdAt?: string;
  };
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password?: string;
  passwordHash?: string;
  tenantCode?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  success?: boolean;
  message?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
