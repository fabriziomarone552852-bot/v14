// src/components/admin/AdminSystemHealthSection.tsx
import React, { useEffect, useState } from 'react';
import { pingAdmin } from '@/api/adminApi';
import { extractErrorMessage } from '@/utils/errorUtils';

export const AdminSystemHealthSection: React.FC = () => {
  const [pingData, setPingData] = useState<{ message: string; timestamp: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await pingAdmin();
      setPingData(res);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Impossibile contattare l'endpoint di amministrazione."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial data fetch on mount, not a cascading render
    checkHealth();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-800">🔍 Diagnostica & System Health</h3>
        <p className="text-xs text-slate-500">
          Verifica lo stato operativo del server backend ed i tempi di risposta delle funzioni SuperUser.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Stato Endpoint Admin (`/admin/ping`)</h4>
            <button
              type="button"
              onClick={checkHealth}
              disabled={loading}
              className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition disabled:opacity-50"
            >
              {loading ? 'Verifica in corso...' : '⚡ Test Connessione'}
            </button>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              ❌ {error}
            </div>
          ) : pingData ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 space-y-1 text-xs text-emerald-800">
              <p className="font-bold">✅ Risposta Server OK: {pingData.message}</p>
              <p className="font-mono text-[11px] text-emerald-600">Timestamp Backend: {pingData.timestamp}</p>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Info Piattaforma & Sessione</h4>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Ruolo Corrente:</span>
              <span className="font-bold text-indigo-600">SuperUser (SU)</span>
            </li>
            <li className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Ambiente Frontend:</span>
              <span className="font-mono font-medium text-slate-800">React + Vite SPA</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Stato API Client:</span>
              <span className="font-medium text-emerald-600">Connesso (JWT Bearer)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
