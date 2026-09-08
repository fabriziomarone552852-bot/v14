// src/mobile/views/MobileSettingsView.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api/apiService';
import type { UserServerSettings, UserSettingsUpdatePayload } from '@/types/settings';
import { useGoogleCalendarIntegration } from '@/hooks/useGoogleCalendarIntegration';
import MobileChangePasswordModal from '@/mobile/components/modals/MobileChangePasswordModal';
import {
  User,
  Key,
  Sliders,
  RefreshCw,
  Archive,
  CheckSquare,
  Calendar,
  FileText,
  Clock,
  Repeat,
  FolderTree,
  Tag,
  Truck,
  ShoppingBag,
  BarChart2,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Shield,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  Save,
  Loader2,
  Monitor,
} from 'lucide-react';

interface MobileSettingsViewProps {
  subview?: 'main' | 'user' | 'app' | 'sync' | 'archive';
}

export const MobileSettingsView: React.FC<MobileSettingsViewProps> = ({ subview: propSubview }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determinazione della vista attiva (principale o sottomenu)
  const currentSubview = useMemo(() => {
    if (propSubview) return propSubview;
    const path = location.pathname;
    if (path === '/settings/user' || path === '/settings/profile') return 'user';
    if (path === '/settings/app') return 'app';
    if (path === '/settings/sync') return 'sync';
    if (path === '/settings/archive' || path === '/settings/archivio') return 'archive';
    return 'main';
  }, [propSubview, location.pathname]);

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
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
  const handleSaveEmail = async () => {
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
  };

  // Cambio Password
  const handleChangePasswordSubmit = async (currentPw: string, newPw: string, confirmPw: string) => {
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
  };

  // Salvataggio Impostazioni App (Profondità albero task)
  const handleSaveMaxDepth = async (newDepth: number) => {
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
  };

  // Pulizia Cache Locale
  const handleClearCache = () => {
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
  };

  // Elenco dei moduli archiviati
  const archiveModules = [
    {
      id: 'tasks',
      title: 'Attività & Task',
      description: 'Gestisci le tue attività e i sotto-task',
      icon: <CheckSquare className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50',
      path: '/tasks',
    },
    {
      id: 'events',
      title: 'Eventi & Calendario',
      description: 'Tutti gli eventi e le ricorrenze',
      icon: <Calendar className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50',
      path: '/events',
    },
    {
      id: 'notes',
      title: 'Note & Appunti',
      description: 'Pensieri e promemoria organizzati',
      icon: <FileText className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50',
      path: '/notes',
    },
    {
      id: 'countdowns',
      title: 'Obiettivi & Countdown',
      description: 'Scadenze e traguardi importanti',
      icon: <Clock className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50',
      path: '/countdowns',
    },
    {
      id: 'habits',
      title: 'Abitudini & Routine',
      description: 'Monitoraggio e frequenze abitudini',
      icon: <Repeat className="w-5 h-5 text-cyan-600" />,
      bg: 'bg-cyan-50',
      path: '/habits',
    },
    {
      id: 'categories',
      title: 'Categorie & Ambiti',
      description: 'Ambiti di vita, colori e icone',
      icon: <FolderTree className="w-5 h-5 text-pink-600" />,
      bg: 'bg-pink-50',
      path: '/categories',
    },
    {
      id: 'tags',
      title: 'Tag & Etichette',
      description: 'Parole chiave veloci per elementi',
      icon: <Tag className="w-5 h-5 text-violet-600" />,
      bg: 'bg-violet-50',
      path: '/tags',
    },
    {
      id: 'fornitori',
      title: 'Negozi & Brand',
      description: 'Supermercati e marchi di fiducia',
      icon: <Truck className="w-5 h-5 text-orange-600" />,
      bg: 'bg-orange-50',
      path: '/fornitori',
    },
    {
      id: 'shopping-archive',
      title: 'Spesa & Liste',
      description: 'Storico liste spesa e prezzi',
      icon: <ShoppingBag className="w-5 h-5 text-lime-600" />,
      bg: 'bg-lime-50',
      path: '/shopping-archive',
    },
    {
      id: 'reviews',
      title: 'Review Mesi & Anni',
      description: 'Bilanci periodici e retrospettive',
      icon: <BarChart2 className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50',
      path: '/reviews',
    },
  ];

  // ==========================================
  // 1. SOTTOMENU: IMPOSTAZIONI UTENTE
  // ==========================================
  if (currentSubview === 'user') {
    return (
      <div className="w-full space-y-4 animate-fadeIn pb-12">
        {/* Header Sottomenu con tasto indietro */}
        <div className="flex items-center gap-3 py-1">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="p-2 -ml-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-200/80 active:scale-95 transition-all focus:outline-none flex items-center gap-1 font-semibold text-xs cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
            <span>Impostazioni</span>
          </button>
        </div>

        <div className="border-b border-gray-200 pb-3">
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Impostazioni Utente</h1>
          <p className="text-xs text-gray-500 mt-0.5">Gestisci la tua email e le credenziali di accesso</p>
        </div>

        {/* Notifica Feedback */}
        {notification && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Card Dati Account */}
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-4">
          {/* Username (Sola Lettura) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Nickname / Username
            </label>
            <div className="w-full py-2.5 px-3.5 bg-gray-50 border border-gray-200/80 rounded-xl text-sm font-bold text-gray-800">
              {displayUsername}
            </div>
            </div>

          {/* Email Modificabile */}
          <div>
            <label htmlFor="mobile-settings-email" className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
              Indirizzo Email
            </label>
            <div className="flex gap-2">
              <input
                id="mobile-settings-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="esempio@dominio.it"
                disabled={loading || savingUser}
                className="flex-1 min-w-0 py-2.5 px-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all disabled:bg-gray-100"
              />
              <button
                type="button"
                onClick={handleSaveEmail}
                disabled={loading || savingUser}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {savingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Salva</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card Sicurezza Password */}
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Sicurezza & Password</h3>
                <p className="text-xs text-gray-500">Aggiorna la tua chiave di accesso</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="py-2 px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Modifica
            </button>
          </div>
        </div>

        {/* Modal Cambio Password Full Screen */}
        <MobileChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onSubmit={handleChangePasswordSubmit}
          loading={passwordLoading}
        />
      </div>
    );
  }

  // ==========================================
  // 2. SOTTOMENU: IMPOSTAZIONI APP
  // ==========================================
  if (currentSubview === 'app') {
    const benchmarks = [
      { val: 1, label: '1 (Min)' },
      { val: 3, label: '3 (Consigliato)' },
      { val: 6, label: '6 (Avanzato)' },
      { val: 10, label: '10 (Max)' },
    ];

    return (
      <div className="w-full space-y-4 animate-fadeIn pb-12">
        {/* Header Sottomenu con tasto indietro */}
        <div className="flex items-center gap-3 py-1">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="p-2 -ml-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-200/80 active:scale-95 transition-all focus:outline-none flex items-center gap-1 font-semibold text-xs cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
            <span>Impostazioni</span>
          </button>
        </div>

        <div className="border-b border-gray-200 pb-3">
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Impostazioni App</h1>
          <p className="text-xs text-gray-500 mt-0.5">Gerarchia task, preferenze interfaccia e memoria locale</p>
        </div>

        {/* Notifica Feedback */}
        {notification && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Card Livello Albero Task */}
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Alberatura Sottotask</h3>
                <p className="text-xs text-gray-500">Profondità massima di sotto-attività annidate</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 font-extrabold text-sm rounded-xl shrink-0">
              {maxDepth || 3} {Number(maxDepth) === 1 ? 'livello' : 'livelli'}
            </div>
          </div>

          {/* Slidebar Fluida con Gradiente Dinamico */}
          <div className="space-y-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200/80">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
              <span>Livello 1 (Min)</span>
              <span className="text-xs font-extrabold text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-full border border-purple-200">
                {typeof maxDepth === 'number' ? maxDepth : 3} {Number(maxDepth) === 1 ? 'Livello' : 'Livelli'}
              </span>
              <span>Livello 10 (Max)</span>
            </div>

            <div className="relative py-1 flex items-center">
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={typeof maxDepth === 'number' ? maxDepth : 3}
                disabled={savingApp}
                onChange={(e) => handleSaveMaxDepth(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #7e22ce 0%, #9333ea ${(((typeof maxDepth === 'number' ? maxDepth : 3) - 1) / 9) * 100}%, #e5e7eb ${(((typeof maxDepth === 'number' ? maxDepth : 3) - 1) / 9) * 100}%, #e5e7eb 100%)`,
                }}
                className="w-full h-2.5 rounded-full appearance-none cursor-pointer focus:outline-none transition-all duration-150"
              />
            </div>

            {/* Bottoni Benchmark rapidi */}
            <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-gray-200/60">
              {benchmarks.map((b) => (
                <button
                  key={b.val}
                  type="button"
                  onClick={() => handleSaveMaxDepth(b.val)}
                  disabled={savingApp}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    maxDepth === b.val
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Anteprima Struttura Albero */}
          <div className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-xl space-y-1.5 text-xs shadow-2xs">
            <div className="flex items-center justify-between text-gray-700">
              <span className="font-bold uppercase tracking-wider text-[11px]">Esempio Struttura Albero</span>
              <span className="text-[11px] font-semibold text-purple-700">
                {Number(maxDepth) === 1 ? 'Nessun sotto-task' : `Fino a ${Number(maxDepth) - 1} sotto-task annidati`}
              </span>
            </div>
            <div className="font-bold text-purple-800 flex items-center gap-1.5 pt-1">
              <span>📋</span> Livello 1: Task Principale (Radice)
            </div>
            {Array.from({ length: Math.min((typeof maxDepth === 'number' ? maxDepth : 3) - 1, 3) }, (_, i) => (
              <div key={i} style={{ paddingLeft: `${(i + 1) * 14}px` }} className="text-gray-600 flex items-center gap-1.5 font-mono text-[11px]">
                <span className="text-gray-400">└─</span>
                <span>📌 Sotto-task Livello {i + 2}</span>
              </div>
            ))}
            {Number(maxDepth) > 4 && (
              <div style={{ paddingLeft: '56px' }} className="text-gray-400 italic text-[10px]">
                └─ ... fino a Livello {maxDepth}
              </div>
            )}
          </div>
        </div>

        {/* Card Manutenzione & Cache */}
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gray-100 text-gray-700">
              <Database className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900">Memoria & Cache Locale</h3>
              <p className="text-xs text-gray-500">Pulisci i dati temporanei salvati sul dispositivo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearCache}
            disabled={isClearingCache}
            className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isClearingCache ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>Svuota Cache Locale</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. SOTTOMENU: SINCRONIZZAZIONE (Google)
  // ==========================================
  if (currentSubview === 'sync') {
    return (
      <div className="w-full space-y-4 animate-fadeIn pb-12">
        {/* Header Sottomenu con tasto indietro */}
        <div className="flex items-center gap-3 py-1">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="p-2 -ml-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-200/80 active:scale-95 transition-all focus:outline-none flex items-center gap-1 font-semibold text-xs cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
            <span>Impostazioni</span>
          </button>
        </div>

        <div className="border-b border-gray-200 pb-3">
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Sincronizzazione</h1>
          <p className="text-xs text-gray-500 mt-0.5">Collega e sincronizza i tuoi calendari esterni</p>
        </div>

        {/* Notifica Google Sync */}
        {googleSync.message && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
              googleSync.message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {googleSync.message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{googleSync.message.text}</span>
          </div>
        )}

        {/* Card Google Calendar */}
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Google Calendar</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {googleSync.status?.is_connected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Connesso
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                      Non collegato
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pulsante Connetti / Scollega */}
            {googleSync.status?.is_connected ? (
              <button
                type="button"
                onClick={googleSync.handleDisconnect}
                disabled={googleSync.disconnecting}
                className="py-1.5 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-colors shrink-0 cursor-pointer"
              >
                {googleSync.disconnecting ? 'Disconnessione...' : 'Scollega'}
              </button>
            ) : (
              <button
                type="button"
                onClick={googleSync.handleConnect}
                disabled={googleSync.connecting}
                className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1"
              >
                {googleSync.connecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Connetti</span>
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Sincronizza in tempo reale tutti gli eventi e appuntamenti della tua Smart Agenda sul tuo calendario Google personale.
          </p>

          {googleSync.status?.is_connected && googleSync.status.google_email && (
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs font-semibold text-blue-900">
              Account collegato: <span className="font-bold">{googleSync.status.google_email}</span>
            </div>
          )}

          {/* Opzioni avanzate se connesso */}
          {googleSync.status?.is_connected && (
            <div className="pt-3 border-t border-gray-100 space-y-3">
              {/* Toggle sincronizzazione automatica */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-800">Sincronizzazione automatica</div>
                  <div className="text-[11px] text-gray-500">Invia nuovi eventi in tempo reale</div>
                </div>
                <button
                  type="button"
                  onClick={googleSync.handleToggleSync}
                  disabled={googleSync.toggling}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    googleSync.status.sync_enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      googleSync.status.sync_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Sincronizzazione massiva */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={googleSync.handleSyncAll}
                  disabled={googleSync.syncingAll}
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {googleSync.syncingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sincronizzazione in corso...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Sincronizza tutti gli eventi esistenti</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. SOTTOMENU: ARCHIVIO COMPLETO
  // ==========================================
  if (currentSubview === 'archive') {
    return (
      <div className="w-full space-y-3 animate-fadeIn pb-12">
        {/* Header Sottomenu con tasto indietro */}
        <div className="flex items-center gap-3 py-1">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="p-2 -ml-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-200/80 active:scale-95 transition-all focus:outline-none flex items-center gap-1 font-semibold text-xs cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
            <span>Impostazioni</span>
          </button>
        </div>

        <div className="border-b border-gray-200 pb-3">
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Archivio Dati</h1>
          <p className="text-xs text-gray-500 mt-0.5">Consulta e organizza tutti i dati archiviati</p>
        </div>

        {/* Lista dei 10 moduli di archiviazione a tutta larghezza */}
        <div className="w-full bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 shadow-xs overflow-hidden">
          {archiveModules.map((mod) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => navigate(mod.path)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className={`p-2 rounded-xl ${mod.bg} shrink-0`}>
                  {mod.icon}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {mod.title}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate mt-0.5">
                    {mod.description}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // 5. VISTA PRINCIPALE IMPOSTAZIONI (5 VOCI)
  // ==========================================
  return (
    <div className="w-full space-y-4 animate-fadeIn pb-12">
      {/* 1. SCHEDA PROFILO UTENTE / HEADER COMPATTO A TUTTA LARGHEZZA */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 font-extrabold text-lg shadow-2xs shrink-0">
            {displayUsername.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-extrabold text-gray-900 truncate">{displayUsername}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              {user?.is_superuser ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <ShieldCheck className="w-3 h-3 text-amber-600" /> {roleName}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                  <User className="w-3 h-3 text-gray-500" /> {roleName}
                </span>
              )}
            </div>
            {settings?.email && (
              <p className="text-xs text-gray-500 truncate mt-0.5">{settings.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. SEZIONE SUPERUSER (Se Admin) */}
      {user?.is_superuser && (
        <div className="w-full bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Pannello Amministrazione
                </h3>
                <p className="text-[11px] text-amber-700">Gestione utenti, codici e server</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <span>Apri</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. LISTA DELLE 5 VOCI PRINCIPALI A TUTTA LARGHEZZA */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 shadow-xs overflow-hidden">
        
        {/* Voce 1: Impostazioni Utente (Email & Password) */}
        <button
          type="button"
          onClick={() => navigate('/settings/user')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Impostazioni utente
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                Email e credenziali d'accesso password
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 shrink-0" />
        </button>

        {/* Voce 2: Impostazioni App (Livello albero task) */}
        <button
          type="button"
          onClick={() => navigate('/settings/app')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                Impostazioni app
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                Livello albero task e preferenze
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 shrink-0" />
        </button>

        {/* Voce 3: Sincronizzazione (Google Calendar) */}
        <button
          type="button"
          onClick={() => navigate('/settings/sync')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                <span>Sincronizzazione</span>
                {googleSync.status?.is_connected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Google Calendar Connesso" />
                )}
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                Collegamento a Google Calendar
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 shrink-0" />
        </button>

        {/* Voce 4: Archivio (Compresso nel tasto Archivio per aprire sottomenu) */}
        <button
          type="button"
          onClick={() => navigate('/settings/archive')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                Archivio
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                Task, eventi, note, categorie e altri archivi
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 shrink-0" />
        </button>

        {/* Passa a Vista Desktop PC (visibile solo su browser Desktop) */}
        {!Capacitor.isNativePlatform() && (
          <button
            type="button"
            onClick={() => {
              localStorage.setItem('smartagenda_view_mode', 'desktop');
              window.location.href = '/?mode=desktop';
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-blue-50/50 active:bg-blue-50 transition-colors text-left group cursor-pointer border-t border-gray-100"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Passa a Vista Desktop (PC)
                </div>
                <div className="text-xs text-gray-500 truncate mt-0.5">
                  Visualizza l'interfaccia completa per computer
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 shrink-0" />
          </button>
        )}

        {/* Voce 5: Esci dal profilo */}
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-rose-50/50 active:bg-rose-50 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-rose-600">
                Esci dal profilo
              </div>
              <div className="text-xs text-rose-400 truncate mt-0.5">
                Disconnetti il tuo account da questo dispositivo
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-rose-300 group-hover:text-rose-600 shrink-0" />
        </button>

      </div>

      {/* Modale / Dialogo di conferma Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Disconnessione</h3>
                <p className="text-xs text-gray-500">Sei sicuro di voler uscire dal profilo?</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={logout}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                Conferma Esci
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MobileSettingsView;
