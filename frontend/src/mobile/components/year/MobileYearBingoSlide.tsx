// src/mobile/components/year/MobileYearBingoSlide.tsx
import React from 'react';
import type { DbBingoEntry, DbYearlyEntry } from '@/types/yearlyentries';
import MiniBingoCard from '@/components/year/MiniBingoCard';
import MobileYearResolutionsColumn from '../MobileYearResolutionsColumn';

interface MobileYearBingoSlideProps {
  activePageIndex: 0 | 1;
  cells: DbBingoEntry[];
  onOpenBingoModal: () => void;
  propositi: DbYearlyEntry[];
  onAddProposito: () => Promise<void>;
  onUpdateProposito: (id: number, text: string) => Promise<void>;
  onDeleteProposito: (id: number) => Promise<void>;
}

export const MobileYearBingoSlide: React.FC<MobileYearBingoSlideProps> = ({
  activePageIndex,
  cells,
  onOpenBingoModal,
  propositi,
  onAddProposito,
  onUpdateProposito,
  onDeleteProposito,
}) => {
  return (
    <div
      className={`absolute inset-0 w-full h-full flex flex-col gap-2.5 overflow-hidden transition-transform duration-300 ease-out ${
        activePageIndex === 1
          ? 'translate-x-0 pointer-events-auto'
          : 'translate-x-full pointer-events-none'
      }`}
    >
      {/* MINI BINGO CENTRATO IN ALTO */}
      <div className="flex justify-center w-full shrink-0">
        <MiniBingoCard
          cells={cells}
          onOpenModal={onOpenBingoModal}
        />
      </div>

      {/* COLONNA ADATTATA DEI BUONI PROPOSITI */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <MobileYearResolutionsColumn
          propositi={propositi}
          onAdd={onAddProposito}
          onUpdate={onUpdateProposito}
          onDelete={onDeleteProposito}
        />
      </div>
    </div>
  );
};

export default MobileYearBingoSlide;
