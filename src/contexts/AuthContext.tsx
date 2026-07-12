import { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import { setSessionExpiredHandler } from '../services/apiClient';
import type { User } from '../types';

export interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isChoi: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('crm_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('crm_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const logout = useCallback(() => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setToken(null);
    setUser(null);
  }, []);

  // Register session-expired handler so the API client can trigger logout
  useEffect(() => {
    setSessionExpiredHandler(() => {
      logout();
    });
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    localStorage.setItem('crm_token', result.token);
    localStorage.setItem('crm_user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const isAuthenticated = !!(token && user);
  const isAdmin = user?.roles.includes('admin') || user?.roles.includes('choi') || false;
  const isChoi = user?.roles.includes('choi') || false;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isChoi,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
