import type { User, Task, BasicUserSummary, PendingSubmission } from '../types';
import { authenticatedRequest } from './apiClient';

export const adminService = {
  getUsers: (): Promise<{ users: BasicUserSummary[] }> =>
    authenticatedRequest('/api/admin/users'),

  createUser: (data: { email: string; password: string; paypal?: string | null; reddit: string }): Promise<{ success: boolean; user: User }> =>
    authenticatedRequest('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUser: (userId: string, data: { email: string; paypal?: string | null; reddit: string }): Promise<{ success: boolean; user: User }> =>
    authenticatedRequest(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateUserPassword: (userId: string, password: string): Promise<{ success: boolean; message: string }> =>
    authenticatedRequest(`/api/admin/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    }),

  deleteUser: (userId: string): Promise<{ success: boolean; message: string }> =>
    authenticatedRequest(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    }),

  getTasks: (): Promise<{ tasks: Task[] }> =>
    authenticatedRequest('/api/admin/tasks'),

  createTask: (data: {
    subreddit?: string | null;
    url: string;
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

  updateTask: (taskId: string, data: {
    subreddit?: string | null;
    url: string;
    clientRequest: string;
    quota: number;
    price: number;
    typeId: string;
    assignedTo?: string | null;
    deadline?: string | null;
  }): Promise<{ success: boolean; task: Task }> =>
    authenticatedRequest(`/api/admin/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTask: (taskId: string): Promise<{ success: boolean; message: string }> =>
    authenticatedRequest(`/api/admin/tasks/${taskId}`, {
      method: 'DELETE',
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
