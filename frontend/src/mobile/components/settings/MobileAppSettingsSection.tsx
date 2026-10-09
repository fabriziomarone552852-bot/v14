// src/mobile/components/settings/MobileAppSettingsSection.tsx
import React from 'react';
import { Layers, Database, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { SettingsNotification } from '@/mobile/hooks/useMobileSettingsLogic';

export interface MobileAppSettingsSectionProps {
  maxDepth: number | '';
  systemMaxDepth?: number;
  savingApp: boolean;
  isClearingCache: boolean;
  notification: SettingsNotification | null;
  onSaveMaxDepth: (newDepth: number) => void;
  onClearCache: () => void;
}

export const MobileAppSettingsSection: React.FC<MobileAppSettingsSectionProps> = ({
  maxDepth,
  systemMaxDepth = 10,
  savingApp,
  isClearingCache,
  notification,
  onSaveMaxDepth,
  onClearCache,
}) => {
  const maxLimit = Math.max(1, Math.min(10, systemMaxDepth || 10));
  const currentDepth = typeof maxDepth === 'number' ? Math.max(1, Math.min(maxLimit, maxDepth)) : Math.min(3, maxLimit);

  const benchmarks = [
    { val: 1, label: '1 (Min)' },
    { val: 3, label: '3 (Std)' },
    { val: 6, label: '6 (Avanzato)' },
    { val: 10, label: '10 (Max)' },
  ].filter((b) => b.val <= maxLimit);

  if (benchmarks.length === 0 || benchmarks[benchmarks.length - 1].val < maxLimit) {
    benchmarks.push({ val: maxLimit, label: `${maxLimit} (Tetto)` });
  }

  const percent = maxLimit > 1 ? ((currentDepth - 1) / (maxLimit - 1)) * 100 : 100;

  return (
    <div className="w-full space-y-4 animate-fadeIn pb-12">
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
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
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
              <p className="text-xs text-gray-500">Profondità massima di sotto-attività annidate (Max: {maxLimit})</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 font-extrabold text-sm rounded-xl shrink-0">
            {currentDepth} {currentDepth === 1 ? 'livello' : 'livelli'}
          </div>
        </div>

        {/* Slidebar Fluida con Gradiente Dinamico */}
        <div className="space-y-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200/80">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
            <span>Livello 1 (Min)</span>
            <span className="text-xs font-extrabold text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-full border border-purple-200">
              {currentDepth} {currentDepth === 1 ? 'Livello' : 'Livelli'}
            </span>
            <span>Livello {maxLimit} (Tetto Admin)</span>
          </div>

          <div className="relative py-1 flex items-center">
            <input
              type="range"
              min={1}
              max={maxLimit}
              step={1}
              value={currentDepth}
              disabled={savingApp}
              onChange={(e) => onSaveMaxDepth(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #7e22ce 0%, #9333ea ${percent}%, #e5e7eb ${percent}%, #e5e7eb 100%)`,
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
                onClick={() => onSaveMaxDepth(b.val)}
                disabled={savingApp}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  currentDepth === b.val
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Anteprima albero minimal */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 text-xs text-gray-600 space-y-1">
          <div className="font-bold text-gray-800 flex items-center justify-between">
            <span>Struttura applicata</span>
            <span className="text-[10px] text-purple-600 font-semibold">
              {currentDepth === 1 ? 'Nessun sotto-task' : `Fino a ${currentDepth - 1} sotto-task annidati`}
            </span>
          </div>
          <div className="font-mono text-[11px] text-gray-500 pt-1">
            <div>📋 Task Radice (1)</div>
            {currentDepth > 1 && <div className="pl-3">└─ 📌 Sotto-task (2)</div>}
            {currentDepth > 2 && <div className="pl-6">└─ 📌 Sotto-task (3)</div>}
            {currentDepth > 3 && (
              <div className="pl-9 italic text-gray-400">
                └─ ... fino a Livello {currentDepth}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Gestione Memoria / Cache */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Cache Dati & Memoria</h3>
            <p className="text-xs text-gray-500">Pulisce lo storage locale temporaneo</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClearCache}
          disabled={isClearingCache}
          className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
        >
          {isClearingCache ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <RefreshCw className="w-4 h-4 text-gray-500" />
          )}
          <span>{isClearingCache ? 'Pulizia in corso...' : 'Svuota Cache Locale'}</span>
        </button>
      </div>
    </div>
  );
};

export default MobileAppSettingsSection;
