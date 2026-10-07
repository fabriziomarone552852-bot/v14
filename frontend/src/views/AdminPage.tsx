// src/views/AdminPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

import type { SystemConfigItem, SystemConfigCodeItem, SystemUserItem } from '@/api/adminApi';
import { fetchSystemConfigs, fetchSystemCodes, fetchSystemUsers } from '@/api/adminApi';

import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import { LOADING_MESSAGES } from '@/data/loadingMessages';

import { AdminUsersSection } from '@/components/admin/AdminUsersSection';
import { AdminConfigSection } from '@/components/admin/AdminConfigSection';
import { AdminCodesSection } from '@/components/admin/AdminCodesSection';
import { AdminMaintenanceSection } from '@/components/admin/AdminMaintenanceSection';
import { AdminSystemHealthSection } from '@/components/admin/AdminSystemHealthSection';
import { AdminFeedbackSection } from '@/components/admin/AdminFeedbackSection';
import { extractErrorMessage } from '@/utils/errorUtils';

type AdminTab = 'users' | 'config' | 'codes' | 'maintenance' | 'health' | 'feedback';

const AdminPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const isSuperUser = Boolean(isAuthenticated && user?.is_superuser);

  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [configs, setConfigs] = useState<SystemConfigItem[]>([]);
  const [codes, setCodes] = useState<SystemConfigCodeItem[]>([]);
  const [users, setUsers] = useState<SystemUserItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isSuperUser) return;
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        fetchSystemConfigs(),
        fetchSystemCodes(),
        fetchSystemUsers(),
      ]);

      if (results[0].status === 'fulfilled') setConfigs(results[0].value);
      if (results[1].status === 'fulfilled') setCodes(results[1].value);
      if (results[2].status === 'fulfilled') setUsers(results[2].value);

      const rejected = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      if (rejected.length > 0) {
        const errDetail = rejected[0].reason?.response?.data?.detail || rejected[0].reason?.message || 'Errore nel caricamento';
        setError(`Errore nel caricamento: ${errDetail}`);
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Errore durante il caricamento dei dati di amministrazione.'));
    } finally {
      setLoading(false);
    }
  }, [isSuperUser]);

  useEffect(() => {
    if (isSuperUser) {
      loadData();
    }
  }, [isSuperUser, loadData]);

  // Sicurezza: Reindirizza utenti non superuser
  if (!isSuperUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto flex min-h-full max-w-[1400px] flex-col gap-6 p-4 md:p-6 pb-20">
      {/* Intestazione */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-2xl bg-indigo-100 p-2.5 text-xl text-indigo-700">🛡️</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Pannello Amministrazione SuperUser (SU)
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Gestione riservata delle identità utenti, limiti globali, vocabolari, manutenzione database e diagnostica.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Caricamento...' : '🔄 Aggiorna Dati'}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
          ⚠️ {error}
        </div>
      )}

      {/* Schede / Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 text-xs font-semibold scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'users'
              ? 'border-sky-600 font-bold text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>👥</span>
          <span>Utenti ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'config'
              ? 'border-sky-600 font-bold text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>⚙️</span>
          <span>Parametri & Limiti (`Config`) ({configs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('codes')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'codes'
              ? 'border-sky-600 font-bold text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>🏷️</span>
          <span>Vocabolari (`ConfigCodes`) ({codes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('maintenance')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'maintenance'
              ? 'border-sky-600 font-bold text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>🛠️</span>
          <span>Manutenzione & Integrità DB</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'health'
              ? 'border-sky-600 font-bold text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>🔍</span>
          <span>Diagnostica & Telemetria</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'feedback'
              ? 'border-sky-600 font-bold text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>📨</span>
          <span>Feedback & Bug Report</span>
        </button>
      </div>

      {/* Contenuto Tab */}
      {loading ? (
        <PageLoadingState messages={LOADING_MESSAGES.admin} />
      ) : (
        <div className="flex-1">
          {activeTab === 'users' && <AdminUsersSection users={users} onRefresh={loadData} />}
          {activeTab === 'config' && <AdminConfigSection configs={configs} onRefresh={loadData} />}
          {activeTab === 'codes' && <AdminCodesSection codes={codes} onRefresh={loadData} />}
          {activeTab === 'maintenance' && <AdminMaintenanceSection users={users} onRefresh={loadData} />}
          {activeTab === 'health' && <AdminSystemHealthSection />}
          {activeTab === 'feedback' && <AdminFeedbackSection />}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
