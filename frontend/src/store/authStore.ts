// src/store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isBootstrapped: boolean;
  bootstrap: () => void;
  setSession: (token: string, refreshToken?: string | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isBootstrapped: false,

  bootstrap: () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    set({
      token,
      refreshToken,
      isAuthenticated: !!token,
      isBootstrapped: true,
    });
  },

  setSession: (token, refreshToken = null) => {
    localStorage.setItem('token', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

    set({
      token,
      refreshToken,
      isAuthenticated: true,
      isBootstrapped: true,
    });
  },

  clearSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');

    set({
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isBootstrapped: true,
    });
  },
}));