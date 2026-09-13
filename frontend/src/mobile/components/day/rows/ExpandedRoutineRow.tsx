// src/mobile/components/day/rows/ExpandedRoutineRow.tsx
import React from 'react';
import { CheckIcon } from '@/components/shared/utils/Icons';
import { useLongPress } from '@/mobile/hooks/useLongPress';
import type { RoutineItem } from '@/components/day/RoutineColumn';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';

export interface ExpandedRoutineRowProps {
  routine: RoutineItem;
  isSelected: boolean;
  isSelectionMode: boolean;
  onToggleSelect: (id: number) => void;
  onOpenDetail: (r: RoutineItem) => void;
  onUpdateRoutine: (id: number, delta: number) => void;
}

export const ExpandedRoutineRow: React.FC<ExpandedRoutineRowProps> = ({
  routine,
  isSelected,
  isSelectionMode,
  onToggleSelect,
  onOpenDetail,
  onUpdateRoutine,
}) => {
  const isCompleted = routine.currentCompletions >= routine.targetCompletions;
  const isSingle = routine.targetCompletions === 1;

  const longPressHandlers = useLongPress({
    onLongPress: () => onToggleSelect(routine.id),
    onClick: () => {
      if (isSelectionMode) {
        onToggleSelect(routine.id);
      } else {
        onOpenDetail(routine);
      }
    },
  });

  return (
    <div
      {...longPressHandlers}
      className={`relative h-20 w-full rounded-2xl overflow-hidden shadow-xs border cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between px-4 select-none ${
        isSelected
          ? 'ring-2 ring-blue-400 ring-inset border-blue-400 shadow-[0_0_14px_rgba(59,130,246,0.5)] relative z-10'
          : 'border-gray-200 hover:border-purple-400'
      } ${isCompleted && !isSelected ? 'opacity-75 grayscale-[25%]' : ''}`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${routine.imageUrl || DEFAULT_COVER_IMAGE})`,
          backgroundPosition: routine.immaginePosizione || 'center',
        }}
      />
      <div
        className={`absolute inset-0 transition-colors ${
          isCompleted
            ? 'bg-black/65'
            : 'bg-gradient-to-r from-black/85 via-black/55 to-black/40'
        }`}
      />

      <div className="relative z-10 flex-1 min-w-0 pr-3 pointer-events-none">
        <h4
          className={`text-sm font-extrabold uppercase tracking-wide truncate transition-colors drop-shadow-sm ${
            isCompleted ? 'text-gray-300 line-through' : 'text-white'
          }`}
        >
          {routine.title}
        </h4>
      </div>

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
};
