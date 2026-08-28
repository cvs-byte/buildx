const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function getOidcAccessToken(): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const oidcKeyPrefix = 'oidc.user:';
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(oidcKeyPrefix)) {
        const itemStr = window.localStorage.getItem(key);
        if (itemStr) {
          const parsed = JSON.parse(itemStr);
          if (parsed && parsed.access_token) {
            return parsed.access_token;
          }
        }
      }
    }
  } catch {
    // Ignore storage & parsing errors
  }
  return null;
}

export const apiClient = {
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getOidcAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Request failed with status ${response.status}`);
    }

    return response.json();
  },

  async post<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<T> {
    const token = getOidcAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Request failed with status ${response.status}`);
    }

    return response.json();
  },

  async put<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<T> {
    const token = getOidcAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Request failed with status ${response.status}`);
    }

    return response.json();
  },

  async patch<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<T> {
    const token = getOidcAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'PATCH',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Request failed with status ${response.status}`);
    }

    return response.json();
  },

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getOidcAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Request failed with status ${response.status}`);
    }

    return response.json();
  }
};
