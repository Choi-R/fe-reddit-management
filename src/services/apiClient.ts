// Base API client configuration and network helper

export const API_BASE = import.meta.env.VITE_API_BASE || 'https://be-reddit.choi.web.id';

let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

function getToken(): string | null {
  return localStorage.getItem('crm_token');
}

async function request<T = unknown>(endpoint: string, options: RequestInit = {}, auth: boolean): Promise<T> {
  const token = auth ? getToken() : null;
  if (auth && !token) throw new Error('Unauthenticated');

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (auth && response.status === 401) {
    onSessionExpired?.();
    throw new Error('Session expired. Please log in again.');
  }

  let result: Record<string, any> = {};
  try {
    result = await response.json();
  } catch {
    // Non-JSON response from edge/proxy (e.g. 502/504 Bad Gateway HTML)
  }

  if (!response.ok) {
    throw new Error(result.error || result.message || `Server error (${response.status})`);
  }
  return result as T;
}

export const authenticatedRequest = <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> =>
  request<T>(endpoint, options, true);

export const publicRequest = <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> =>
  request<T>(endpoint, options, false);

/** Builds the `?statuses=&search=` query string shared by task-history endpoints. */
export function buildHistoryQuery(params?: { statuses?: string[]; search?: string }): string {
  const query = new URLSearchParams();
  if (params?.statuses && params.statuses.length > 0) query.set('statuses', params.statuses.join(','));
  if (params?.search && params.search.trim()) query.set('search', params.search.trim());
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}
