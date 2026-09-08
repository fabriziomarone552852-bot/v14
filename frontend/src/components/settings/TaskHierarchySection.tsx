// src/components/settings/TaskHierarchySection.tsx
import React from 'react';

interface TaskHierarchySectionProps {
  maxDepth: number | '';
  onMaxDepthChange: (value: number | '') => void;
  disabled?: boolean;
}

export const TaskHierarchySection: React.FC<TaskHierarchySectionProps> = ({
  maxDepth,
  onMaxDepthChange,
  disabled = false,
}) => {
  const MIN_LIMIT = 1;
  const MAX_LIMIT = 10;
  const numericValue = typeof maxDepth === 'number' ? Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, maxDepth)) : 3;

  const keyBenchmarks = [
    { value: 1, label: '1 (Minimo)', desc: 'Nessun sotto-task' },
    { value: 3, label: '3 (Consigliato)', desc: 'Standard bilanciato' },
    { value: 6, label: '6 (Avanzato)', desc: 'Progetti articolati' },
    { value: 10, label: '10 (Massimo)', desc: 'Nidificazione profonda' },
  ];

  // Calcolo percentuale progressiva per colorare la barra in modo fluido
  const percent = ((numericValue - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-slate-900">Gerarchia Task & Alberatura</h3>
        </div>
        <p className="text-sm text-slate-500 mt-0.5">
          Configura quanti livelli di sottotask annidate puoi creare.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 space-y-6">
        
        {/* Header Sezione con Input e Livello */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label htmlFor="settings-max-depth" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Profondità Massima Sottotask
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Valore compreso tra 1 (solo task radice) e 10 livelli di profondità.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="settings-max-depth"
              type="number"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              value={maxDepth}
              disabled={disabled}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  onMaxDepthChange('');
                } else {
                  const n = Number(val);
                  if (n >= MIN_LIMIT && n <= MAX_LIMIT) {
                    onMaxDepthChange(n);
                  }
                }
              }}
              className="w-20 px-3 py-2 text-center font-extrabold text-blue-600 text-lg rounded-xl border border-slate-200 bg-white shadow-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            />
            <span className="text-xs font-bold text-slate-600">livelli</span>
          </div>
        </div>

        {/* Slidebar Fluida & Reattiva */}
        <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Livello 1 (Min)</span>
            <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {numericValue} {numericValue === 1 ? 'Livello' : 'Livelli'}
            </span>
            <span>Livello 10 (Max)</span>
          </div>

          <div className="relative py-2 flex items-center">
            <input
              type="range"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              step={1}
              value={numericValue}
              disabled={disabled}
              onChange={(e) => onMaxDepthChange(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #2563eb 0%, #3b82f6 ${percent}%, #e2e8f0 ${percent}%, #e2e8f0 100%)`,
              }}
              className="w-full h-3 rounded-full appearance-none cursor-pointer focus:outline-none transition-all duration-150 slider-fluid"
            />
          </div>

          {/* Pulsanti Benchmark Rapidi */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
            {keyBenchmarks.map((bench) => {
              const isSelected = numericValue === bench.value;
              return (
                <button
                  key={bench.value}
                  type="button"
                  onClick={() => onMaxDepthChange(bench.value)}
                  disabled={disabled}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs">{bench.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{bench.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Esempio / Anteprima Struttura Albero a Cascata */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
            <span>Esempio Struttura Gerarchica ({numericValue} {numericValue === 1 ? 'Livello' : 'Livelli'})</span>
            <span className="text-[11px] font-semibold text-blue-600">
              {numericValue === 1 ? 'Nessun sotto-task' : `Fino a ${numericValue - 1} sotto-attività annidate`}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs text-slate-700 space-y-1.5 overflow-x-auto border border-slate-100">
            <div className="font-bold text-blue-700 flex items-center gap-1.5">
              <span>📋</span> Livello 1: Task Principale (Radice)
            </div>
            {Array.from({ length: Math.min(numericValue - 1, 4) }, (_, i) => (
              <div key={i} style={{ paddingLeft: `${(i + 1) * 16}px` }} className="text-slate-600 flex items-center gap-1.5">
                <span className="text-slate-400">└─</span>
                <span>📌 Sotto-task Livello {i + 2}</span>
              </div>
            ))}
            {numericValue > 5 && (
              <div style={{ paddingLeft: '80px' }} className="text-slate-400 italic text-[11px]">
                └─ ... fino a Sotto-task Livello {numericValue}
              </div>
            )}
          </div>
        </div>

        {/* Box informativo */}
        <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/60 border border-blue-100 p-3 text-xs text-blue-800">
          <span className="text-base leading-none">💡</span>
          <div>
            <p className="font-semibold">Come funziona il limite effettivo:</p>
            <p className="mt-0.5 text-blue-700">
              Se l&apos;amministratore imposta un tetto globale di sistema, il valore effettivo applicato sarà automaticamente il minimo tra la tua preferenza e quella globale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskHierarchySection;
