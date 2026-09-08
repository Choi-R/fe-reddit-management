// Base API client configuration and network helper

export const API_BASE = import.meta.env.VITE_API_BASE || 'https://be-reddit.choi.web.id';
const REQUEST_TIMEOUT_MS = 30_000;

let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

async function request<T = unknown>(endpoint: string, options: RequestInit = {}, auth: boolean): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const handleAbort = () => controller.abort();
  options.signal?.addEventListener('abort', handleAbort, { once: true });

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
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
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out or was cancelled. Please try again.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
    options.signal?.removeEventListener('abort', handleAbort);
  }
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
