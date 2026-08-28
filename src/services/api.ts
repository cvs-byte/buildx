/**
 * Enterprise API Client for AWS API Gateway + Cognito JWT Authorizer backend.
 * Automatically attaches `Authorization: Bearer <access_token>` without exposing tokens in UI or logs.
 */

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function fetchWithAuth(
  endpoint: string,
  accessToken?: string | null,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorObj: ApiError = {
        status: response.status,
        message: getErrorMessageForStatus(response.status)
      };
      
      try {
        const body = await response.json();
        if (body && body.message) errorObj.message = body.message;
      } catch {
        // Response body not JSON
      }

      throw errorObj;
    }

    // Handle 204 No Content
    if (response.status === 204) return null;

    return await response.json();
  } catch (err: any) {
    if (err.status) throw err;
    
    // Return empty fallback array or object if offline / endpoint unreached during local dev
    return null;
  }
}

function getErrorMessageForStatus(status: number): string {
  switch (status) {
    case 401:
      return 'Session expired or unauthorized. Please sign in again via AWS Cognito.';
    case 403:
      return 'Permission denied. Your role does not have authorization for this resource.';
    case 404:
      return 'Requested resource not found.';
    case 500:
      return 'Internal server error on API Gateway backend.';
    default:
      return `Request failed with HTTP status ${status}.`;
  }
}

export const fetchApi = fetchWithAuth;

export const apiClient = {
  get: (endpoint: string, token?: string) => fetchWithAuth(endpoint, token, { method: 'GET' }),
  post: (endpoint: string, data: any, token?: string) => fetchWithAuth(endpoint, token, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: any, token?: string) => fetchWithAuth(endpoint, token, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string, token?: string) => fetchWithAuth(endpoint, token, { method: 'DELETE' }),
};

// Real Database Resource API Functions
export const realCampusApi = {
  fetchStudents: async (token?: string) => (await apiClient.get('/api/v1/students', token)) || [],
  fetchTeachers: async (token?: string) => (await apiClient.get('/api/v1/teachers', token)) || [],
  fetchAttendance: async (token?: string) => (await apiClient.get('/api/v1/attendance', token)) || [],
  fetchExams: async (token?: string) => (await apiClient.get('/api/v1/exams', token)) || [],
  fetchResults: async (token?: string) => (await apiClient.get('/api/v1/results', token)) || [],
  fetchAnnouncements: async (token?: string) => (await apiClient.get('/api/v1/announcements', token)) || [],
  fetchAuditLogs: async (token?: string) => (await apiClient.get('/api/v1/audit-logs', token)) || [],
  fetchOrganizations: async (token?: string) => (await apiClient.get('/api/v1/organizations', token)) || [],
  fetchPrincipals: async (token?: string) => (await apiClient.get('/api/v1/principals', token)) || [],
  
  createPrincipal: async (data: any, token?: string) => apiClient.post('/api/v1/admin/principals', data, token),
  createTeacher: async (data: any, token?: string) => apiClient.post('/api/v1/principal/teachers', data, token),
  createStudent: async (data: any, token?: string) => apiClient.post('/api/v1/principal/students', data, token),
  markAttendance: async (data: any, token?: string) => apiClient.post('/api/v1/attendance', data, token),
  submitResults: async (data: any, token?: string) => apiClient.post('/api/v1/results', data, token),
  approveResult: async (id: string, token?: string) => apiClient.put(`/api/v1/results/${id}/approve`, {}, token),
  publishResult: async (id: string, token?: string) => apiClient.put(`/api/v1/results/${id}/publish`, {}, token)
};
