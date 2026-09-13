// src/mobile/components/modals/routine/MobileHabitPeriodsHistory.tsx
import React from 'react';

export interface FormattedPeriodItem {
  id: number;
  start: string;
  end: string;
  target: number;
}

interface MobileHabitPeriodsHistoryProps {
  periods: FormattedPeriodItem[];
}

export const MobileHabitPeriodsHistory: React.FC<MobileHabitPeriodsHistoryProps> = ({ periods }) => {
  if (periods.length === 0) return null;

  return (
    <div className="flex flex-col">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
        Cronologia Obiettivi
      </h4>
      <div className="max-h-40 overflow-y-auto custom-scrollbar bg-gray-50 border border-gray-200/80 rounded-2xl p-3 shadow-inner">
        <div className="space-y-2">
          {periods.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center justify-between bg-white border border-gray-200/80 rounded-xl p-2.5 shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs">
                  {p.target}x
                </div>
                <div className="text-xs font-medium text-gray-700">
                  Dal {p.start} al {p.end}
                </div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  idx === 0
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {idx === 0 ? 'Attuale' : 'Storico'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileHabitPeriodsHistory;
