// src/mobile/components/mood/MobileMoodEventHeader.tsx
import React from 'react';
import { PlusIcon } from '@/components/shared/utils/Icons';

interface MobileMoodEventHeaderProps {
  title: string;
  primaParola: string;
  secondaParola?: string;
  titleColor: string;
  borderTheme: string;
  onAddClick: () => void;
}

export const MobileMoodEventHeader: React.FC<MobileMoodEventHeaderProps> = ({
  title,
  primaParola,
  secondaParola,
  titleColor,
  borderTheme,
  onAddClick,
}) => {
  return (
    <div className="flex items-center justify-between text-center px-3 py-2 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl shrink-0">
      <h3
        className={`flex gap-1.5 text-xs sm:text-sm font-black tracking-wider uppercase select-none ${titleColor}`}
      >
        <span>{primaParola}</span>
        {secondaParola && <span>{secondaParola}</span>}
      </h3>

      {/* TASTO '+' NELL'INTESTAZIONE */}
      <button
        type="button"
        onClick={onAddClick}
        className={`p-1 rounded-xl border transition-all flex items-center justify-center w-7 h-7 cursor-pointer active:scale-90 ${borderTheme}`}
        title={`Aggiungi ${title}`}
        aria-label={`Aggiungi ${title}`}
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default MobileMoodEventHeader;
