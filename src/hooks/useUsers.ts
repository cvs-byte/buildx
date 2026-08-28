import { useState, useEffect, useCallback } from 'react';
import type {
  User,
  CreateUserPayload,
  CreateAdminDTO,
  CreatePrincipalDTO,
  CreateTeacherDTO,
  CreateStudentDTO,
} from '../types/user.types';
import { userApi } from '../api/user.api';
import type { Role } from '../types/auth.types';
import { useToast } from './useToast';
import { useAuth } from './useAuth';

export interface UseUsersOptions {
  roleFilter?: Role;
  schoolId?: string;
  isGlobal?: boolean;
}

export const useUsers = (
  roleFilterOrOptions?: Role | UseUsersOptions,
  tenantIdParam?: string
) => {
  const { user: currentUser, isAuthenticated, isLoading: isAuthLoading, token } = useAuth();
  let options: UseUsersOptions = {};
  if (typeof roleFilterOrOptions === 'string') {
    options = { roleFilter: roleFilterOrOptions, schoolId: tenantIdParam };
  } else if (roleFilterOrOptions) {
    options = roleFilterOrOptions;
  }

  const { roleFilter, schoolId, isGlobal } = options;

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchUsers = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const userRole = String(currentUser?.role || '').toUpperCase();
      const isSuperAdmin = userRole === 'SUPERADMIN' || userRole === 'SYSTEM_ADMIN' || userRole === 'ADMIN';
      const targetSchoolId = schoolId || currentUser?.schoolId || currentUser?.tenantId;

      let data: User[] = [];
      if (isSuperAdmin && (isGlobal || !targetSchoolId)) {
        data = await userApi.getAllUsers();
      } else if (targetSchoolId) {
        data = await userApi.getUsersBySchool(targetSchoolId);
      } else {
        data = await userApi.getAllUsers();
      }

      // Organization Scoping for non-Superadmins
      if (!isSuperAdmin && targetSchoolId) {
        data = data.filter(
          (u) => u.schoolId === targetSchoolId || u.tenantId === targetSchoolId
        );
      }

      if (roleFilter) {
        data = data.filter((u) => {
          if (roleFilter === 'ADMIN' || roleFilter === 'SCHOOLADMIN') {
            return u.role === 'SCHOOLADMIN' || u.role === 'ADMIN';
          }
          return u.role === roleFilter;
        });
      }

      setUsers(data);
    } catch (err: any) {
      const msg = err.message || 'Unable to load users. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, roleFilter, schoolId, isGlobal, currentUser]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (!isAuthenticated || !token) {
      setUsers([]);
      setIsLoading(false);
      return;
    }
    fetchUsers();
  }, [isAuthLoading, isAuthenticated, token, fetchUsers]);

  const createUser = async (payload: CreateUserPayload): Promise<User> => {
    try {
      const newUser = await userApi.createUser(payload);
      showToast('success', 'User created successfully.');
      await fetchUsers();
      return newUser;
    } catch (err: any) {
      const msg = err.message || 'Failed to create user.';
      showToast('error', msg);
      throw err;
    }
  };

  const createAdmin = async (dto: CreateAdminDTO): Promise<User> => {
    return createUser({
      name: `${dto.firstName} ${dto.lastName}`.trim(),
      email: dto.email,
      phone: dto.phone,
      password: dto.password || '',
      role: 'SCHOOLADMIN',
      schoolId: dto.tenantId,
      status: 'ACTIVE',
    });
  };

  const createPrincipal = async (dto: CreatePrincipalDTO): Promise<User> => {
    return createUser({
      name: `${dto.firstName} ${dto.lastName}`.trim(),
      email: dto.email,
      phone: dto.phone,
      password: dto.password || '',
      role: 'PRINCIPAL',
      schoolId: dto.tenantId,
      status: 'ACTIVE',
    });
  };

  const createTeacher = async (dto: CreateTeacherDTO): Promise<User> => {
    return createUser({
      name: `${dto.firstName} ${dto.lastName}`.trim(),
      email: dto.email,
      phone: dto.phone,
      password: dto.password || '',
      role: 'TEACHER',
      schoolId: dto.tenantId,
      status: 'ACTIVE',
    });
  };

  const createStudent = async (dto: CreateStudentDTO): Promise<User> => {
    return createUser({
      name: `${dto.firstName} ${dto.lastName}`.trim(),
      email: dto.email,
      phone: dto.phone,
      password: dto.password || '',
      role: 'STUDENT',
      schoolId: dto.tenantId,
      status: 'ACTIVE',
    });
  };

  const deleteUser = async (id: string) => {
    try {
      await userApi.deleteUser(id);
      showToast('success', 'User removed successfully.');
      await fetchUsers();
    } catch (err: any) {
      const msg = err.message || 'Failed to remove user.';
      showToast('error', msg);
      throw err;
    }
  };

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    createUser,
    createAdmin,
    createPrincipal,
    createTeacher,
    createStudent,
    deleteUser,
  };
};
