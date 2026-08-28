import type { Role } from './auth.types';

/**
 * DynamoDB-Aligned User Entity (Excludes passwordHash)
 */
export interface User {
  userId: string;
  id: string; // Alias for userId
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: Role;
  schoolId?: string | null;
  tenantId?: string | null; // Alias for schoolId
  schoolName?: string;
  tenantName?: string;
  principalId?: string | null;
  classIds?: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt: string;
  createdBy?: string;
  createdByEmail?: string;
  createdByUserId?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  avatarUrl?: string;

  // Role-specific optional fields
  adminType?: string;
  qualification?: string;
  joiningDate?: string;
  department?: string;
  subjectSpecialization?: string;
  employeeId?: string;
  rollNumber?: string;
  gradeLevel?: string;
  section?: string;
  parentContact?: string;
}

/**
 * Payload sent to POST /Users
 */
export interface CreateUserPayload {
  name: string;
  fullName?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  password: string;
  role: Role;
  schoolName?: string;
  schoolId?: string;
  tenantName?: string;
  tenantId?: string;
  principalId?: string | null;
  createdBy?: string;
  createdByEmail?: string;
  createdByUserId?: string;
  classIds?: string[];
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CreateAdminDTO {
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  adminType?: string;
}

export interface CreatePrincipalDTO {
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  qualification?: string;
  joiningDate?: string;
}

export interface CreateTeacherDTO {
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  department?: string;
  subjectSpecialization?: string;
  employeeId?: string;
}

export interface CreateStudentDTO {
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  rollNumber?: string;
  gradeLevel?: string;
  section?: string;
  parentContact?: string;
}

export type CreateUserDTO = CreateAdminDTO | CreatePrincipalDTO | CreateTeacherDTO | CreateStudentDTO;

export interface UpdateUserDTO {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  schoolId?: string;
  principalId?: string;
  classIds?: string[];
}
