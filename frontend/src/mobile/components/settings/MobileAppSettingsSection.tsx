// src/mobile/components/settings/MobileAppSettingsSection.tsx
import React from 'react';
import { Layers, Database, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { SettingsNotification } from '@/mobile/hooks/useMobileSettingsLogic';

export interface MobileAppSettingsSectionProps {
  maxDepth: number | '';
  savingApp: boolean;
  isClearingCache: boolean;
  notification: SettingsNotification | null;
  onSaveMaxDepth: (newDepth: number) => void;
  onClearCache: () => void;
}

const BENCHMARKS = [
  { val: 1, label: '1 (Min)' },
  { val: 3, label: '3 (Consigliato)' },
  { val: 6, label: '6 (Avanzato)' },
  { val: 10, label: '10 (Max)' },
];

export const MobileAppSettingsSection: React.FC<MobileAppSettingsSectionProps> = ({
  maxDepth,
  savingApp,
  isClearingCache,
  notification,
  onSaveMaxDepth,
  onClearCache,
}) => {
  const currentDepth = typeof maxDepth === 'number' ? maxDepth : 3;

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
              {currentDepth} {Number(maxDepth) === 1 ? 'Livello' : 'Livelli'}
            </span>
            <span>Livello 10 (Max)</span>
          </div>

          <div className="relative py-1 flex items-center">
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={currentDepth}
              disabled={savingApp}
              onChange={(e) => onSaveMaxDepth(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #7e22ce 0%, #9333ea ${((currentDepth - 1) / 9) * 100}%, #e5e7eb ${((currentDepth - 1) / 9) * 100}%, #e5e7eb 100%)`,
              }}
              className="w-full h-2.5 rounded-full appearance-none cursor-pointer focus:outline-none transition-all duration-150"
            />
          </div>

          {/* Bottoni Benchmark rapidi */}
          <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-gray-200/60">
            {BENCHMARKS.map((b) => (
              <button
                key={b.val}
                type="button"
                onClick={() => onSaveMaxDepth(b.val)}
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
          {Array.from({ length: Math.min(currentDepth - 1, 3) }, (_, i) => (
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
          onClick={onClearCache}
          disabled={isClearingCache}
          className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          {isClearingCache ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span>Svuota Cache Locale</span>
        </button>
      </div>
    </div>
  );
};
