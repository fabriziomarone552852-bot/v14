// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiUrl, apiClient } from '@/api/client';
import type { TokenResponse, UserResponse } from '@/types/auth';

interface AuthContextValue {
  token: string | null;
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  /** true se il token corrente ha scope "password_change" */
  mustChangePassword: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  /**
   * Chiama POST /auth/change-password-required con il token password_change.
   * In caso di successo aggiorna i token con quelli "normali" restituiti dal server.
   */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Usiamo un ref per rendere navigate disponibile dentro useCallback
  // senza doverlo inserire nelle dipendenze (è stabile per design).
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const [user, setUser] = useState<UserResponse | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [mustChangePassword, setMustChangePassword] = useState<boolean>(
    () => localStorage.getItem('mustChangePassword') === 'true'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // L'utente è "autenticato" solo se ha un token con scope normale (non password_change)
  const isAuthenticated = !!token && !mustChangePassword;

  const persistTokens = (accessToken: string | null, refToken: string | null) => {
    setToken(accessToken);
    if (accessToken && refToken) {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refToken);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  };

  const persistUser = (userData: UserResponse | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  const persistMustChangePassword = (value: boolean) => {
    setMustChangePassword(value);
    if (value) {
      localStorage.setItem('mustChangePassword', 'true');
    } else {
      localStorage.removeItem('mustChangePassword');
    }
  };

  const clearError = () => setError(null);

  const logout = useCallback(() => {
    queryClient.clear();
    persistTokens(null, null);
    persistUser(null);
    persistMustChangePassword(false);
    clearError();

    if (window.location.pathname !== '/login') {
      navigateRef.current('/login');
    }
  }, [queryClient]);

  useEffect(() => {
    const handleForceLogout = () => {
      console.warn("Sessione completamente scaduta, logout forzato.");
      logout();
    };
    window.addEventListener('force-logout', handleForceLogout);
    return () => window.removeEventListener('force-logout', handleForceLogout);
  }, [logout]);

  const login = async (username: string, password: string) => {
    setLoading(true);
    clearError();
    try {
      // Puliamo preventivamente vecchi token per evitare intercettazioni errate
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('mustChangePassword');

      const normalizedUsername = username.trim().toLowerCase();
      const body = new URLSearchParams();
      body.append('username', normalizedUsername);
      body.append('password', password);

      const res = await axios.post<TokenResponse>(apiUrl('/auth/login'), body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const tokenData = res.data;

      const needsPasswordChange =
        tokenData.must_change_password === true ||
        tokenData.access_scope === 'password_change';

      let userData: UserResponse | null = null;
      if (!needsPasswordChange) {
        const userRes = await axios.get<UserResponse>(apiUrl('/users/me'), {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        userData = userRes.data;
      }

      // Impostiamo sia i token che lo user in modo sincrono prima dell'aggiornamento dello stato
      persistTokens(tokenData.access_token, tokenData.refresh_token ?? null);
      persistMustChangePassword(needsPasswordChange);
      persistUser(userData);

    } catch (e: unknown) {
      let msg = 'Errore di login';

      if (axios.isAxiosError(e)) {
        msg = e.response?.data?.detail || e.message || 'Errore del server';
      } else if (e instanceof Error) {
        msg = e.message;
      }

      setError(msg);
      persistTokens(null, null);
      persistUser(null);
      persistMustChangePassword(false);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    clearError();
    try {
      const normalizedUsername = username.trim().toLowerCase();
      const normalizedEmail = email.trim().toLowerCase();

      await axios.post(apiUrl('/auth/register'), {
        username: normalizedUsername,
        email: normalizedEmail,
        password,
      });

      await login(normalizedUsername, password);
    } catch (e: unknown) {
      let msg = 'Errore di registrazione';

      if (axios.isAxiosError(e)) {
        msg = e.response?.data?.detail || e.message || 'Errore del server';
      } else if (e instanceof Error) {
        msg = e.message;
      }

      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    clearError();
    try {
      const res = await apiClient.post<TokenResponse>('/auth/change-password-required', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      const tokenData = res.data;

      persistTokens(tokenData.access_token, tokenData.refresh_token ?? null);
      persistMustChangePassword(false);

      const userRes = await apiClient.get<UserResponse>('/users/me');
      persistUser(userRes.data);

    } catch (e: unknown) {
      let msg = 'Errore nel cambio password';

      if (axios.isAxiosError(e)) {
        msg = e.response?.data?.detail || e.message || 'Errore del server';
      } else if (e instanceof Error) {
        msg = e.message;
      }

      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextValue = {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    mustChangePassword,
    login,
    register,
    logout,
    clearError,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};