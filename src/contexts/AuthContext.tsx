import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import { setSessionExpiredHandler } from '../services/apiClient';
import type { User } from '../types';
import { AuthContext, type AuthContextType } from '../hooks/useAuth';

export type { AuthContextType };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hasSession, setHasSession] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
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
    localStorage.removeItem('crm_user');
    void authService.logout().catch(() => undefined);
    setHasSession(false);
    setUser(null);
  }, []);

  // Register session-expired handler so the API client can trigger logout
  useEffect(() => {
    setSessionExpiredHandler(() => {
      logout();
    });
  }, [logout]);

  useEffect(() => {
    localStorage.removeItem('crm_token');

    authService
      .getSession()
      .then(({ user: sessionUser }) => {
        setUser((cachedUser) => (cachedUser ? { ...cachedUser, ...sessionUser } : (sessionUser as User)));
        setHasSession(true);
      })
      .catch(() => {
        localStorage.removeItem('crm_user');
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    localStorage.setItem('crm_user', JSON.stringify(result.user));
    setHasSession(true);
    setUser(result.user);
    return result.user;
  }, []);

  const isAuthenticated = hasSession && !!user;
  const isAdmin = user?.roles.includes('admin') || user?.roles.includes('choi') || false;
  const isChoi = user?.roles.includes('choi') || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isInitializing,
        isAdmin,
        isChoi,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
