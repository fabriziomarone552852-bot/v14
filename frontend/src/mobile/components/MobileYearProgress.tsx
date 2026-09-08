// src/mobile/components/MobileYearProgress.tsx
import React from 'react';

interface MobileYearProgressProps {
  progress: number;
}

export const MobileYearProgress: React.FC<MobileYearProgressProps> = ({ progress }) => {
  return (
    <div className="w-full relative py-1 shrink-0 select-none">
      {/* 1. Barra di avanzamento verde sottile */}
      <div className="w-full h-2 bg-gray-200/90 rounded-full overflow-hidden shadow-inner border border-gray-300/40">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out shadow-xs"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>

      {/* 2. Badge percentuale fisso e centrato in sovrapposizione */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="px-2.5 py-0.5 bg-white border-2 border-emerald-500 rounded-full shadow-md flex items-center gap-0.5">
          <span className="text-[11px] font-black text-emerald-700 tracking-tight leading-none">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default MobileYearProgress;
