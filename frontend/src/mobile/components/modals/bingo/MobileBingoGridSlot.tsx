// src/mobile/components/modals/bingo/MobileBingoGridSlot.tsx
import React from 'react';
import type { DbBingoEntry } from '@/types/yearlyentries';
import { getFallbackRotation } from '@/mobile/hooks/useMobileBingoLogic';

interface MobileBingoGridSlotProps {
  pos: number;
  cell?: DbBingoEntry;
  onStartLongPress: (cell: DbBingoEntry, pos: number) => void;
  onEndLongPress: (cell: DbBingoEntry) => void;
  onCancelLongPress: () => void;
  onEmptyClick: (pos: number) => void;
}

export const MobileBingoGridSlot: React.FC<MobileBingoGridSlotProps> = ({
  pos,
  cell,
  onStartLongPress,
  onEndLongPress,
  onCancelLongPress,
  onEmptyClick,
}) => {
  if (cell) {
    // 1. Casella completata (Timbro stella con rotazione)
    if (cell.done) {
      const rotDeg =
        typeof cell.rotazione === 'number'
          ? cell.rotazione
          : getFallbackRotation(cell.id, pos);

      return (
        <div
          onTouchStart={() => onStartLongPress(cell, pos)}
          onTouchEnd={() => onEndLongPress(cell)}
          onTouchMove={onCancelLongPress}
          onMouseDown={() => onStartLongPress(cell, pos)}
          onMouseUp={() => onEndLongPress(cell)}
          onMouseLeave={onCancelLongPress}
          className="aspect-square border border-gray-200/90 rounded-2xl flex items-center justify-center p-1.5 cursor-pointer relative overflow-hidden bg-gray-50/80 shadow-2xs active:scale-[0.97] transition-all select-none"
          title="Clicca per rimuovere completamento • Tieni premuto per allargare"
        >
          <span className="text-[10px] text-center text-gray-400 font-medium leading-tight opacity-40 select-none line-clamp-3">
            {cell.testo}
          </span>
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300"
            style={{ transform: `rotate(${rotDeg}deg)` }}
          >
            <img
              src="/stamp-star.png"
              alt="✓"
              className="w-4/5 h-4/5 object-contain opacity-90"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(200,0,0,0.3))' }}
            />
          </div>
        </div>
      );
    }

    // 2. Casella con testo non completata
    return (
      <div
        onTouchStart={() => onStartLongPress(cell, pos)}
        onTouchEnd={() => onEndLongPress(cell)}
        onTouchMove={onCancelLongPress}
        onMouseDown={() => onStartLongPress(cell, pos)}
        onMouseUp={() => onEndLongPress(cell)}
        onMouseLeave={onCancelLongPress}
        className="aspect-square border border-blue-200/90 bg-blue-50/40 rounded-2xl flex items-center justify-center p-1.5 cursor-pointer shadow-2xs relative active:scale-[0.97] transition-all hover:border-blue-300 select-none"
        title="Clicca per completare • Tieni premuto per allargare"
      >
        <span className="text-[10px] sm:text-[11px] text-center text-gray-800 font-semibold leading-tight select-none line-clamp-3">
          {cell.testo}
        </span>
      </div>
    );
  }

  // 3. Casella vuota (+)
  return (
    <div
      onClick={() => onEmptyClick(pos)}
      className="aspect-square border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50/50 rounded-2xl flex items-center justify-center cursor-pointer active:scale-95 transition-all group select-none"
      title="Tocca per aggiungere un obiettivo"
    >
      <span className="text-gray-300 group-hover:text-blue-500 text-xl font-bold">
        +
      </span>
    </div>
  );
};

export default MobileBingoGridSlot;
