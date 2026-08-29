import type { User } from '../types';
import { publicRequest } from './apiClient';

export const authService = {
  login: (email: string, password: string): Promise<{ token: string; user: User }> =>
    publicRequest('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  forgotPassword: (email: string): Promise<{ success: boolean; message: string }> =>
    publicRequest('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string): Promise<{ success: boolean; message: string }> =>
    publicRequest('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
};
