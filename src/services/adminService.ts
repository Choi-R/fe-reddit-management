import type { User, Task, BasicUserSummary, UserDetailStats, TaskHistoryResponse, ProductHuntAccount } from '../types';
import { authenticatedRequest, buildHistoryQuery } from './apiClient';

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

  createUser: (data: { email: string; password: string; paymentInfo?: { type: string; account_details: any }[]; reddit: string; nickname?: string | null; rankId?: string | null }): Promise<{ success: boolean; user: User }> =>
    authenticatedRequest('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUser: (userId: string, data: { email: string; paymentInfo?: { type: string; account_details: any }[]; reddit: string; nickname?: string | null; rankId?: string | null }): Promise<{ success: boolean; user: User }> =>
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

  // ProductHunt account management
  createProductHuntAccount: (userId: string, data: { username: string; headline?: string | null; bio?: string | null }): Promise<{ success: boolean; account: ProductHuntAccount }> =>
    authenticatedRequest(`/api/admin/users/${userId}/producthunt-accounts`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProductHuntAccounts: (userId: string): Promise<{ success: boolean; accounts: ProductHuntAccount[] }> =>
    authenticatedRequest(`/api/admin/users/${userId}/producthunt-accounts`),

  updateProductHuntAccount: (userId: string, phId: string, data: { username: string; headline?: string | null; bio?: string | null }): Promise<{ success: boolean; account: ProductHuntAccount }> =>
    authenticatedRequest(`/api/admin/users/${userId}/producthunt-accounts/${phId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProductHuntAccount: (userId: string, phId: string): Promise<{ success: boolean; message: string }> =>
    authenticatedRequest(`/api/admin/users/${userId}/producthunt-accounts/${phId}`, {
      method: 'DELETE',
    }),

  getTasks: (): Promise<{ tasks: Task[]; archivedTasks: Task[]; completedTasks: Task[]; deletedTasks: Task[] }> =>
    authenticatedRequest('/api/admin/tasks'),

  getTaskHistory: (params?: { statuses?: string[]; search?: string }): Promise<TaskHistoryResponse> =>
    authenticatedRequest(`/api/admin/tasks/history${buildHistoryQuery(params)}`),

  createTask: (data: {
    platform?: 'REDDIT' | 'PRODUCTHUNT';
    target_subreddit?: string | null;
    subreddit?: string | null; // legacy alias
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
    platform?: 'REDDIT' | 'PRODUCTHUNT';
    target_subreddit?: string | null;
    subreddit?: string | null; // legacy alias
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
    platform?: 'REDDIT' | 'PRODUCTHUNT';
    target_subreddit?: string | null;
    subreddit?: string | null; // legacy alias
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

  recordPayout: (userId: string): Promise<{ success: boolean; message: string; count: number }> =>
    authenticatedRequest('/api/admin/payouts', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
};

