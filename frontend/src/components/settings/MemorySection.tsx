// src/components/settings/MemorySection.tsx
import React, { useMemo, useState } from 'react';
import type { MemoryDiagnostics } from '@/types/settings';

interface MemorySectionProps {
  onClearClientCache: () => void;
  isClearing?: boolean;
}

export const MemorySection: React.FC<MemorySectionProps> = ({
  onClearClientCache,
  isClearing = false,
}) => {
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const diagnostics: MemoryDiagnostics = useMemo(() => {
    let totalBytes = 0;
    let keyCount = 0;
    try {
      keyCount = localStorage.length;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key) ?? '';
          totalBytes += (key.length + val.length) * 2; // UTF-16
        }
      }
    } catch {
      totalBytes = 0;
    }

    return {
      localStorageUsedKb: Math.max(1, Math.round(totalBytes / 1024)),
      localStorageKeysCount: keyCount,
      cachedHotDataCount: keyCount,
      lastInspectionTime: lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  }, [lastRefreshed]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Memoria & Cache Locale</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Stato della memoria client utilizzata per mantenere l&apos;applicazione reattiva ed eseguire operazioni istantanee.
        </p>
      </div>

      {/* Schede di Diagnostica Rapida */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Spazio Locale Occupato
          </p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900">
              {diagnostics.localStorageUsedKb}
            </span>
            <span className="text-xs font-bold text-slate-500">KB</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Dati caldi in memoria
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Elementi Chiave
          </p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900">
              {diagnostics.localStorageKeysCount}
            </span>
            <span className="text-xs font-bold text-slate-500">slot</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Sessione e token attivi
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Stato Sincronizzazione
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-base font-bold text-emerald-700">Sincronizzato</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Ultimo controllo: {diagnostics.lastInspectionTime}
          </p>
        </div>
      </div>

      {/* Azione di Manutenzione Cache */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Risincronizza Mazzo di Carte</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Pulisce la cache temporanea locale e riscarica i dati freschi dal server senza perdere la sessione.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onClearClientCache();
            setLastRefreshed(new Date());
          }}
          disabled={isClearing}
          className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200 shadow-sm focus:outline-none"
        >
          {isClearing ? 'Pulizia in corso...' : 'Svuota Cache & Ricarica'}
        </button>
      </div>
    </div>
  );
};

export default MemorySection;
