// src/mobile/components/modals/MobileBingoModal.tsx
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { DbBingoEntry } from '@/types/yearlyentries';
import { TrashIcon, CloseIcon } from '@/components/shared/utils/Icons';

interface MobileBingoModalProps {
  isOpen: boolean;
  onClose: () => void;
  cells: DbBingoEntry[];
  onCreateCell: (testo: string, posizione?: number) => Promise<void>;
  onUpdateText: (id: number, testo: string) => Promise<void>;
  onToggleDone: (id: number, done: boolean) => Promise<void>;
  onDeleteCell: (id: number) => Promise<void>;
}

interface ExpandedCardState {
  id?: number;
  pos: number;
  text: string;
  isNew: boolean;
}

const getFallbackRotation = (id: number, pos: number = 0): number => {
  return Math.abs((id * 137 + pos * 149) % 360);
};

export const MobileBingoModal: React.FC<MobileBingoModalProps> = ({
  isOpen,
  onClose,
  cells,
  onCreateCell,
  onUpdateText,
  onToggleDone,
  onDeleteCell,
}) => {
  // Stato card allargata su tutta la griglia (aperta con long-press o tap su vuota)
  const [expandedState, setExpandedState] = useState<ExpandedCardState | null>(null);

  // Timer per rilevare Long Press (~450ms)
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);

  if (!isOpen) return null;

  const completedCount = cells.filter((c) => c.done).length;

  const startLongPress = (cell: DbBingoEntry, pos: number) => {
    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(35);
      }
      setExpandedState({
        id: cell.id,
        pos,
        text: cell.testo || '',
        isNew: false,
      });
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const endLongPress = (cell: DbBingoEntry) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Singolo clic: segna completata (o toglie il completamento)
    if (!isLongPressTriggeredRef.current) {
      onToggleDone(cell.id, cell.done);
    }
  };

  const handleCollapse = async () => {
    if (!expandedState) return;
    const trimmed = expandedState.text.trim();

    if (expandedState.isNew) {
      if (trimmed) {
        await onCreateCell(trimmed, expandedState.pos);
      }
    } else if (expandedState.id) {
      const original = cells.find((c) => c.id === expandedState.id)?.testo || '';
      if (trimmed !== original) {
        await onUpdateText(expandedState.id, trimmed);
      }
    }

    setExpandedState(null);
  };

  const handleDelete = async () => {
    if (expandedState && expandedState.id) {
      await onDeleteCell(expandedState.id);
      setExpandedState(null);
    }
  };

  const currentExpandedCell = expandedState?.id
    ? cells.find((c) => c.id === expandedState.id)
    : null;

  const isExpandedDone = currentExpandedCell?.done ?? false;
  const expandedRotation = currentExpandedCell
    ? typeof currentExpandedCell.rotazione === 'number'
      ? currentExpandedCell.rotazione
      : getFallbackRotation(currentExpandedCell.id, expandedState?.pos || 0)
    : 0;

  const gridSlots = Array.from({ length: 25 }, (_, index) => {
    const pos = index + 1;
    const cell = cells.find((c) => c.posizione === pos);

    if (cell) {
      // 1. Casella completata (Timbro stella con rotazione)
      if (cell.done) {
        const rotDeg =
          typeof cell.rotazione === 'number'
            ? cell.rotazione
            : getFallbackRotation(cell.id, pos);

        return (
          <div
            key={`done-${cell.id}`}
            onTouchStart={() => startLongPress(cell, pos)}
            onTouchEnd={() => endLongPress(cell)}
            onTouchMove={cancelLongPress}
            onMouseDown={() => startLongPress(cell, pos)}
            onMouseUp={() => endLongPress(cell)}
            onMouseLeave={cancelLongPress}
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
          key={`cell-${cell.id}`}
          onTouchStart={() => startLongPress(cell, pos)}
          onTouchEnd={() => endLongPress(cell)}
          onTouchMove={cancelLongPress}
          onMouseDown={() => startLongPress(cell, pos)}
          onMouseUp={() => endLongPress(cell)}
          onMouseLeave={cancelLongPress}
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
        key={`empty-${pos}`}
        onClick={() =>
          setExpandedState({
            pos,
            text: '',
            isNew: true,
          })
        }
        className="aspect-square border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50/50 rounded-2xl flex items-center justify-center cursor-pointer active:scale-95 transition-all group select-none"
        title="Tocca per aggiungere un obiettivo"
      >
        <span className="text-gray-300 group-hover:text-blue-500 text-xl font-bold">
          +
        </span>
      </div>
    );
  });

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col h-[100dvh] w-full overflow-hidden select-none animate-fadeIn">
      {/* 1. HEADER MODALE FULLSCREEN */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/95 shrink-0 pt-[max(env(safe-area-inset-top,0px),12px)]">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider truncate">
            Bingo Card
          </h2>
          <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">
            {completedCount} / 25 completate
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer shrink-0"
          title="Chiudi"
          aria-label="Chiudi"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 2. CORPO MODALE FULLSCREEN (Griglia 5x5 con Card Allargata su Tutta la Griglia) */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-md aspect-square flex flex-col items-center justify-center">
          {/* Griglia 5x5 */}
          <div className="grid grid-cols-5 gap-2 w-full h-full p-1">
            {gridSlots}
          </div>

          {/* CARD ALLARGATA SU TUTTA LA GRIGLIA */}
          {expandedState && (
            <div
              className={`absolute inset-0 z-30 rounded-3xl border-2 border-blue-400 shadow-2xl p-4 flex flex-col justify-between animate-fadeIn select-none ${
                isExpandedDone ? 'bg-gray-50/98' : 'bg-white/98'
              } backdrop-blur-xs`}
            >
              {/* Header Card Espansa: SOLO Cestino (se esistente) e Tasto X in Alto a Destra */}
              <div className="flex items-center justify-end gap-1.5 shrink-0">
                {/* Tasto Cestino per Eliminare */}
                {!expandedState.isNew && expandedState.id && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all cursor-pointer"
                    title="Elimina card"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}

                {/* Tasto X per Salvare e Rimpicciolire */}
                <button
                  type="button"
                  onClick={handleCollapse}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer"
                  title="Salva e chiudi"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Area Centrale Textarea con Testo Ingrandito in Maniera Proporzionale */}
              <div className="flex-1 min-h-0 relative flex items-center justify-center py-4 px-2">
                {/* Timbro a Stella Ingrandito in Background se completato */}
                {isExpandedDone && (
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300"
                    style={{ transform: `rotate(${expandedRotation}deg)` }}
                  >
                    <img
                      src="/stamp-star.png"
                      alt="✓"
                      className="w-3/5 h-3/5 object-contain opacity-70"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(200,0,0,0.2))' }}
                    />
                  </div>
                )}

                <textarea
                  autoFocus
                  value={expandedState.text}
                  onChange={(e) =>
                    setExpandedState((prev) =>
                      prev ? { ...prev, text: e.target.value } : null
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCollapse();
                    }
                    if (e.key === 'Escape') {
                      setExpandedState(null);
                    }
                  }}
                  rows={4}
                  className="w-full text-center text-2xl sm:text-3xl font-black text-gray-900 bg-transparent border-none focus:ring-0 focus:outline-none resize-none placeholder-gray-400 leading-snug relative z-10 p-2"
                  placeholder="Scrivi qui il tuo obiettivo..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MobileBingoModal;
