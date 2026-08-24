// frontend/src/components/year/MiniBingoCard.tsx
import React from 'react';
import type { DbBingoEntry } from '@/types/yearlyentries';

interface MiniBingoCardProps {
  cells: DbBingoEntry[];
  onOpenModal: () => void;
}

const getFallbackRotation = (id: number, pos: number = 0): number => {
  return Math.abs((id * 137 + pos * 149) % 360);
};

export const MiniBingoCard: React.FC<MiniBingoCardProps> = ({ cells, onOpenModal }) => {
  const gridCells = Array.from({ length: 25 }, (_, index) => {
    const pos = index + 1;
    const cell = cells.find(c => c.posizione === pos);

    // Case 1: Completed cell -> Red star stamp with persistent DB rotation
    if (cell && cell.done) {
      const rotDeg = typeof cell.rotazione === 'number' ? cell.rotazione : getFallbackRotation(cell.id, pos);
      return (
        <div
          key={index}
          className="w-5.5 h-5.5 sm:w-6 sm:h-6 border border-gray-300 rounded-[3px] flex items-center justify-center relative overflow-hidden bg-gray-50 shrink-0"
        >
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300"
            style={{ transform: `rotate(${rotDeg}deg)` }}
          >
            <img
              src="/stamp-star.png"
              alt="✓"
              className="w-full h-full object-contain opacity-90"
            />
          </div>
        </div>
      );
    }

    // Case 2: Compiled/text filled cell -> Soft pastel blue square
    if (cell && cell.testo && cell.testo.trim()) {
      return (
        <div
          key={index}
          className="w-5.5 h-5.5 sm:w-6 sm:h-6 border border-sky-300 bg-sky-200 rounded-[3px] shadow-xs shrink-0"
        />
      );
    }

    // Case 3: Empty uncompiled cell -> Gray square
    return (
      <div
        key={index}
        className="w-5.5 h-5.5 sm:w-6 sm:h-6 border border-gray-200 bg-gray-100 rounded-[3px] shrink-0"
      />
    );
  });

  return (
    <div
      onClick={onOpenModal}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-2.5 w-fit cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group shrink-0"
    >
      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5 group-hover:text-blue-600 transition-colors text-center">
        BINGO
      </h3>
      <div className="grid grid-cols-5 gap-1.5">
        {gridCells}
      </div>
    </div>
  );
};

export default MiniBingoCard;
