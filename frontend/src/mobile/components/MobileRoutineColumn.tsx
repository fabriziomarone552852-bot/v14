// src/mobile/components/MobileRoutineColumn.tsx
import React, { useRef, useMemo } from 'react';
import type { RoutineItem } from '@/components/day/RoutineColumn';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { RepeatIcon } from '@/components/shared/utils/Icons';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import { MobileRoutineCardItem } from './routine/MobileRoutineCardItem';

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
          {visibleCompactRoutines.map((routine) => (
            <MobileRoutineCardItem
              key={routine.id}
              routine={routine}
              onUpdateRoutine={onUpdateRoutine}
              onSelectRoutine={onSelectRoutine}
            />
          ))}

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
