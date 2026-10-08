// src/views/AdminPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

import type { SystemConfigItem, SystemConfigCodeItem, SystemUserItem } from '@/api/adminApi';
import { fetchSystemConfigs, fetchSystemCodes, fetchSystemUsers } from '@/api/adminApi';

import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import { LOADING_MESSAGES } from '@/data/loadingMessages';

import { AdminUsersSection } from '@/components/admin/AdminUsersSection';
import { AdminReceiptQuickEntrySection } from '@/components/admin/AdminReceiptQuickEntrySection';
import { AdminConfigSection } from '@/components/admin/AdminConfigSection';
import { AdminCodesSection } from '@/components/admin/AdminCodesSection';
import { AdminMaintenanceSection } from '@/components/admin/AdminMaintenanceSection';
import { AdminSystemHealthSection } from '@/components/admin/AdminSystemHealthSection';
import { AdminFeedbackSection } from '@/components/admin/AdminFeedbackSection';
import { extractErrorMessage } from '@/utils/errorUtils';

type AdminTab = 'users' | 'receipts' | 'config' | 'codes' | 'maintenance' | 'health' | 'feedback';

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
                Gestione riservata delle identità utenti, inserimento rapido scontrini, limiti globali, manutenzione e diagnostica.
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

      {/* Selettore Dropdown per schermi piccoli (Mobile / Tablet compatto) */}
      <div className="md:hidden">
        <label htmlFor="admin-tab-select" className="sr-only">
          Seleziona Scheda Amministrazione
        </label>
        <div className="relative">
          <select
            id="admin-tab-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as AdminTab)}
            className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-xs font-bold text-slate-800 shadow-xs focus:border-sky-500 focus:outline-hidden cursor-pointer"
          >
            <option value="users">👥 Utenti ({users.length})</option>
            <option value="receipts">🧾 Scontrini Spesa</option>
            <option value="config">⚙️ Parametri ({configs.length})</option>
            <option value="codes">🏷️ Vocabolari ({codes.length})</option>
            <option value="maintenance">🛠️ Manutenzione DB</option>
            <option value="health">🔍 Diagnostica</option>
            <option value="feedback">📨 Feedback</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Schede Orizzontali Compatte (Desktop / Tablet) con Scroll Fluido */}
      <div className="hidden md:flex overflow-x-auto border-b border-slate-200 text-xs font-semibold gap-1 pb-px">
        {[
          { id: 'users' as AdminTab, label: 'Utenti', icon: '👥', count: users.length, color: 'sky' as const },
          { id: 'receipts' as AdminTab, label: 'Scontrini Spesa', icon: '🧾', count: undefined, color: 'emerald' as const },
          { id: 'config' as AdminTab, label: 'Parametri', icon: '⚙️', count: configs.length, color: 'sky' as const },
          { id: 'codes' as AdminTab, label: 'Vocabolari', icon: '🏷️', count: codes.length, color: 'sky' as const },
          { id: 'maintenance' as AdminTab, label: 'Manutenzione DB', icon: '🛠️', count: undefined, color: 'sky' as const },
          { id: 'health' as AdminTab, label: 'Diagnostica', icon: '🔍', count: undefined, color: 'sky' as const },
          { id: 'feedback' as AdminTab, label: 'Feedback', icon: '📨', count: undefined, color: 'sky' as const },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const isEmerald = tab.color === 'emerald';

          const activeBorderAndText = isEmerald
            ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60 font-bold'
            : 'border-sky-600 text-sky-700 bg-sky-50/60 font-bold';

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 rounded-t-xl whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? activeBorderAndText
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive
                      ? isEmerald
                        ? 'bg-emerald-200/80 text-emerald-800'
                        : 'bg-sky-200/80 text-sky-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenuto Tab */}
      {loading ? (
        <PageLoadingState messages={LOADING_MESSAGES.admin} />
      ) : (
        <div className="flex-1">
          {activeTab === 'users' && <AdminUsersSection users={users} onRefresh={loadData} />}
          {activeTab === 'receipts' && <AdminReceiptQuickEntrySection />}
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
