import { useState, useEffect, useCallback } from 'react';
import { authService, setSessionExpiredHandler } from '../lib/api';
import type { User } from '../lib/types';

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('crm_token'));
  const [user, setUser] = useState<User | null>(
    localStorage.getItem('crm_user') ? JSON.parse(localStorage.getItem('crm_user')!) : null
  );

  // Register session-expired handler so the API client can trigger logout
  useEffect(() => {
    setSessionExpiredHandler(() => {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      setToken(null);
      setUser(null);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    localStorage.setItem('crm_token', result.token);
    localStorage.setItem('crm_user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!(token && user);
  const isAdmin = user?.roles.includes('admin') || user?.roles.includes('choi') || false;
  const isChoi = user?.roles.includes('choi') || false;

  return { token, user, login, logout, isAuthenticated, isAdmin, isChoi };
}
