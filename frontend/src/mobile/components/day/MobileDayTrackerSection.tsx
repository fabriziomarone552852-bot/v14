// src/mobile/components/day/MobileDayTrackerSection.tsx
import React from 'react';
import { RepeatIcon, CloseIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import CountdownWidget, { type CountdownItem } from '@/components/day/CountdownWidget';
import HabitsBar, { type HabitItem } from '@/components/day/HabitsBar';
import MobileRoutineColumn from '@/mobile/components/MobileRoutineColumn';
import type { RoutineItem } from '@/components/day/RoutineColumn';
import { ExpandedRoutineRow } from './rows/ExpandedRoutineRow';

export interface MobileDayTrackerPageProps {
  widgetCountdowns: CountdownItem[];
  habits: HabitItem[];
  routines: RoutineItem[];
  onOpenCountdownHub: () => void;
  onToggleHabit: (id: number) => void;
  onAddHabitClick: () => void;
  onUpdateRoutineCount: (id: number, delta: number) => void;
  onSelectRoutine: (routine: RoutineItem) => void;
  onExpandRoutines: () => void;
}

export const MobileDayTrackerPage: React.FC<MobileDayTrackerPageProps> = ({
  widgetCountdowns,
  habits,
  routines,
  onOpenCountdownHub,
  onToggleHabit,
  onAddHabitClick,
  onUpdateRoutineCount,
  onSelectRoutine,
  onExpandRoutines,
}) => {
  return (
    <div className="w-full h-full flex flex-col gap-2.5 overflow-hidden">
      {/* 1. COUNTDOWN HERO WIDGET */}
      <div className="shrink-0">
        <CountdownWidget
          countdowns={widgetCountdowns}
          onClick={onOpenCountdownHub}
        />
      </div>

      {/* 2. HABITS BAR (ABITUDINI VELOCI TOUCH) */}
      <div className="p-1 shrink-0 flex items-center justify-center">
        <HabitsBar
          habits={habits}
          onToggleHabit={onToggleHabit}
          onAddHabitClick={onAddHabitClick}
        />
      </div>

      {/* 3. ROUTINE COLUMN MOBILE */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <MobileRoutineColumn
          routines={routines}
          onUpdateRoutine={onUpdateRoutineCount}
          onSelectRoutine={onSelectRoutine}
          onExpandClick={onExpandRoutines}
        />
      </div>
    </div>
  );
};

export interface MobileDayRoutinesExpandedProps {
  routines: RoutineItem[];
  formattedDateStr: string;
  isRoutinesSelection: boolean;
  selectedIds: (number | string)[];
  onToggleSelectRoutine: (id: number) => void;
  onOpenRoutineDetail: (routine: RoutineItem) => void;
  onUpdateRoutineCount: (id: number, delta: number) => void;
  onCloseExpanded: () => void;
}

export const MobileDayRoutinesExpanded: React.FC<MobileDayRoutinesExpandedProps> = ({
  routines,
  formattedDateStr,
  isRoutinesSelection,
  selectedIds,
  onToggleSelectRoutine,
  onOpenRoutineDetail,
  onUpdateRoutineCount,
  onCloseExpanded,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-gray-50 flex flex-col p-3 rounded-2xl animate-fadeIn shadow-2xl border border-gray-200">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
            <RepeatIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
              Tutte le Routine ({routines.length})
            </h3>
            <p className="text-xs text-gray-500 font-medium">{formattedDateStr}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCloseExpanded}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors cursor-pointer"
          title="Chiudi visualizzazione estesa"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pt-3 px-2 pb-3">
        {routines.map((routine) => (
          <ExpandedRoutineRow
            key={routine.id}
            routine={routine}
            isSelected={isRoutinesSelection && selectedIds.includes(routine.id)}
            isSelectionMode={isRoutinesSelection}
            onToggleSelect={onToggleSelectRoutine}
            onOpenDetail={(r) => {
              onCloseExpanded();
              onOpenRoutineDetail(r);
            }}
            onUpdateRoutine={onUpdateRoutineCount}
          />
        ))}

        {routines.length === 0 && (
          <div className="h-full flex items-center justify-center py-8">
            <EmptyState message="Nessuna routine in programma per questo giorno" />
          </div>
        )}
      </div>
    </div>
  );
};
