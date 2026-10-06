/**
 * HTTP API Client with JWT Authentication
 * Provides axios-like interface for making authenticated API requests
 */

import { COOKIE_NAME } from '@shared/const';

interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  responseType?: 'json' | 'blob';
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

/**
 * Get JWT token from storage
 * Checks localStorage first (for persistent storage), then cookies
 */
function getAuthToken(): string | null {
  // Check localStorage first
  const storedToken = localStorage.getItem('auth-token');
  if (storedToken) {
    console.log('[apiClient] Using token from localStorage (length: ' + storedToken.length + ')');
    return storedToken;
  }

  // Check for alternative token keys
  const altToken = localStorage.getItem('auth_token');
  if (altToken) {
    console.log('[apiClient] Found auth_token in localStorage, using it');
    return altToken;
  }

  // Fallback to reading cookies
  const name = `${COOKIE_NAME}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      const cookieToken = cookie.substring(name.length, cookie.length);
      console.log('[apiClient] Using token from cookie (length: ' + cookieToken.length + ')');
      return cookieToken;
    }
  }

  console.warn('[apiClient] No authentication token found in localStorage or cookies');
  return null;
}

/**
 * Build query string from params object
 */
function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  
  const searchParams = new URLSearchParams();
  for (const key in params) {
    if (params[key] !== null && params[key] !== undefined) {
      searchParams.append(key, String(params[key]));
    }
  }
  
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Make an authenticated HTTP request
 */
async function request<T = any>(
  method: string,
  url: string,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config?.headers || {}),
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log(`[apiClient] ${method} ${url} - Token added to Authorization header`);
  } else {
    console.warn(`[apiClient] ${method} ${url} - No token available for request`);
  }

  const queryString = buildQueryString(config?.params);
  const fullUrl = url + queryString;

  try {
    console.log(`[apiClient] Making ${method} request to ${fullUrl}`);
    const response = await fetch(fullUrl, {
      method,
      headers,
      credentials: 'include', // Include cookies in request
      body: config?.data ? JSON.stringify(config.data) : undefined,
    });

    const data = config?.responseType === 'blob'
      ? await response.blob()
      : await response.json().catch(() => null);

    if (!response.ok) {
      console.error(`[apiClient] ${method} ${fullUrl} failed with status ${response.status}`, data);
      const error = new Error(
        data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`
      );
      (error as any).status = response.status;
      (error as any).response = { data, status: response.status };
      throw error;
    }

    console.log(`[apiClient] ${method} ${fullUrl} succeeded with status ${response.status}`);
    return {
      data: config?.responseType === 'blob' ? data : data?.data || data, // Handle both { data: T } and plain T responses
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error: any) {
    // Re-throw with enhanced context
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
  }
}

/**
 * apiClient - axios-like HTTP client with JWT authentication
 */
const apiClient = {
  /**
   * GET request
   */
  get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return request<T>('GET', url, config);
  },

  /**
   * POST request
   */
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return request<T>('POST', url, { ...config, data });
  },

  /**
   * PUT request
   */
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return request<T>('PUT', url, { ...config, data });
  },

  /**
   * DELETE request
   */
  delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return request<T>('DELETE', url, config);
  },

  /**
   * PATCH request
   */
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return request<T>('PATCH', url, { ...config, data });
  },
};

export default apiClient;
