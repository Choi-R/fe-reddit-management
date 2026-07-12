import type { User } from '../types';
import { API_BASE } from './apiClient';

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

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Request failed.');
    }
    return result;
  },

  resetPassword: async (token: string, password: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Password reset failed.');
    }
    return result;
  },
};
