import type { Task, Booking, ActiveBooking, TaskHistoryResponse, CooldownInfo } from '../types';
import { authenticatedRequest } from './apiClient';

export const taskService = {
  getAvailable: (): Promise<{ available: Task[]; active: ActiveBooking[]; cooldown?: CooldownInfo }> =>
    authenticatedRequest('/api/tasks/available'),

  getTaskHistory: (params?: { statuses?: string[]; search?: string }): Promise<TaskHistoryResponse> => {
    const query = new URLSearchParams();
    if (params?.statuses && params.statuses.length > 0) {
      query.set('statuses', params.statuses.join(','));
    }
    if (params?.search && params.search.trim()) {
      query.set('search', params.search.trim());
    }
    const queryString = query.toString();
    return authenticatedRequest(`/api/tasks/history${queryString ? `?${queryString}` : ''}`);
  },

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

