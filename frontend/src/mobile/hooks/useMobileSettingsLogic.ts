// src/mobile/hooks/useMobileSettingsLogic.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api/apiService';
import type { UserServerSettings, UserSettingsUpdatePayload } from '@/types/settings';
import { useGoogleCalendarIntegration } from '@/hooks/useGoogleCalendarIntegration';
import { useBackHandler } from '@/utils/backButtonManager';

export interface SettingsNotification {
  type: 'success' | 'error';
  message: string;
}

export const useMobileSettingsLogic = () => {
  const { user, logout } = useAuth();

  // Stato Dati Impostazioni Utente & App
  const [settings, setSettings] = useState<UserServerSettings | null>(null);
  const [email, setEmail] = useState<string>('');
  const [maxDepth, setMaxDepth] = useState<number | ''>(3);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingUser, setSavingUser] = useState<boolean>(false);
  const [savingApp, setSavingApp] = useState<boolean>(false);
  const [isClearingCache, setIsClearingCache] = useState<boolean>(false);

  // Modali & Feedback
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<SettingsNotification | null>(null);

  // Chiudi dialogo conferma logout con tasto Back hardware
  useBackHandler(
    showLogoutConfirm,
    () => {
      setShowLogoutConfirm(false);
      return true;
    },
    25
  );

  // Integrazione Google Calendar
  const googleSync = useGoogleCalendarIntegration();

  const displayUsername = user?.username ? user.username.toUpperCase() : 'OSPITE';
  const roleName = user?.is_superuser ? 'Superuser (Admin)' : 'Utente Standard';

  // Caricamento impostazioni server
  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await api.get<UserServerSettings>('/users/me/settings');
        if (isMounted && data) {
          setSettings(data);
          setEmail(data.email ?? '');
          setMaxDepth(data.max_subtask_depth_user !== null ? data.max_subtask_depth_user : 3);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Errore nel caricamento delle impostazioni.';
          setNotification({ type: 'error', message: msg });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-dismiss notifica
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3500);
    return () => clearTimeout(timer);
  }, [notification]);

  // Salvataggio Impostazioni Utente (Email)
  const handleSaveEmail = useCallback(async () => {
    if (!settings) return;
    const trimmed = email.trim();
    if (trimmed === (settings.email ?? '').trim()) {
      setNotification({ type: 'success', message: 'Nessuna modifica da salvare.' });
      return;
    }
    setSavingUser(true);
    setNotification(null);
    try {
      const updated = await api.patch<UserServerSettings>('/users/me/settings', { email: trimmed });
      if (updated) {
        setSettings(updated);
        setEmail(updated.email ?? '');
        setNotification({ type: 'success', message: 'Email aggiornata con successo!' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Errore durante l'aggiornamento dell'email.";
      setNotification({ type: 'error', message: msg });
    } finally {
      setSavingUser(false);
    }
  }, [email, settings]);

  // Cambio Password
  const handleChangePasswordSubmit = useCallback(
    async (currentPw: string, newPw: string, confirmPw: string) => {
      setPasswordLoading(true);
      setNotification(null);
      try {
        const payload: UserSettingsUpdatePayload = {
          current_password: currentPw,
          new_password: newPw,
          confirm_new_password: confirmPw,
        };
        const updated = await api.patch<UserServerSettings>('/users/me/settings', payload);
        if (updated) {
          setSettings(updated);
          setIsPasswordModalOpen(false);
          setNotification({ type: 'success', message: 'Password aggiornata con successo!' });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Errore durante l'aggiornamento della password.";
        setNotification({ type: 'error', message: msg });
      } finally {
        setPasswordLoading(false);
      }
    },
    []
  );

  // Salvataggio Impostazioni App (Profondità albero task)
  const handleSaveMaxDepth = useCallback(async (newDepth: number) => {
    setMaxDepth(newDepth);
    setSavingApp(true);
    setNotification(null);
    try {
      const updated = await api.patch<UserServerSettings>('/users/me/settings', {
        max_subtask_depth_user: newDepth,
      });
      if (updated) {
        setSettings(updated);
        setNotification({ type: 'success', message: `Profondità task impostata a ${newDepth} livelli.` });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Errore nel salvataggio della preferenza.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setSavingApp(false);
    }
  }, []);

  // Pulizia Cache Locale
  const handleClearCache = useCallback(() => {
    setIsClearingCache(true);
    try {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');

      localStorage.clear();

      if (token) localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (storedUser) localStorage.setItem('user', storedUser);

      setNotification({ type: 'success', message: 'Cache locale ripulita con successo!' });
    } catch {
      setNotification({ type: 'error', message: 'Impossibile svuotare la cache.' });
    } finally {
      setIsClearingCache(false);
    }
  }, []);

  return {
    user,
    logout,
    settings,
    email,
    setEmail,
    maxDepth,
    loading,
    savingUser,
    savingApp,
    isClearingCache,
    showLogoutConfirm,
    setShowLogoutConfirm,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    passwordLoading,
    notification,
    googleSync,
    displayUsername,
    roleName,
    handleSaveEmail,
    handleChangePasswordSubmit,
    handleSaveMaxDepth,
    handleClearCache,
  };
};
