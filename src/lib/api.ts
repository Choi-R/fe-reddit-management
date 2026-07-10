// API client for the Reddit CRM backend
import type { User, Task, Booking, ActiveBooking, BasicUserSummary, PendingSubmission } from './types';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://be-reddit.choi.web.id';

// ─── Core Request Helper ────────────────────────────────────────────

let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

function getToken(): string | null {
  return localStorage.getItem('crm_token');
}

async function authenticatedRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Server error.');
  }
  return result as T;
}

// ─── Auth Service ───────────────────────────────────────────────────

export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Login failed.');
    }
    return result;
  },
};

// ─── Basic User Task Service ────────────────────────────────────────

export const taskService = {
  getAvailable: (): Promise<{ available: Task[]; active: ActiveBooking | null }> =>
    authenticatedRequest('/api/tasks/available'),

  book: (taskId: string): Promise<{ success: boolean; booking: unknown }> =>
    authenticatedRequest('/api/tasks/book', {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    }),

  submit: (taskId: string, replyUrl: string, note?: string): Promise<{ success: boolean; booking: unknown }> =>
    authenticatedRequest('/api/tasks/submit', {
      method: 'POST',
      body: JSON.stringify({ taskId, replyUrl, note }),
    }),

  getEarnings: (): Promise<{ history: Booking[]; paidBalance: number; pendingBalance: number }> =>
    authenticatedRequest('/api/tasks/earnings'),
};

// ─── Admin Service ──────────────────────────────────────────────────

export const adminService = {
  getUsers: (): Promise<{ users: BasicUserSummary[] }> =>
    authenticatedRequest('/api/admin/users'),

  createUser: (data: { email: string; password: string; paypal: string; reddit: string }): Promise<{ success: boolean; user: User }> =>
    authenticatedRequest('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getTasks: (): Promise<{ tasks: Task[] }> =>
    authenticatedRequest('/api/admin/tasks'),

  createTask: (data: {
    subreddit: string;
    postUrl?: string | null;
    clientRequest: string;
    quota: number;
    price: number;
    typeId: string;
    assignedTo?: string | null;
    deadline?: string | null;
  }): Promise<{ success: boolean; task: Task }> =>
    authenticatedRequest('/api/admin/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  reviewSubmission: (bookingId: string, statusId: 'success' | 'failed', note?: string | null): Promise<{ success: boolean; booking: unknown }> =>
    authenticatedRequest('/api/admin/tasks/review', {
      method: 'POST',
      body: JSON.stringify({ bookingId, statusId, note }),
    }),

  getPendingReviews: (): Promise<{ success: boolean; bookings: PendingSubmission[] }> =>
    authenticatedRequest('/api/admin/reviews/pending'),

  recordPayout: (userId: string): Promise<{ success: boolean; message: string; count: number }> =>
    authenticatedRequest('/api/admin/payouts', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
};
