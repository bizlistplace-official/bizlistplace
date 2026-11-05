'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { IUser } from '@bizpockethub/shared';
import { fetchApi } from './api';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    role: 'user' | 'business_owner'
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    if (typeof window !== 'undefined' && !localStorage.getItem('biz_auth_token')) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetchApi<{ user: IUser }>('/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('biz_user', JSON.stringify(res.data.user));
          } catch {}
        }
      } else {
        // If server explicitly returns unauthorized or session invalid, clear session
        if (
          res.status === 401 ||
          res.status === 403 ||
          res.message?.toLowerCase().includes('expired') ||
          res.message?.toLowerCase().includes('authentication required')
        ) {
          setUser(null);
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('biz_user');
              localStorage.removeItem('biz_auth_token');
            } catch {}
          }
        }
      }
    } catch {
      // Keep existing cached user on transient network errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Read cached user from localStorage safely in useEffect after initial hydration
    try {
      const stored = localStorage.getItem('biz_user');
      if (stored) {
        setUser(JSON.parse(stored));
        setLoading(false);
      }
    } catch {}
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetchApi<{ user: IUser; token?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data?.user) {
      setUser(res.data.user);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('biz_user', JSON.stringify(res.data.user));
          if (res.data?.token) {
            localStorage.setItem('biz_auth_token', res.data.token);
          }
        } catch {}
      }
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: 'user' | 'business_owner'
    ) => {
      const res = await fetchApi<{ user: IUser; token?: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.success && res.data?.user) {
        setUser(res.data.user);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('biz_user', JSON.stringify(res.data.user));
            if (res.data?.token) {
              localStorage.setItem('biz_auth_token', res.data.token);
            }
          } catch {}
        }
        return { success: true };
      }
      const errorText =
        res.errors && Array.isArray(res.errors) && res.errors.length > 0
          ? res.errors.map((e: any) => e.message).join('. ')
          : res.message || 'Registration failed';
      return { success: false, message: errorText };
    },
    []
  );

  const logout = useCallback(async () => {
    await fetchApi('/auth/logout', { method: 'POST' });
    setUser(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('biz_user');
        localStorage.removeItem('biz_auth_token');
      } catch {}
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
