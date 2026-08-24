// src/views/UserSettingsPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { api } from '@/api/apiService';
import { useAuth } from '@/context/AuthContext';
import { LoadingIcon, SettingsIcon } from '@/components/shared/utils/Icons';
import type {
  SettingsTabId,
  UserServerSettings,
  UserSettingsFormState,
  UserSettingsUpdatePayload,
} from '@/types/settings';

import ProfileSection from '@/components/settings/ProfileSection';
import TaskHierarchySection from '@/components/settings/TaskHierarchySection';
import MemorySection from '@/components/settings/MemorySection';
import DangerZoneSection from '@/components/settings/DangerZoneSection';

const panelClass =
  'rounded-[30px] border border-white/70 bg-white/95 shadow-[0_12px_34px_rgba(15,23,42,0.08)] backdrop-blur';

export const UserSettingsPage: React.FC = () => {
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

    const updated = await api.patch<UserServerSettings>('/users/me/settings', payload);
    if (updated) {
      setSettings(updated);
      setSuccess('Password aggiornata con successo.');
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

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <LoadingIcon className="h-8 w-8 animate-spin text-blue-600" />
        <span className="text-sm font-semibold text-slate-500">Caricamento impostazioni...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-800 shadow-sm">
          <p className="font-bold">Impossibile caricare le impostazioni utente.</p>
          <p className="text-sm text-red-600 mt-1">{error || 'Verifica la connessione o effettua nuovamente il login.'}</p>
        </div>
      </div>
    );
  }

  const tabs: { id: SettingsTabId; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profilo', icon: '👤' },
    { id: 'tasks', label: 'Gerarchia Task', icon: '📋' },
    { id: 'memory', label: 'Memoria', icon: '⚡' },
    { id: 'danger', label: 'Zona Pericolo', icon: '⚠️' },
  ];

  return (
    <div className="min-h-full bg-[#f5f7fb] p-4 md:p-6 pb-24">
      <div className="mx-auto max-w-[1200px] space-y-6">
        {/* Toast Notifica di Successo */}
        {success && (
          <div className="fixed right-6 top-6 z-50 w-full max-w-sm rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg transition-all animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-sm">
                ✓
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-emerald-800">Operazione riuscita</h2>
                <p className="mt-0.5 text-xs text-emerald-700">{success}</p>
              </div>
              <button
                type="button"
                onClick={() => setSuccess(null)}
                className="rounded-full p-1 text-emerald-600 transition hover:bg-emerald-100"
                aria-label="Chiudi"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Banner Notifica di Errore */}
        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold text-sm">
                !
              </div>
              <div>
                <h2 className="text-sm font-bold text-rose-800">Attenzione</h2>
                <p className="mt-0.5 text-xs text-rose-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* HEADER SEMPLIFICATO (Solo Impostazioni Utente) */}
        <section className={`${panelClass} p-6`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <SettingsIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Impostazioni Utente
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Personalizza il tuo profilo, la gerarchia dei task e la memoria locale.
              </p>
            </div>
          </div>
        </section>

        {/* SELETTORE TAB ADATTIVO (Senza Scrollbar) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 w-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition focus:outline-none ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white/90 border border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900 shadow-sm'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CORPO DELLA SCHEDA ATTIVA (Nessun form nidificato) */}
        <div className="space-y-6">
          <div className={`${panelClass} p-6 lg:p-8 animate-fadeIn min-h-[300px]`}>
            {activeTab === 'profile' && (
              <ProfileSection
                settings={settings}
                email={form.email}
                onEmailChange={(val) => setForm((prev) => ({ ...prev, email: val }))}
                onChangePasswordSubmit={handleChangePasswordSubmit}
                disabled={saving}
              />
            )}

            {activeTab === 'tasks' && (
              <TaskHierarchySection
                maxDepth={form.maxDepth}
                onMaxDepthChange={(val) => setForm((prev) => ({ ...prev, maxDepth: val }))}
                disabled={saving}
              />
            )}

            {activeTab === 'memory' && (
              <MemorySection
                onClearClientCache={handleClearClientCache}
                isClearing={isClearingCache}
              />
            )}

            {activeTab === 'danger' && (
              <DangerZoneSection
                onDeactivateAccount={handleDeactivateAccount}
                isDeleting={deactivating}
              />
            )}
          </div>

          {/* BARRA INFERIORE PULSANTI (Dimensioni Identiche) */}
          <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur border-t border-slate-200/80 p-4 shadow-lg flex items-center justify-end gap-3 px-6 sm:px-12">
            <button
              type="button"
              onClick={handleResetForm}
              disabled={!hasChanges || saving}
              className="w-40 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-center transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Reimposta
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!hasChanges || saving}
              className="w-40 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white text-center transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving && <LoadingIcon className="w-3.5 h-3.5 animate-spin" />}
              {saving ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;