import React, { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type { AuthUser, LoginCredentials, Role, AuthSession } from '../types/auth.types';
import { authApi } from '../api/auth.api';
import { storage } from '../utils/storage';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  role: Role | null;
  schoolId: string | null;
  schoolName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => storage.getUser<AuthUser>());
  const [token, setToken] = useState<string | null>(() => storage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const savedSession = storage.getSession();
      const savedToken = storage.getToken();

      if (savedToken || savedSession) {
        const effectiveToken = savedToken || savedSession?.token || null;
        const rawCachedUser: any = storage.getUser<AuthUser>() || savedSession?.user || null;
        const cachedSchoolId = rawCachedUser?.schoolId || rawCachedUser?.tenantId || rawCachedUser?.school_id || rawCachedUser?.tenant_id || null;
        const cachedSchoolName = rawCachedUser?.schoolName || rawCachedUser?.tenantName || rawCachedUser?.school_name || rawCachedUser?.tenant_name || null;

        const cachedUser: AuthUser | null = rawCachedUser
          ? {
              id: String(rawCachedUser.id || rawCachedUser.userId || ''),
              userId: String(rawCachedUser.userId || rawCachedUser.id || ''),
              email: rawCachedUser.email || '',
              name: rawCachedUser.name || `${rawCachedUser.firstName || ''} ${rawCachedUser.lastName || ''}`.trim() || 'User',
              firstName: rawCachedUser.firstName || 'User',
              lastName: rawCachedUser.lastName || '',
              role: rawCachedUser.role,
              schoolId: cachedSchoolId,
              schoolName: cachedSchoolName,
              tenantId: cachedSchoolId,
              tenantName: cachedSchoolName,
              status: rawCachedUser.status || 'ACTIVE',
              createdAt: rawCachedUser.createdAt || new Date().toISOString(),
            }
          : null;

        try {
          const profile = await authApi.getCurrentUser();
          const profileSchoolId = profile.schoolId || profile.tenantId || (profile as any).school_id || (profile as any).tenant_id || null;
          const profileSchoolName = profile.schoolName || profile.tenantName || (profile as any).school_name || (profile as any).tenant_name || null;

          const updatedProfile: AuthUser = {
            ...profile,
            userId: profile.userId || profile.id || '',
            schoolId: profileSchoolId,
            schoolName: profileSchoolName,
            tenantId: profileSchoolId,
            tenantName: profileSchoolName,
          };

          setUser(updatedProfile);
          setToken(effectiveToken);

          const updatedSession: AuthSession = {
            token: effectiveToken || '',
            user: {
              userId: updatedProfile.userId,
              id: updatedProfile.id,
              email: updatedProfile.email,
              name: updatedProfile.name || `${updatedProfile.firstName} ${updatedProfile.lastName}`.trim(),
              role: updatedProfile.role,
              schoolId: profileSchoolId,
              schoolName: profileSchoolName,
              tenantId: profileSchoolId,
              tenantName: profileSchoolName,
              firstName: updatedProfile.firstName,
              lastName: updatedProfile.lastName,
              status: updatedProfile.status,
              createdAt: updatedProfile.createdAt,
            },
          };
          storage.setSession(updatedSession);
        } catch {
          if (effectiveToken && cachedUser) {
            setUser(cachedUser);
            setToken(effectiveToken);
          } else {
            storage.clearSession();
            setUser(null);
            setToken(null);
          }
        }
      } else {
        storage.clearSession();
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    };

    initAuth();

    const handleUnauthorized = (e: any) => {
      storage.clearSession();
      setUser(null);
      setToken(null);
      setError(e?.detail?.message || 'Your session has expired. Please log in again.');
    };

    window.addEventListener('ag_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('ag_unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthUser> => {
    setIsLoading(true);
    setError(null);
    storage.clearSession();
    setUser(null);
    setToken(null);

    try {
      const response = await authApi.login(credentials);
      const userSchoolId = response.user.schoolId || response.user.tenantId || (response.user as any).school_id || (response.user as any).tenant_id || null;
      const userSchoolName = response.user.schoolName || response.user.tenantName || (response.user as any).school_name || (response.user as any).tenant_name || null;

      const updatedUser: AuthUser = {
        ...response.user,
        userId: response.user.userId || response.user.id || '',
        schoolId: userSchoolId,
        schoolName: userSchoolName,
        tenantId: userSchoolId,
        tenantName: userSchoolName,
      };

      setUser(updatedUser);
      setToken(response.token);

      const session: AuthSession = {
        token: response.token,
        user: {
          userId: updatedUser.userId,
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name || `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
          role: updatedUser.role,
          schoolId: userSchoolId,
          schoolName: userSchoolName,
          tenantId: userSchoolId,
          tenantName: userSchoolName,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          status: updatedUser.status,
          createdAt: updatedUser.createdAt,
        },
      };

      storage.setSession(session);
      setIsLoading(false);
      return updatedUser;
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password.';
      setError(msg);
      storage.clearSession();
      setUser(null);
      setToken(null);
      setIsLoading(false);
      throw new Error(msg);
    }
  };

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setToken(null);
      storage.clearSession();
      setIsLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  const schoolId = user?.schoolId || user?.tenantId || null;
  const schoolName = user?.schoolName || user?.tenantName || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        schoolId,
        schoolName,
        isAuthenticated: !!token && !!user,
        isLoading,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
