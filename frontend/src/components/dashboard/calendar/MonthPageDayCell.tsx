// frontend/src/components/dashboard/calendar/MonthPageDayCell.tsx
import React, { useRef, useState } from 'react';
import { getPopoverAlignClass, getMoodCellStyles } from '@/utils/monthCellUtils';
import type { CalendarGridItem } from './MonthGrid';
import type { Category, DbTask, CalendarEvent } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { MonthDayTasksPopover } from './MonthDayParts/MonthDayTasksPopover';
import { MonthDayMoodSelector } from './MonthDayParts/MonthDayMoodSelector';
import { MonthDayEventsList } from './MonthDayParts/MonthDayEventsList';

export interface MonthPageDayCellProps {
  dateKey: string;
  dayNum: number;
  colIndex?: number; // 0=LUN, 1=MAR, ..., 5=SAB, 6=DOM
  isToday: boolean;
  items: CalendarGridItem[];
  dayTasks?: DbTask[];

  moodCategoryId?: number | null;
  allCategories?: Category[];

  onDayClick?: (dateStr: string) => void;
  onAddEventClick?: (dateStr: string) => void;
  onAddTaskClick?: (dateStr?: string) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectTask?: (task: DbTask) => void;
  onToggleTask?: (task: DbTask, newStatus: boolean) => void;

  onMoodChange?: (dateStr: string, categoryId: number | null) => void;
  onCreateNewMood?: (dateStr: string) => void;

  showMoodSelector?: boolean;
}

export const MonthPageDayCell: React.FC<MonthPageDayCellProps> = ({
  dateKey,
  dayNum,
  colIndex = 3,
  isToday,
  items,
  dayTasks = [],
  moodCategoryId = null,
  allCategories = [],
  onDayClick,
  onAddEventClick,
  onAddTaskClick,
  onSelectEvent,
  onSelectTask,
  onToggleTask,
  onMoodChange,
  onCreateNewMood: _onCreateNewMood,
  showMoodSelector = false,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: dbCategories = [] } = useCategories();
  const categoriesToUse = allCategories && allCategories.length > 0 ? allCategories : dbCategories;

  const activeMood: Category | null =
    categoriesToUse.find((c: Category) => c.id === moodCategoryId || String(c.id) === String(moodCategoryId)) || null;

  const hasItems = items.length > 0;

  const handleSingleClick = () => {
    if (clickTimeoutRef.current) return;
    clickTimeoutRef.current = setTimeout(() => {
      if (onDayClick) onDayClick(dateKey);
      clickTimeoutRef.current = null;
    }, 250);
  };

  const handleDoubleClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    if (onAddEventClick) onAddEventClick(dateKey);
  };

  const { cellBgStyle, cellBorderStyle } = getMoodCellStyles(activeMood?.colore);
  const popoverAlignClass = getPopoverAlignClass(colIndex);

  return (
    <div
      onMouseEnter={() => {
        hasItems && setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSingleClick}
      onDoubleClick={handleDoubleClick}
      style={{ ...cellBgStyle, ...cellBorderStyle }}
      className={`relative p-1 border rounded-lg cursor-pointer min-h-0 flex flex-col gap-1 group transition-colors duration-300 ${
        activeMood ? 'border-2' : 'border-gray-200 bg-gray-50 hover:bg-blue-100/50 hover:border-blue-400'
      } ${isHovered ? 'z-[1000]' : 'z-10'}`}
    >
      <div className="flex justify-between items-start w-full">
        <span
          className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${
            isToday
              ? 'bg-amber-500 text-white shadow-md ring-4 ring-amber-100 font-extrabold'
              : 'text-gray-600 font-bold group-hover:text-blue-700'
          }`}
        >
          {dayNum}
        </span>

        <div className="flex items-center gap-1">
          {/* PULSANTE FRECCIA ROTANTE TASK */}
          <MonthDayTasksPopover
            dateKey={dateKey}
            dayTasks={dayTasks}
            popoverAlignClass={popoverAlignClass}
            onSelectTask={onSelectTask}
            onToggleTask={onToggleTask}
            onAddTaskClick={onAddTaskClick}
            onAddEventClick={onAddEventClick}
          />

          {/* IL SELETTORE DINAMICO UMORE */}
          {showMoodSelector && (
            <MonthDayMoodSelector
              dateKey={dateKey}
              moodCategoryId={moodCategoryId}
              allCategories={allCategories}
              popoverAlignClass={popoverAlignClass}
              onMoodChange={onMoodChange}
            />
          )}
        </div>
      </div>

      {/* MACRO EVENTI, ORECCHIA DI PAGINA & TOOLTIP */}
      <MonthDayEventsList
        items={items}
        dateKey={dateKey}
        popoverAlignClass={popoverAlignClass}
        isHovered={isHovered}
        isMoodMenuOpen={false}
        isTaskPopoverOpen={false}
        onSelectEvent={onSelectEvent}
      />
    </div>
  );
};
