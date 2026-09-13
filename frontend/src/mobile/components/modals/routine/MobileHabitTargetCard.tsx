// src/mobile/components/modals/routine/MobileHabitTargetCard.tsx
import React from 'react';

interface MobileHabitTargetCardProps {
  target: number;
}

export const MobileHabitTargetCard: React.FC<MobileHabitTargetCardProps> = ({ target }) => {
  return (
    <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-100 flex items-center justify-between shadow-2xs">
      <div>
        <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-0.5">
          Target Attuale
        </h4>
        <p className="text-xs text-purple-700 font-medium">
          Numero di completamenti richiesti al giorno
        </p>
      </div>
      <div className="flex items-center justify-center w-11 h-11 bg-white rounded-xl shadow-xs border border-purple-200 shrink-0">
        <span className="text-lg font-black text-purple-700">
          {target}x
        </span>
      </div>
    </div>
  );
};

export default MobileHabitTargetCard;
