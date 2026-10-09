// src/components/admin/AdminSystemHealthSection.tsx
import React, { useEffect, useState } from 'react';
import type { SystemDiagnosticsData } from '@/api/adminApi';
import { fetchSystemDiagnosticsAdmin } from '@/api/adminApi';
import { extractErrorMessage } from '@/utils/errorUtils';

export const AdminSystemHealthSection: React.FC = () => {
  const [diagData, setDiagData] = useState<SystemDiagnosticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSystemDiagnosticsAdmin();
      setDiagData(res);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Impossibile contattare l'endpoint di diagnostica."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkHealth();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">🔍 Diagnostica & System Health</h3>
          <p className="text-xs text-slate-500">
            Verifica lo stato operativo del database, i tempi di risposta e l&apos;utilizzo dello storage sul server.
          </p>
        </div>
        <button
          type="button"
          onClick={checkHealth}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Verifica in corso...' : '🔄 Ricarica Metriche'}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
          ❌ {error}
        </div>
      )}

      {diagData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Database Status & Latency */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Database Engine</span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-lg font-extrabold text-slate-900">{diagData.db_dialect.toUpperCase()}</div>
            <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2 font-mono">
              <span>Latenza query:</span>
              <span className="font-bold text-emerald-600">{diagData.db_latency_ms} ms</span>
            </div>
          </div>

          {/* Card 2: Utenti Totali & Attivi */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Utenti</span>
            <div className="text-lg font-extrabold text-slate-900">{diagData.users_total} Registrati</div>
            <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2">
              <span className="text-emerald-700 font-semibold">🟢 {diagData.users_active} Attivi</span>
              <span className="text-rose-600 font-semibold">🔴 {diagData.users_deleted} Disattivati</span>
            </div>
          </div>

          {/* Card 3: Storage Uploads */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Storage Locale (Uploads)</span>
            <div className="text-lg font-extrabold text-slate-900">{diagData.uploads_total_size_mb} MB</div>
            <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2">
              <span>File memorizzati:</span>
              <span className="font-bold text-slate-800">{diagData.uploads_files_count} file</span>
            </div>
          </div>

          {/* Card 4: Tetto Nidificazione Attuale */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tetto Sottotask Globale</span>
            <div className="text-lg font-extrabold text-blue-600">{diagData.system_max_subtask_depth} Livelli Max</div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
              <span>Parametro:</span>
              <span className="font-mono">max_subtask_depth</span>
            </div>
          </div>
        </div>
      )}

      {/* Info Server & Piattaforma */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Dettagli di Connessione e Server</h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <li className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Ruolo Sessione:</span>
            <span className="font-bold text-indigo-600">🛡️ SuperUser (SU) - Permessi Completi</span>
          </li>
          <li className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Autenticazione:</span>
            <span className="font-medium text-emerald-600">JWT Bearer (Argon2 Hashed)</span>
          </li>
          <li className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Data e Ora Server (UTC):</span>
            <span className="font-mono font-medium text-slate-800">{diagData?.server_time || '-'}</span>
          </li>
          <li className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Ambiente Frontend:</span>
            <span className="font-mono font-medium text-slate-800">React 18 + Vite SPA</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSystemHealthSection;
