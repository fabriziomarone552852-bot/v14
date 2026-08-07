// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
    persistTokens(null, null);
    persistUser(null);
    persistMustChangePassword(false);
    clearError();

    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }, []);

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
      const normalizedUsername = username.trim().toLowerCase();
      const body = new URLSearchParams();
      body.append('username', normalizedUsername);
      body.append('password', password);

      // Chiamata Axios BASE (senza interceptor) per il login
      const res = await axios.post<TokenResponse>(apiUrl('/auth/login'), body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const tokenData = res.data;

      // ⚠️ Salva il token (anche se è un password_change token)
      persistTokens(tokenData.access_token, tokenData.refresh_token ?? null);

      // Rileva se l'utente deve cambiare la password
      const needsPasswordChange =
        tokenData.must_change_password === true ||
        tokenData.access_scope === 'password_change';

      persistMustChangePassword(needsPasswordChange);

      if (!needsPasswordChange) {
        // Flusso normale: recupera i dati utente
        const userRes = await apiClient.get<UserResponse>('/users/me');
        persistUser(userRes.data);
      }
      // Se needsPasswordChange, il redirect viene gestito dall'AppRouter

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

      // Login automatico dopo la registrazione
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
      // Il token corrente è il password_change token, già nel localStorage
      const res = await apiClient.post<TokenResponse>('/auth/change-password-required', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      const tokenData = res.data;

      // Salva i nuovi token "normali"
      persistTokens(tokenData.access_token, tokenData.refresh_token ?? null);
      persistMustChangePassword(false);

      // Recupera i dati utente con il nuovo token normale
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