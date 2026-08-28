import { STORAGE_KEYS } from './constants';
import type { AuthSession, Role } from '../types/auth.types';

const memoryStore: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (err) {
    console.warn('[STORAGE] Safe read fallback active:', err);
  }
  return memoryStore[key] ?? null;
}

function safeSetItem(key: string, value: string): void {
  memoryStore[key] = value;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (err) {
    console.warn('[STORAGE] Safe write fallback active:', err);
  }
}

function safeRemoveItem(key: string): void {
  delete memoryStore[key];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn('[STORAGE] Safe remove fallback active:', err);
  }
}

export const storage = {
  // Central Auth Session - Single Source of Truth
  getSession: (): AuthSession | null => {
    const raw = safeGetItem(STORAGE_KEYS.AUTH_SESSION);
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

    safeSetItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(cleanSession));
    if (cleanToken) {
      safeSetItem(STORAGE_KEYS.AUTH_TOKEN, cleanToken);
      safeSetItem('accessToken', cleanToken);
      safeSetItem('authToken', cleanToken);
      safeSetItem('token', cleanToken);
    }
    if (session.user) {
      safeSetItem(STORAGE_KEYS.USER_DATA, JSON.stringify(session.user));
      if (session.user.schoolId) {
        safeSetItem(STORAGE_KEYS.ACTIVE_TENANT, session.user.schoolId);
      }
    }
  },

  clearSession: (): void => {
    safeRemoveItem(STORAGE_KEYS.AUTH_SESSION);
    safeRemoveItem(STORAGE_KEYS.AUTH_TOKEN);
    safeRemoveItem(STORAGE_KEYS.REFRESH_TOKEN);
    safeRemoveItem(STORAGE_KEYS.USER_DATA);
    safeRemoveItem(STORAGE_KEYS.ACTIVE_TENANT);
    safeRemoveItem('token');
    safeRemoveItem('authToken');
    safeRemoveItem('accessToken');
    safeRemoveItem('jwt');
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
      const val = safeGetItem(key);
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
      safeSetItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    }
    safeSetItem(STORAGE_KEYS.AUTH_TOKEN, cleanToken);
    safeSetItem('accessToken', cleanToken);
    safeSetItem('token', cleanToken);
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
    return user?.schoolId || user?.tenantId || user?.school_id || user?.tenant_id || safeGetItem(STORAGE_KEYS.ACTIVE_TENANT) || null;
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
    const data = safeGetItem(STORAGE_KEYS.USER_DATA);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  },

  setUser: (user: unknown): void => {
    safeSetItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  getActiveTenant: (): string | null => {
    return storage.getSchoolId();
  },

  setActiveTenant: (tenantId: string): void => {
    safeSetItem(STORAGE_KEYS.ACTIVE_TENANT, tenantId);
  },

  clearAll: (): void => {
    storage.clearSession();
  },
};
