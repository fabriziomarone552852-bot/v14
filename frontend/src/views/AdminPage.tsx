// src/views/AdminPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';

import type { SystemConfigItem, SystemConfigCodeItem, SystemUserItem } from '@/api/adminApi';
import { fetchSystemConfigs, fetchSystemCodes, fetchSystemUsers } from '@/api/adminApi';

import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import { LOADING_MESSAGES } from '@/data/loadingMessages';

import { AdminUsersSection } from '@/components/admin/AdminUsersSection';
import { AdminShoppingHubSection } from '@/components/admin/AdminShoppingHubSection';
import { AdminEventsDataGridSection } from '@/components/admin/events/AdminEventsDataGridSection';
import { AdminTasksDataGridSection } from '@/components/admin/tasks/AdminTasksDataGridSection';
import { AdminConfigSection } from '@/components/admin/AdminConfigSection';
import { AdminCodesSection } from '@/components/admin/AdminCodesSection';
import { AdminMaintenanceSection } from '@/components/admin/AdminMaintenanceSection';
import { AdminSystemHealthSection } from '@/components/admin/AdminSystemHealthSection';
import { AdminFeedbackSection } from '@/components/admin/AdminFeedbackSection';
import { extractErrorMessage } from '@/utils/errorUtils';

type AdminTab =
  | 'users'
  | 'shopping'
  | 'events'
  | 'tasks'
  | 'config'
  | 'codes'
  | 'maintenance'
  | 'health'
  | 'feedback';

interface AdminTabItemDef {
  id: AdminTab;
  label: string;
  icon: string;
  count?: number;
  color: 'sky' | 'emerald' | 'violet' | 'amber';
}

const AdminPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const isSuperUser = Boolean(isAuthenticated && user?.is_superuser);
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [configs, setConfigs] = useState<SystemConfigItem[]>([]);
  const [codes, setCodes] = useState<SystemConfigCodeItem[]>([]);
  const [users, setUsers] = useState<SystemUserItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isSuperUser || isMobile) return;
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
    if (isSuperUser && !isMobile) {
      loadData();
    }
  }, [isSuperUser, isMobile, loadData]);

  // Sicurezza: Reindirizza utenti non superuser
  if (!isSuperUser) {
    return <Navigate to="/" replace />;
  }

  // Riservato all'uso Desktop: messaggio pulito per schermi mobile
  if (isMobile) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-6 text-center animate-fadeIn">
        <div className="rounded-3xl bg-amber-50 border border-amber-200 p-6 shadow-xs space-y-4">
          <div className="text-4xl">🖥️</div>
          <h2 className="text-base font-extrabold text-slate-900">
            Console Riservata all&apos;Uso Desktop
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Il Pannello di Amministrazione SuperUser (SU) e la gestione dei dati ad alta densità sono ottimizzati e riservati all&apos;accesso da PC o tablet orizzontale.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <span>Torna all&apos;App</span>
            </Link>
          </div>
        </div>
      </div>
    );
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

      {/* Schede Orizzontali Desktop con Scroll Fluido */}
      <div className="flex overflow-x-auto border-b border-slate-200 text-xs font-semibold gap-1 pb-px">
        {([
          { id: 'users', label: 'Utenti', icon: '👥', count: users.length, color: 'sky' },
          { id: 'shopping', label: 'Spesa', icon: '🛒', count: undefined, color: 'emerald' },
          { id: 'events', label: 'Eventi', icon: '📅', count: undefined, color: 'violet' },
          { id: 'tasks', label: 'Attività', icon: '✅', count: undefined, color: 'amber' },
          { id: 'config', label: 'Parametri', icon: '⚙️', count: configs.length, color: 'sky' },
          { id: 'codes', label: 'Vocabolari', icon: '🏷️', count: codes.length, color: 'sky' },
          { id: 'maintenance', label: 'Manutenzione DB', icon: '🛠️', count: undefined, color: 'sky' },
          { id: 'health', label: 'Diagnostica', icon: '🔍', count: undefined, color: 'sky' },
          { id: 'feedback', label: 'Feedback', icon: '📨', count: undefined, color: 'sky' },
        ] as AdminTabItemDef[]).map((tab) => {
          const isActive = activeTab === tab.id;
          let activeBorderAndText = 'border-sky-600 text-sky-700 bg-sky-50/60 font-bold';
          if (tab.color === 'emerald') {
            activeBorderAndText = 'border-emerald-600 text-emerald-700 bg-emerald-50/60 font-bold';
          } else if (tab.color === 'violet') {
            activeBorderAndText = 'border-violet-600 text-violet-700 bg-violet-50/60 font-bold';
          } else if (tab.color === 'amber') {
            activeBorderAndText = 'border-amber-600 text-amber-700 bg-amber-50/60 font-bold';
          }

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
                      ? 'bg-sky-200/80 text-sky-800'
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
          {activeTab === 'shopping' && <AdminShoppingHubSection />}
          {activeTab === 'events' && <AdminEventsDataGridSection />}
          {activeTab === 'tasks' && <AdminTasksDataGridSection />}
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
