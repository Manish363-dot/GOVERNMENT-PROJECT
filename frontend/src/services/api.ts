const API_URL = import.meta.env.VITE_API_URL || '/api';

// In-memory GET response cache & concurrent request deduplication
const getResponseCache = new Map<string, { data: any; fetchedAt: number }>();
const inFlightGets = new Map<string, Promise<any>>();

/**
 * Base API call helper with automatic auth token injection,
 * concurrent GET deduplication, and short client caching for instant tab switching.
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (method !== 'GET') {
    // Invalidate GET cache on any write/mutation
    getResponseCache.clear();
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    if (typeof window !== 'undefined') {
      if (response.status === 503 && window.location.pathname !== '/maintenance') {
        window.location.href = '/maintenance';
      } else if (response.status >= 500 && window.location.pathname !== '/500') {
        window.location.href = '/500';
      }
    }
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    const err: any = new Error(error.error || `Request failed: ${response.status}`);
    err.status = response.status;
    throw err;
  }

  const json = await response.json();
  if (method === 'GET') {
    getResponseCache.set(endpoint, { data: json, fetchedAt: Date.now() });
  }
  return json;
}

export const api = {
  /**
   * Synchronously inspect previously fetched GET data for instant zero-spinner renders.
   */
  peekCache: <T>(endpoint: string, maxAgeMs = 120_000): T | null => {
    const entry = getResponseCache.get(endpoint);
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > maxAgeMs) return null;
    return entry.data as T;
  },

  invalidateCache: (prefix?: string) => {
    if (!prefix) {
      getResponseCache.clear();
      return;
    }
    for (const k of getResponseCache.keys()) {
      if (k.startsWith(prefix)) getResponseCache.delete(k);
    }
  },

  get: <T>(endpoint: string, opts?: { force?: boolean; freshMs?: number }): Promise<T> => {
    const freshMs = opts?.freshMs ?? 10_000;
    if (!opts?.force && freshMs > 0) {
      const cached = getResponseCache.get(endpoint);
      if (cached && Date.now() - cached.fetchedAt < freshMs) {
        return Promise.resolve(cached.data as T);
      }
    }

    const existing = !opts?.force ? inFlightGets.get(endpoint) : undefined;
    if (existing) {
      return existing as Promise<T>;
    }

    const reqPromise = apiCall<T>(endpoint).finally(() => {
      inFlightGets.delete(endpoint);
    });
    inFlightGets.set(endpoint, reqPromise);
    return reqPromise;
  },

  post: <T>(endpoint: string, data: any) =>
    apiCall<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),

  upload: async <T>(endpoint: string, formData: FormData, method: string = 'POST'): Promise<T> => {
    getResponseCache.clear();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      body: formData,
      credentials: 'include',
    });
    if (!response.ok) {
      if (typeof window !== 'undefined') {
        if (response.status === 503 && window.location.pathname !== '/maintenance') {
          window.location.href = '/maintenance';
        } else if (response.status >= 500 && window.location.pathname !== '/500') {
          window.location.href = '/500';
        }
      }
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.message || error.error || `Upload failed: ${response.status}`);
    }
    return response.json();
  },

  put: <T>(endpoint: string, data: any) =>
    apiCall<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),

  patch: <T>(endpoint: string, data: any) =>
    apiCall<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: <T>(endpoint: string) =>
    apiCall<T>(endpoint, { method: 'DELETE' }),
};
