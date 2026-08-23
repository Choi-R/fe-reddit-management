import type { User } from '../types';
import { API_BASE } from './apiClient';

export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    let result: Record<string, any> = {};
    try {
      result = await response.json();
    } catch {
      // Non-JSON response fallback
    }

    if (!response.ok) {
      throw new Error(result.error || result.message || `Login failed (${response.status})`);
    }
    return result as { token: string; user: User };
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    let result: Record<string, any> = {};
    try {
      result = await response.json();
    } catch {
      // Non-JSON response fallback
    }

    if (!response.ok) {
      throw new Error(result.error || result.message || `Request failed (${response.status})`);
    }
    return result as { success: boolean; message: string };
  },

  resetPassword: async (token: string, password: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    let result: Record<string, any> = {};
    try {
      result = await response.json();
    } catch {
      // Non-JSON response fallback
    }

    if (!response.ok) {
      throw new Error(result.error || result.message || `Password reset failed (${response.status})`);
    }
    return result as { success: boolean; message: string };
  },
};
