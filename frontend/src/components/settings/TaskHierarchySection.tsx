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
  const numericValue = typeof maxDepth === 'number' ? maxDepth : 3;

  const keyBenchmarks = [
    { value: 1, label: '1 (Minimo)' },
    { value: 3, label: '3 (Consigliato)' },
    { value: 6, label: '6 (Avanzato)' },
    { value: 10, label: '10 (Massimo)' },
  ];

  const getPositionPercent = (val: number) => {
    return ((val - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100;
  };

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

      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label htmlFor="settings-max-depth" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Profondità Massima Sottotask
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Valore compreso tra 1 (solo task radice con 1 livello di figli) e 10 livelli di profondità.
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
              className="w-20 px-3 py-2 text-center font-bold text-slate-900 text-base rounded-xl border border-slate-200 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            />
            <span className="text-xs font-semibold text-slate-600">livelli</span>
          </div>
        </div>

        {/* Range Slider sincronizzato al 100% con tacche matematiche */}
        <div className="space-y-3 pt-2">
          <div className="relative px-1">
            <input
              type="range"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              step={1}
              value={numericValue}
              disabled={disabled}
              onChange={(e) => onMaxDepthChange(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
            />

            {/* Tacche matematiche lungo la barra */}
            <div className="absolute top-1/2 -translate-y-1/2 left-1 right-1 pointer-events-none flex justify-between">
              {Array.from({ length: MAX_LIMIT }, (_, i) => i + 1).map((step) => {
                const isPassed = step <= numericValue;
                return (
                  <span
                    key={step}
                    className={`w-1 h-1 rounded-full ${
                      isPassed ? 'bg-blue-600' : 'bg-slate-400'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Etichette posizionate con coordinate percentuali precise */}
          <div className="relative h-6 text-[11px] font-semibold text-slate-500">
            {keyBenchmarks.map((bench) => {
              const pct = getPositionPercent(bench.value);
              const isSelected = numericValue === bench.value;
              return (
                <button
                  key={bench.value}
                  type="button"
                  onClick={() => onMaxDepthChange(bench.value)}
                  style={{
                    left: `${pct}%`,
                    transform: bench.value === MIN_LIMIT
                      ? 'translateX(0%)'
                      : bench.value === MAX_LIMIT
                      ? 'translateX(-100%)'
                      : 'translateX(-50%)',
                  }}
                  className={`absolute top-0 transition-colors cursor-pointer hover:text-blue-600 ${
                    isSelected ? 'text-blue-600 font-bold' : 'text-slate-400'
                  }`}
                >
                  {bench.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Box informativo */}
        <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/60 border border-blue-100 p-3 text-xs text-blue-800">
          <span className="text-base leading-none">💡</span>
          <div>
            <p className="font-semibold">Come funziona il limite effettivo:</p>
            <p className="mt-0.5 text-blue-700">
              Se l&apos;amministratore imposta un tetto globale di sistema (es. 5 o 10), il valore effettivo applicato sarà automaticamente il minimo tra la tua preferenza e quella globale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskHierarchySection;
