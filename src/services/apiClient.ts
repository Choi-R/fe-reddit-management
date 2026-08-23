// Base API client configuration and network helper

export const API_BASE = import.meta.env.VITE_API_BASE || 'https://be-reddit.choi.web.id';

let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

function getToken(): string | null {
  return localStorage.getItem('crm_token');
}

export async function authenticatedRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  if (!token) throw new Error('Unauthenticated');

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
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
