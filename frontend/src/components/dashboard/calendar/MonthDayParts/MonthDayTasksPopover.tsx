// frontend/src/components/dashboard/calendar/MonthDayParts/MonthDayTasksPopover.tsx
import React, { useState, useEffect } from 'react';
import type { DbTask } from '@/types';
import { getHexColor } from '@/utils/uiUtils';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { AddButton } from '@/components/shared/utils/AddButton';

interface MonthDayTasksPopoverProps {
  dateKey: string;
  dayTasks: DbTask[];
  popoverAlignClass: string;
  onSelectTask?: (task: DbTask) => void;
  onToggleTask?: (task: DbTask, newStatus: boolean) => void;
  onAddTaskClick?: (dateStr?: string) => void;
  onAddEventClick?: (dateStr: string) => void;
  onToggle?: (isOpen: boolean) => void;
}

export const MonthDayTasksPopover: React.FC<MonthDayTasksPopoverProps> = ({
  dateKey,
  dayTasks,
  popoverAlignClass,
  onSelectTask,
  onToggleTask,
  onAddTaskClick,
  onAddEventClick,
  onToggle,
}) => {
  const [isTaskPopoverOpen, setIsTaskPopoverOpen] = useState<boolean>(false);

  useEffect(() => {
    if (onToggle) {
      onToggle(isTaskPopoverOpen);
    }
  }, [isTaskPopoverOpen, onToggle]);

  const taskPopoverRef = useOutsideClick<HTMLDivElement>(() => {
    if (isTaskPopoverOpen) setIsTaskPopoverOpen(false);
  });

  const { openUpwards: openTaskUpwards } = useDropdownPosition(taskPopoverRef, {
    isOpen: isTaskPopoverOpen,
    threshold: 280,
  });

  if (dayTasks.length === 0) return null;

  return (
    <div className="relative" ref={taskPopoverRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsTaskPopoverOpen(!isTaskPopoverOpen);
        }}
        className={`w-5 h-5 bg-white border border-gray-300 rounded-full flex justify-center items-center cursor-pointer shadow-sm hover:bg-blue-50 hover:border-blue-400 transition-all shrink-0 ${
          isTaskPopoverOpen ? 'border-blue-400 shadow-md bg-blue-50' : ''
        }`}
        title={isTaskPopoverOpen ? 'Nascondi Task' : `Mostra ${dayTasks.length} Task`}
      >
        <svg
          className={`w-3 h-3 text-blue-500 transition-transform duration-300 ${
            isTaskPopoverOpen ? 'rotate-180 text-blue-600' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* FINESTRA POPOVER TASK PER IL GIORNO */}
      {isTaskPopoverOpen && (
        <div
          className={`absolute ${
            openTaskUpwards ? 'bottom-full mb-2' : 'top-full mt-2'
          } w-60 max-h-[260px] overflow-y-auto custom-scrollbar pointer-events-auto bg-white p-2.5 rounded-xl shadow-2xl border border-gray-200 flex flex-col gap-1.5 transition-all z-[1000] ${popoverAlignClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider border-b border-gray-100 pb-1.5 flex justify-between items-center">
            <span>Task ({dayTasks.length})</span>
            <span className="text-[9px] text-gray-400 font-normal">
              {dateKey.split('-').reverse().slice(0, 2).join('/')}
            </span>
          </p>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-0.5 custom-scrollbar">
            {dayTasks.map((task) => {
              const catColor = getHexColor(task.category?.colore || '#3b82f6');
              return (
                <div
                  key={task.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTask?.(task);
                  }}
                  className={`text-[10px] rounded px-2 py-1 border-l-3 shadow-2xs flex items-center gap-2 cursor-pointer transition-all overflow-hidden shrink-0 hover:bg-blue-50/50 ${
                    task.fatto
                      ? 'bg-gray-100 text-gray-400 line-through opacity-70'
                      : 'bg-gray-50 text-gray-800 font-medium'
                  }`}
                  style={{ borderLeftColor: task.fatto ? '#9ca3af' : catColor }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleTask?.(task, !task.fatto);
                    }}
                    className={`shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                      task.fatto
                        ? 'bg-gray-400 border-gray-400 text-white'
                        : 'border-gray-300 hover:border-blue-500 bg-white'
                    }`}
                  >
                    {task.fatto && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className="truncate flex-1" title={task.titolo}>
                    {task.titolo || 'Senza Titolo'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* BOTTONE NUOVA TASK (Stile AddButton grigio tratteggiato) */}
          <div className="pt-1 border-t border-gray-100">
            <AddButton
              label="Nuova Task"
              compact={true}
              onClick={() => {
                setIsTaskPopoverOpen(false);
                if (onAddTaskClick) {
                  onAddTaskClick(dateKey);
                } else {
                  onAddEventClick?.(dateKey);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
