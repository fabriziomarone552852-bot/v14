// src/mobile/components/modals/MobileBingoModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import type { DbBingoEntry } from '@/types/yearlyentries';
import { useMobileBingoLogic } from '@/mobile/hooks/useMobileBingoLogic';
import { MobileBingoHeader } from './bingo/MobileBingoHeader';
import { MobileBingoGridSlot } from './bingo/MobileBingoGridSlot';
import { MobileBingoExpandedCard } from './bingo/MobileBingoExpandedCard';

interface MobileBingoModalProps {
  isOpen: boolean;
  onClose: () => void;
  cells: DbBingoEntry[];
  onCreateCell: (testo: string, posizione?: number) => Promise<void>;
  onUpdateText: (id: number, testo: string) => Promise<void>;
  onToggleDone: (id: number, done: boolean) => Promise<void>;
  onDeleteCell: (id: number) => Promise<void>;
}

export const MobileBingoModal: React.FC<MobileBingoModalProps> = ({
  isOpen,
  onClose,
  cells,
  onCreateCell,
  onUpdateText,
  onToggleDone,
  onDeleteCell,
}) => {
  const {
    expandedState,
    setExpandedState,
    completedCount,
    isExpandedDone,
    expandedRotation,
    startLongPress,
    cancelLongPress,
    endLongPress,
    handleCollapse,
    handleDelete,
    handleEmptySlotClick,
  } = useMobileBingoLogic({
    cells,
    onCreateCell,
    onUpdateText,
    onToggleDone,
    onDeleteCell,
  });

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col h-[100dvh] w-full overflow-hidden select-none animate-fadeIn">
      {/* 1. HEADER MODALE FULLSCREEN */}
      <MobileBingoHeader
        completedCount={completedCount}
        onClose={onClose}
      />

      {/* 2. CORPO MODALE FULLSCREEN (Griglia 5x5 con Card Allargata su Tutta la Griglia) */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-md aspect-square flex flex-col items-center justify-center">
          {/* Griglia 5x5 */}
          <div className="grid grid-cols-5 gap-2 w-full h-full p-1">
            {Array.from({ length: 25 }, (_, index) => {
              const pos = index + 1;
              const cell = cells.find((c) => c.posizione === pos);
              return (
                <MobileBingoGridSlot
                  key={cell ? `cell-${cell.id}` : `empty-${pos}`}
                  pos={pos}
                  cell={cell}
                  onStartLongPress={startLongPress}
                  onEndLongPress={endLongPress}
                  onCancelLongPress={cancelLongPress}
                  onEmptyClick={handleEmptySlotClick}
                />
              );
            })}
          </div>

          {/* CARD ALLARGATA SU TUTTA LA GRIGLIA */}
          {expandedState && (
            <MobileBingoExpandedCard
              expandedState={expandedState}
              setExpandedState={setExpandedState}
              isExpandedDone={isExpandedDone}
              expandedRotation={expandedRotation}
              onDelete={handleDelete}
              onCollapse={handleCollapse}
            />
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MobileBingoModal;
