import type { Task, Booking, ActiveBooking, TaskHistoryResponse, CooldownInfo } from '../types';
import { authenticatedRequest, buildHistoryQuery } from './apiClient';

export const taskService = {
  getAvailable: (params?: { platform?: 'REDDIT' | 'PRODUCTHUNT' }): Promise<{ available: Task[]; active: ActiveBooking[]; cooldown?: CooldownInfo }> => {
    const query = new URLSearchParams();
    if (params?.platform) query.set('platform', params.platform);
    const queryString = query.toString();
    return authenticatedRequest(`/api/tasks/available${queryString ? `?${queryString}` : ''}`);
  },

  getTaskHistory: (params?: { statuses?: string[]; search?: string }): Promise<TaskHistoryResponse> =>
    authenticatedRequest(`/api/tasks/history${buildHistoryQuery(params)}`),

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

  cancel: (taskId: string): Promise<{ success: boolean }> =>
    authenticatedRequest('/api/tasks/cancel', {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    }),

  getEarnings: (): Promise<{ history: Booking[]; paidBalance: number; pendingBalance: number }> =>
    authenticatedRequest('/api/tasks/earnings'),
};

