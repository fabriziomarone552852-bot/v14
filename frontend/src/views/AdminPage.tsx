// src/views/AdminPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

import type { SystemConfigItem, SystemConfigCodeItem, SystemUserItem } from '@/api/adminApi';
import { fetchSystemConfigs, fetchSystemCodes, fetchSystemUsers } from '@/api/adminApi';

import { AdminConfigSection } from '@/components/admin/AdminConfigSection';
import { AdminCodesSection } from '@/components/admin/AdminCodesSection';
import { AdminUsersSection } from '@/components/admin/AdminUsersSection';
import { AdminSystemHealthSection } from '@/components/admin/AdminSystemHealthSection';

type AdminTab = 'config' | 'codes' | 'users' | 'health';

const AdminPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Sicurezza: Reindirizza utenti non superuser
  if (!isAuthenticated || !user?.is_superuser) {
    return <Navigate to="/" replace />;
  }

  const [activeTab, setActiveTab] = useState<AdminTab>('config');
  const [configs, setConfigs] = useState<SystemConfigItem[]>([]);
  const [codes, setCodes] = useState<SystemConfigCodeItem[]>([]);
  const [users, setUsers] = useState<SystemUserItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
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
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Errore durante il caricamento dei dati di amministrazione.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="mx-auto flex min-h-full max-w-[1400px] flex-col gap-6 p-4 md:p-6">
      {/* Intestazione */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-indigo-100 p-2 text-xl text-indigo-700">🛡️</span>
            <h1 className="text-xl font-extrabold text-slate-900">Pannello Amministrazione SuperUser (SU)</h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Gestione centralizzata delle configurazioni di sistema, variabili globali, codici vocabolari ed utenti.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-50"
        >
          {loading ? 'Caricamento...' : '🔄 Aggiorna Dati'}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          ⚠️ {error}
        </div>
      )}

      {/* Schede / Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
            activeTab === 'config'
              ? 'border-sky-600 font-bold text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>⚙️</span>
          <span>Variabili (`Config`) ({configs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('codes')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
            activeTab === 'codes'
              ? 'border-sky-600 font-bold text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>🏷️</span>
          <span>Codici (`ConfigCodes`) ({codes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
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
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
            activeTab === 'health'
              ? 'border-sky-600 font-bold text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>🔍</span>
          <span>Diagnostica & Status</span>
        </button>
      </div>

      {/* Contenuto Tab */}
      {loading ? (
        <div className="py-12 text-center text-xs font-medium text-slate-400">
          Caricamento informazioni riservate al SuperUser...
        </div>
      ) : (
        <div className="flex-1">
          {activeTab === 'config' && <AdminConfigSection configs={configs} onRefresh={loadData} />}
          {activeTab === 'codes' && <AdminCodesSection codes={codes} onRefresh={loadData} />}
          {activeTab === 'users' && <AdminUsersSection users={users} onRefresh={loadData} />}
          {activeTab === 'health' && <AdminSystemHealthSection />}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
