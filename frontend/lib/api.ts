const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function normalizeApiBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const API_URL = normalizeApiBaseUrl(RAW_API_URL);

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const authToken = token || this.getToken();
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(fetchOptions.headers as Record<string, string> || {}),
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${normalizedEndpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }

    return response.json();
  }

  get<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) });
  }

  put<T>(endpoint: string, data?: unknown, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) });
  }

  patch<T>(endpoint: string, data?: unknown, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) });
  }

  delete<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);
export default api;
