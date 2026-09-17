// src/components/admin/AdminSystemHealthSection.tsx
import React, { useEffect, useState } from 'react';
import { pingAdmin, seedShoppingDataAdmin } from '@/api/adminApi';
import { extractErrorMessage } from '@/utils/errorUtils';

export const AdminSystemHealthSection: React.FC = () => {
  const [pingData, setPingData] = useState<{ message: string; timestamp: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

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

  const handleSeedProducts = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    setSeedError(null);
    try {
      const res = await seedShoppingDataAdmin();
      setSeedResult(res.message);
    } catch (err: unknown) {
      setSeedError(extractErrorMessage(err, "Errore durante il popolamento dei prodotti."));
    } finally {
      setIsSeeding(false);
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

        {/* Card Azione Popolamento Prodotti Spesa */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 col-span-1 sm:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">🛒 Catalogo Spesa & Prodotti Predefiniti</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Popola o ripristina nel database i prodotti predefiniti (da `shopping_products.csv`), i supermercati/marchi e lo storico prezzi dei lotti.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSeedProducts}
              disabled={isSeeding}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isSeeding ? 'Popolamento in corso...' : '⚡ Popola Catalogo Prodotti'}
            </button>
          </div>
          {seedResult && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
              ✅ {seedResult}
            </div>
          )}
          {seedError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              ❌ {seedError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

