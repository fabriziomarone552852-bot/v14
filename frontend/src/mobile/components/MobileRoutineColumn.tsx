// src/mobile/components/MobileRoutineColumn.tsx
import React, { useRef, useMemo } from 'react';
import type { RoutineItem } from '@/components/day/RoutineColumn';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { RepeatIcon, CheckIcon } from '@/components/shared/utils/Icons';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';
import { useResizeObserver } from '@/hooks/useResizeObserver';

interface MobileRoutineColumnProps {
  routines: RoutineItem[];
  onUpdateRoutine: (id: number, delta: number) => void;
  onSelectRoutine: (routine: RoutineItem) => void;
  onExpandClick?: () => void;
}

const ROUTINE_SLOT_HEIGHT = 88; // Altezza riga routine (~80px) + gap (8px)
const INDICATOR_HEIGHT = 28;

export const MobileRoutineColumn: React.FC<MobileRoutineColumnProps> = ({
  routines,
  onUpdateRoutine,
  onSelectRoutine,
  onExpandClick,
}) => {
  const listContainerRef = useRef<HTMLDivElement>(null);
  const { clientHeight: containerHeight } = useResizeObserver(listContainerRef, 50);

  const maxRoutinesFit = useMemo(() => {
    if (containerHeight <= 0) return 2;
    if (routines.length * ROUTINE_SLOT_HEIGHT <= containerHeight) {
      return routines.length;
    }
    const availableForItems = containerHeight - INDICATOR_HEIGHT;
    return Math.max(1, Math.floor(availableForItems / ROUTINE_SLOT_HEIGHT));
  }, [containerHeight, routines.length]);

  const visibleCompactRoutines = useMemo(() => {
    return routines.slice(0, maxRoutinesFit);
  }, [routines, maxRoutinesFit]);

  const hasMoreRoutines = routines.length > maxRoutinesFit;

  return (
    <div
      onClick={onExpandClick}
      className="flex-1 min-h-0 flex flex-col justify-between bg-white rounded-2xl border border-gray-200/90 shadow-xs p-2.5 overflow-hidden cursor-pointer active:border-purple-300 transition-colors select-none"
      title="Tocca per espandere le routine a schermo intero"
    >
      {/* Header Sezione Routine */}
      <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-purple-50 text-purple-600 shrink-0">
            <RepeatIcon className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Routine
          </h3>
          <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
            {routines.length}
          </span>
        </div>
      </div>

      {/* Contenitore Body con Misurazione Dinamica */}
      <div
        ref={listContainerRef}
        className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden pt-1.5"
      >
        <div className="flex flex-col gap-2 overflow-hidden">
          {visibleCompactRoutines.map((routine) => {
            const isCompleted = routine.currentCompletions >= routine.targetCompletions;
            const isSingle = routine.targetCompletions === 1;

            return (
              <div
                key={routine.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRoutine(routine);
                }}
                className={`relative h-20 w-full rounded-2xl overflow-hidden shadow-2xs border border-gray-200/70 hover:border-purple-300 cursor-pointer active:scale-[0.99] transition-all shrink-0 flex items-center justify-between px-3.5 ${
                  isCompleted ? 'opacity-75 grayscale-[25%]' : ''
                }`}
              >
                {/* Sfondo Immagine di Copertina */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
                  style={{
                    backgroundImage: `url(${routine.imageUrl || DEFAULT_COVER_IMAGE})`,
                    backgroundPosition: routine.immaginePosizione || 'center',
                  }}
                />

                {/* Overlay Scuro con Gradiente */}
                <div
                  className={`absolute inset-0 transition-colors ${
                    isCompleted
                      ? 'bg-black/65'
                      : 'bg-gradient-to-r from-black/85 via-black/55 to-black/40'
                  }`}
                />

                {/* Titolo Routine */}
                <div className="relative z-10 flex-1 min-w-0 pr-3 pointer-events-none">
                  <h4
                    className={`text-sm font-extrabold uppercase tracking-wide truncate transition-colors drop-shadow-sm ${
                      isCompleted ? 'text-gray-300 line-through' : 'text-white'
                    }`}
                  >
                    {routine.title}
                  </h4>
                </div>

                {/* Controlli Touch Veloci (+ / - o Check) */}
                <div
                  className="relative z-10 flex items-center gap-1.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isSingle ? (
                    <button
                      type="button"
                      onClick={() => onUpdateRoutine(routine.id, isCompleted ? -1 : 1)}
                      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-90 ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-white/60 bg-white/20 text-white hover:bg-white/40'
                      }`}
                      title={isCompleted ? 'Annulla completamento' : 'Segna come completata'}
                    >
                      {isCompleted && <CheckIcon className="w-4 h-4 text-white" />}
                    </button>
                  ) : (
                    <div className="flex items-center bg-black/45 backdrop-blur-xs rounded-xl border border-white/20 overflow-hidden shadow-xs">
                      <button
                        type="button"
                        onClick={() => onUpdateRoutine(routine.id, -1)}
                        disabled={routine.currentCompletions <= 0}
                        className="px-3 py-1.5 text-sm font-black text-white hover:bg-white/20 active:bg-white/30 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Diminuisci conteggio"
                      >
                        -
                      </button>
                      <span className="px-2 py-1.5 text-xs font-black text-white min-w-[2.8rem] text-center border-x border-white/10">
                        {routine.currentCompletions}/{routine.targetCompletions}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateRoutine(routine.id, 1)}
                        disabled={routine.currentCompletions >= routine.targetCompletions}
                        className="px-3 py-1.5 text-sm font-black text-white hover:bg-white/20 active:bg-white/30 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Aumenta conteggio"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {routines.length === 0 && (
            <div className="h-full flex items-center justify-center py-4">
              <EmptyState message="Nessuna routine impostata" />
            </div>
          )}
        </div>

        {/* Indicatore '•••' Grande se ci sono più routine */}
        {hasMoreRoutines && (
          <div className="shrink-0 h-6 flex items-center justify-center select-none pt-0.5">
            <span className="text-xl font-black tracking-widest text-purple-500 hover:text-purple-600 leading-none">
              •••
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileRoutineColumn;
