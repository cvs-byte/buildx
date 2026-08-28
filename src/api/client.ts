import { API_BASE_URL } from '../utils/constants';
import { storage } from '../utils/storage';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  timeoutMs?: number;
  skipAuth?: boolean;
}

export interface ApiClientResponse<T> {
  data: T;
  status: number;
  response: Response;
}

/**
 * Handle Unauthorized (401) clean teardown and redirect
 */
function handleUnauthorized(): void {
  storage.clearSession();
  window.dispatchEvent(
    new CustomEvent('ag_unauthorized', {
      detail: { message: 'Your session has expired. Please log in again.' },
    })
  );
  if (typeof window !== 'undefined') {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const loginPath = `${base}/login`;
    if (window.location.pathname !== loginPath && window.location.pathname !== '/login') {
      window.location.replace(loginPath);
    }
  }
}

/**
 * Safely parse HTTP response content (JSON, text, empty)
 */
async function parseResponseBody(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!text || text.trim() === '') {
    return null;
  }

  if (contentType.includes('application/json') || text.startsWith('{') || text.startsWith('[')) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

/**
 * Centralized low-level authenticatedFetch implementation
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestOptions = {}
): Promise<Response> {
  const { params, headers: customHeaders, timeoutMs = 30000, skipAuth = false, body, ...restConfig } = options;

  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${API_BASE_URL}${formattedEndpoint}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = storage.getToken();

  if (!skipAuth && (!token || token.trim() === '' || token === 'undefined' || token === 'null')) {
    throw new Error('AUTHENTICATION_REQUIRED');
  }

  const headers = new Headers(customHeaders || {});

  // For JSON payloads (when body is string or object), ensure Content-Type is set.
  // Do NOT set Content-Type if body is FormData (browser will calculate boundary).
  if (body && !(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  // Set Authorization: Bearer <TOKEN> for authenticated requests
  if (!skipAuth && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const method = (options.method || 'GET').toUpperCase();

  // Safe Debug Logging (Never log raw JWT or password)
  console.debug('[AUTH]', {
    hasToken: Boolean(token),
    hasAuthorizationHeader: !skipAuth && Boolean(token),
  });

  console.debug('[API REQUEST]', {
    method,
    endpoint: formattedEndpoint,
    authenticated: Boolean(token),
    hasAuthorization: !skipAuth && Boolean(token),
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  console.log('ATTENDANCE API URL:', url);

  try {
    const response = await fetch(url, {
      ...restConfig,
      method,
      headers,
      body,
      signal: controller.signal,
    });
    return response;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms.`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

class ApiClient {
  constructor(_baseUrl?: string) {}

  private async processResponse<T>(response: Response): Promise<T> {
    const data = await parseResponseBody(response);

    if (response.status === 401) {
      handleUnauthorized();
      const error: any = new Error(
        (typeof data === 'object' && data?.message) || 'Your session has expired. Please log in again.'
      );
      error.status = 401;
      error.data = data;
      throw error;
    }

    if (response.status === 403) {
      const error: any = new Error(
        (typeof data === 'object' && data?.message) || 'You do not have permission to perform this action.'
      );
      error.status = 403;
      error.data = data;
      throw error;
    }

    if (response.status === 400) {
      const error: any = new Error(
        (typeof data === 'object' && (data?.message || data?.error)) || 'Bad request'
      );
      error.status = 400;
      error.data = data;
      throw error;
    }

    if (response.status === 404) {
      const error: any = new Error(
        (typeof data === 'object' && (data?.message || data?.error)) || 'API endpoint not found'
      );
      error.status = 404;
      error.data = data;
      throw error;
    }

    if (response.status === 409) {
      const error: any = new Error(
        (typeof data === 'object' && (data?.message || data?.error)) || 'Attendance already recorded.'
      );
      error.status = 409;
      error.data = data;
      throw error;
    }

    if (response.status === 429) {
      const error: any = new Error(
        (typeof data === 'object' && (data?.message || data?.error)) || 'Too many requests. Please wait a moment and try again.'
      );
      error.status = 429;
      error.data = data;
      throw error;
    }

    if (response.status >= 500) {
      const error: any = new Error(
        (typeof data === 'object' && (data?.message || data?.error)) || 'Server error. Please try again later.'
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && (data?.message || data?.error)) ||
        `HTTP error! Status: ${response.status}`;
      const error: any = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as T;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    try {
      const response = await authenticatedFetch(endpoint, options);
      return await this.processResponse<T>(response);
    } catch (error) {
      console.debug('[API FETCH]', endpoint, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    const formattedBody =
      body !== undefined && !(body instanceof FormData) && typeof body !== 'string'
        ? JSON.stringify(body)
        : (body as BodyInit | undefined);

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formattedBody,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    const formattedBody =
      body !== undefined && !(body instanceof FormData) && typeof body !== 'string'
        ? JSON.stringify(body)
        : (body as BodyInit | undefined);

    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: formattedBody,
    });
  }

  async patch<T>(endpoint: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    const formattedBody =
      body !== undefined && !(body instanceof FormData) && typeof body !== 'string'
        ? JSON.stringify(body)
        : (body as BodyInit | undefined);

    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: formattedBody,
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
