// src/mobile/components/trackers/shared/MobileTrackerGoalBar.tsx
import React from 'react';

export interface MobileTrackerGoalBarProps {
  title: string;
  current: number;
  goal: number;
  goalPercent: number;
  onOpenStats: () => void;
  statsTooltip?: string;
}

export const MobileTrackerGoalBar: React.FC<MobileTrackerGoalBarProps> = ({
  title,
  current,
  goal,
  goalPercent,
  onOpenStats,
  statsTooltip = 'Tocca per aprire le statistiche dettagliate',
}) => {
  return (
    <div
      onClick={onOpenStats}
      className="w-full px-2 py-0.5 cursor-pointer select-none active:opacity-85 shrink-0 flex flex-col gap-1"
      title={statsTooltip}
    >
      {/* RIGA SUPERIORE: Titolo a sinistra e icona statistiche a destra */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider">
          {title}
        </span>

        <div className="text-blue-600 flex items-center justify-center p-0.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
      </div>

      {/* BARRA DI PROGRESSIONE CON BADGE CENTRATO "XXX/YYY" IN SOVRAPPOSIZIONE */}
      <div className="w-full relative py-1 shrink-0">
        <div className="w-full h-2 bg-gray-200/90 rounded-full overflow-hidden border border-gray-300/40">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(Math.max(goalPercent, 0), 100)}%` }}
          />
        </div>

        {/* Badge fisso e centrato in sovrapposizione */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          <div className="px-2.5 py-0.5 bg-white border-2 border-blue-500 rounded-full shadow-xs flex items-center gap-0.5">
            <span className="text-[11px] font-black text-blue-700 tracking-tight leading-none">
              {current}/{goal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileTrackerGoalBar;
