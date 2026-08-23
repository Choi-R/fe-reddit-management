import type { User, Task, BasicUserSummary, UserDetailStats, PendingSubmission, TaskHistoryResponse } from '../types';
import { authenticatedRequest } from './apiClient';

export const adminService = {
  getUsers: (params?: { search?: string; sortBy?: string; sortOrder?: string; cqs?: string }): Promise<{ users: BasicUserSummary[] }> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortOrder) query.set('sortOrder', params.sortOrder);
    if (params?.cqs && params.cqs !== 'ALL') query.set('cqs', params.cqs);
    const queryString = query.toString();
    return authenticatedRequest(`/api/admin/users${queryString ? `?${queryString}` : ''}`);
  },

  searchUsers: (q: string): Promise<{ users: BasicUserSummary[] }> =>
    authenticatedRequest(`/api/admin/users/search?q=${encodeURIComponent(q)}`),

  getUserDetail: (userId: string): Promise<{ success: boolean; data: UserDetailStats }> =>
    authenticatedRequest(`/api/admin/users/${userId}/detail`),

  createUser: (data: { email: string; password: string; paypal?: string | null; reddit: string; nickname?: string | null; rankId?: string | null }): Promise<{ success: boolean; user: User }> =>
    authenticatedRequest('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUser: (userId: string, data: { email: string; paypal?: string | null; reddit: string; nickname?: string | null; rankId?: string | null }): Promise<{ success: boolean; user: User }> =>
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

  getTasks: (): Promise<{ tasks: Task[]; archivedTasks: Task[]; completedTasks: Task[]; deletedTasks: Task[] }> =>
    authenticatedRequest('/api/admin/tasks'),

  getTaskHistory: (params?: { statuses?: string[]; search?: string }): Promise<TaskHistoryResponse> => {
    const query = new URLSearchParams();
    if (params?.statuses && params.statuses.length > 0) {
      query.set('statuses', params.statuses.join(','));
    }
    if (params?.search && params.search.trim()) {
      query.set('search', params.search.trim());
    }
    const queryString = query.toString();
    return authenticatedRequest(`/api/admin/tasks/history${queryString ? `?${queryString}` : ''}`);
  },

  createTask: (data: {
    subreddit?: string | null;
    url: string;
    clientRequest: string;
    quota: number;
    price: number;
    minRankId?: string | null;
    assignedTo?: string | null;
    deadline?: string | null;
  }): Promise<{ success: boolean; task: Task }> =>
    authenticatedRequest('/api/admin/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  bulkCreateTasks: (tasks: Array<{
    url: string;
    clientRequest: string;
    price: number;
    deadline: string | null;
    minRankId?: string | null;
  }>): Promise<{ success: boolean; count: number; tasks: Task[] }> =>
    authenticatedRequest('/api/admin/tasks/bulk', {
      method: 'POST',
      body: JSON.stringify({ tasks }),
    }),

  updateTask: (taskId: string, data: {
    subreddit?: string | null;
    url: string;
    clientRequest: string;
    quota: number;
    originalQuota?: number;
    price: number;
    minRankId?: string | null;
    assignedTo?: string | null;
    deadline?: string | null;
    restore?: boolean;
    isArchived?: boolean;
  }): Promise<{ success: boolean; task: Task }> =>
    authenticatedRequest(`/api/admin/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  archiveTask: (
    taskId: string
  ): Promise<{ success: boolean; message: string; task: Task }> =>
    authenticatedRequest(`/api/admin/tasks/${taskId}/archive`, {
      method: 'POST',
    }),

  restoreTask: (
    taskId: string
  ): Promise<{ success: boolean; message: string; task: Task; telegramNotified?: boolean; telegramReason?: string }> =>
    authenticatedRequest(`/api/admin/tasks/${taskId}/restore`, {
      method: 'POST',
    }),

  deleteTask: (taskId: string): Promise<{ success: boolean; message: string }> =>
    authenticatedRequest(`/api/admin/tasks/${taskId}`, {
      method: 'DELETE',
    }),

  reviewSubmission: (
    bookingId: string,
    statusId: 'success' | 'failed',
    adminNote?: string | null
  ): Promise<{ success: boolean; booking: unknown; quotaReturned?: boolean; telegramNotified?: boolean; telegramReason?: string }> =>
    authenticatedRequest('/api/admin/tasks/review', {
      method: 'POST',
      body: JSON.stringify({ bookingId, statusId, note: adminNote, adminNote }),
    }),

  getPendingReviews: (): Promise<{ success: boolean; bookings: PendingSubmission[] }> =>
    authenticatedRequest('/api/admin/reviews/pending'),

  recordPayout: (userId: string): Promise<{ success: boolean; message: string; count: number }> =>
    authenticatedRequest('/api/admin/payouts', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
};

