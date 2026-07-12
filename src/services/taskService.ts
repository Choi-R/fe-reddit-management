import type { Task, Booking, ActiveBooking } from '../types';
import { authenticatedRequest } from './apiClient';

export const taskService = {
  getAvailable: (): Promise<{ available: Task[]; active: ActiveBooking[] }> =>
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

  cancel: (taskId: string): Promise<{ success: boolean }> =>
    authenticatedRequest('/api/tasks/cancel', {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    }),

  getEarnings: (): Promise<{ history: Booking[]; paidBalance: number; pendingBalance: number }> =>
    authenticatedRequest('/api/tasks/earnings'),
};
