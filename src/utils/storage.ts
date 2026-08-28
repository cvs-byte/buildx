import { STORAGE_KEYS } from './constants';
import type { AuthSession, Role } from '../types/auth.types';

export const storage = {
  // Central Auth Session - Single Source of Truth
  getSession: (): AuthSession | null => {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed as AuthSession;
      return null;
    } catch {
      return null;
    }
  },

  setSession: (session: AuthSession): void => {
    if (!session) return;
    const token = session.token || (session as any).accessToken || (session as any).jwt || '';
    const cleanToken = typeof token === 'string' ? token.trim() : '';
    const cleanSession = { ...session, token: cleanToken };

    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(cleanSession));
    if (cleanToken) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, cleanToken);
      localStorage.setItem('accessToken', cleanToken);
      localStorage.setItem('authToken', cleanToken);
      localStorage.setItem('token', cleanToken);
    }
    if (session.user) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(session.user));
      if (session.user.schoolId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TENANT, session.user.schoolId);
      }
    }
  },

  clearSession: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TENANT);
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('jwt');
  },

  getToken: (): string | null => {
    const session = storage.getSession();
    const sessionToken = session?.token || (session as any)?.accessToken || (session as any)?.jwt;
    if (sessionToken && typeof sessionToken === 'string' && sessionToken.trim() !== '' && sessionToken !== 'undefined' && sessionToken !== 'null') {
      return sessionToken.trim();
    }
    const directKeys = [
      STORAGE_KEYS.AUTH_TOKEN,
      'accessToken',
      'authToken',
      'token',
      'jwt',
    ];
    for (const key of directKeys) {
      const val = localStorage.getItem(key);
      if (val && val.trim() !== '' && val !== 'undefined' && val !== 'null') {
        return val.trim();
      }
    }
    return null;
  },

  setToken: (token: string): void => {
    if (!token) return;
    const cleanToken = token.trim();
    const session = storage.getSession();
    if (session) {
      session.token = cleanToken;
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    }
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, cleanToken);
    localStorage.setItem('accessToken', cleanToken);
    localStorage.setItem('token', cleanToken);
  },

  getRole: (): Role | null => {
    const session = storage.getSession();
    if (session?.user?.role) return session.user.role;
    const user = storage.getUser<any>();
    return user?.role || null;
  },

  getSchoolId: (): string | null => {
    const session = storage.getSession();
    if (session?.user?.schoolId) return session.user.schoolId;
    const user = storage.getUser<any>();
    return user?.schoolId || user?.tenantId || user?.school_id || user?.tenant_id || localStorage.getItem(STORAGE_KEYS.ACTIVE_TENANT) || null;
  },

  getSchoolName: (): string | null => {
    const session = storage.getSession();
    if (session?.user?.schoolName) return session.user.schoolName;
    const user = storage.getUser<any>();
    return user?.schoolName || user?.tenantName || user?.school_name || user?.tenant_name || null;
  },

  getUser: <T>(): T | null => {
    const session = storage.getSession();
    if (session?.user) return session.user as unknown as T;
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  },

  setUser: (user: unknown): void => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  getActiveTenant: (): string | null => {
    return storage.getSchoolId();
  },

  setActiveTenant: (tenantId: string): void => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TENANT, tenantId);
  },

  clearAll: (): void => {
    storage.clearSession();
  },
};
