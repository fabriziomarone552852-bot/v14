// src/components/settings/useUserSettingsPageLogic.ts
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/api/apiService';
import { useAuth } from '@/context/AuthContext';
import type {
  SettingsTabId,
  UserServerSettings,
  UserSettingsFormState,
  UserSettingsUpdatePayload,
} from '@/types/settings';

export const useUserSettingsPageLogic = () => {
  const { logout } = useAuth();

  const [settings, setSettings] = useState<UserServerSettings | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTabId>('profile');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deactivating, setDeactivating] = useState<boolean>(false);
  const [isClearingCache, setIsClearingCache] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<UserSettingsFormState>({
    email: '',
    maxDepth: 3,
  });

  // Auto-dismiss del toast di successo
  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(null), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);

  // Caricamento dati iniziali
  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api.get<UserServerSettings>('/users/me/settings');
        if (isMounted && data) {
          setSettings(data);
          setForm({
            email: data.email ?? '',
            maxDepth: data.max_subtask_depth_user !== null ? data.max_subtask_depth_user : 3,
          });
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Errore nel caricamento delle impostazioni.';
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasChanges = useMemo(() => {
    if (!settings) return false;
    const emailChanged = form.email.trim() !== (settings.email ?? '').trim();
    const depthChanged =
      form.maxDepth !== '' && form.maxDepth !== (settings.max_subtask_depth_user ?? 3);

    return emailChanged || depthChanged;
  }, [settings, form]);

  const handleResetForm = () => {
    if (!settings) return;
    setForm({
      email: settings.email ?? '',
      maxDepth: settings.max_subtask_depth_user !== null ? settings.max_subtask_depth_user : 3,
    });
    setError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!settings) {
      setError('Impostazioni non disponibili.');
      return;
    }

    const payload: UserSettingsUpdatePayload = {};

    const trimmedEmail = form.email.trim();
    if (trimmedEmail && trimmedEmail !== settings.email) {
      payload.email = trimmedEmail;
    }

    if (form.maxDepth !== '' && form.maxDepth !== settings.max_subtask_depth_user) {
      payload.max_subtask_depth_user = form.maxDepth;
    }

    if (Object.keys(payload).length === 0) {
      setSuccess('Nessuna modifica da salvare.');
      return;
    }

    setSaving(true);

    try {
      const updated = await api.patch<UserServerSettings>('/users/me/settings', payload);
      if (updated) {
        setSettings(updated);
        setForm({
          email: updated.email ?? '',
          maxDepth: updated.max_subtask_depth_user !== null ? updated.max_subtask_depth_user : 3,
        });
        setSuccess('Impostazioni salvate con successo.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore nel salvataggio delle impostazioni.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePasswordSubmit = async (
    currentPw: string,
    newPw: string,
    confirmPw: string
  ) => {
    setError(null);
    const payload: UserSettingsUpdatePayload = {
      current_password: currentPw,
      new_password: newPw,
      confirm_new_password: confirmPw,
    };

    try {
      const updated = await api.patch<UserServerSettings>('/users/me/settings', payload);
      if (updated) {
        setSettings(updated);
        setSuccess('Password aggiornata con successo.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore durante l\'aggiornamento della password.';
      setError(message);
    }
  };

  const handleDeactivateAccount = async () => {
    setDeactivating(true);
    setError(null);
    try {
      await api.delete('/users/me');
      logout();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore durante la disattivazione dell\'account.';
      setError(message);
      setDeactivating(false);
    }
  };

  const handleClearClientCache = () => {
    setIsClearingCache(true);
    try {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const user = localStorage.getItem('user');

      localStorage.clear();

      if (token) localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (user) localStorage.setItem('user', user);

      setSuccess('Cache locale ripulita con successo. Dati risincronizzati.');
    } catch {
      setError('Impossibile svuotare la memoria locale.');
    } finally {
      setIsClearingCache(false);
    }
  };

  return {
    settings,
    form,
    setForm,
    activeTab,
    setActiveTab,
    loading,
    saving,
    deactivating,
    isClearingCache,
    error,
    setError,
    success,
    setSuccess,
    hasChanges,
    handleResetForm,
    handleSubmit,
    handleChangePasswordSubmit,
    handleDeactivateAccount,
    handleClearClientCache,
  };
};
