// src/mobile/components/modals/shopping/list/MobileShoppingListProgressBar.tsx
import React from 'react';

export interface MobileShoppingListProgressBarProps {
  completedCount: number;
  totalCount: number;
  progressPercent: number;
}

export const MobileShoppingListProgressBar: React.FC<MobileShoppingListProgressBarProps> = ({
  completedCount,
  totalCount,
  progressPercent,
}) => {
  return (
    <div className="space-y-1 bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        <span>Avanzamento Spesa ({completedCount} / {totalCount})</span>
        <span className="font-extrabold text-slate-800">{progressPercent}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
        <div
          className={`h-full transition-all duration-300 ${
            progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
