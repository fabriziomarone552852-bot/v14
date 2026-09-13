// src/components/dashboard/calendar/MonthDayCell.tsx
import React, { useRef, useState } from 'react';
import { getHexColor } from '@/utils/uiUtils';
import { nomiMesiLungo } from '@/utils/dateUtils';
import { getPopoverAlignClass, getMoodCellStyles } from '@/utils/monthCellUtils';
import type { CalendarGridItem } from './MonthGrid';
import { CategoryGenre, type Category } from '@/types';
import { MonthDayCellMoodMenu } from './MonthDayParts/MonthDayCellMoodMenu';
import { MonthDayCellHoverTooltip } from './MonthDayParts/MonthDayCellHoverTooltip';

export interface MonthDayCellProps {
  dateKey: string;
  dayNum: number;
  colIndex?: number;
  isToday: boolean;
  items: CalendarGridItem[];

  moodCategoryId?: number | null;
  allCategories?: Category[];

  onDayClick?: (dateStr: string) => void;
  onAddEventClick?: (dateStr: string) => void;

  onMoodChange?: (dateStr: string, categoryId: number | null) => void;
  onCreateNewMood?: (dateStr: string) => void;

  showMoodSelector?: boolean;
}

export const MonthDayCell: React.FC<MonthDayCellProps> = ({
  dateKey,
  dayNum,
  colIndex,
  isToday,
  items,
  moodCategoryId = null,
  allCategories = [],
  onDayClick,
  onAddEventClick,
  onMoodChange,
  onCreateNewMood,
  showMoodSelector = false,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userMoods: Category[] = allCategories.filter((c: Category) => c.genre === CategoryGenre.MOOD);
  const activeMood: Category | null = userMoods.find((c: Category) => c.id === moodCategoryId) || null;

  const dayEvents = items.filter((i) => i.type === 'event');
  const dayTasks = items.filter((i) => i.type === 'task');
  const hasItems = dayEvents.length > 0 || dayTasks.length > 0;
  const multiDayItems = items.filter((i) => i.isMultiDay);
  const singleDayItems = items.filter((i) => !i.isMultiDay);

  const [yearStr, monthStr, dayStr] = dateKey.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const meseName = nomiMesiLungo[monthIdx]?.toUpperCase() || '';
  const dayNumber = parseInt(dayStr, 10);
  const headerDateTitle = `${dayNumber} ${meseName} ${yearStr}`;

  const popoverAlignClass = getPopoverAlignClass(colIndex);

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

  return (
    <div
      onMouseEnter={() => {
        hasItems && setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSingleClick}
      onDoubleClick={handleDoubleClick}
      style={{ ...cellBgStyle, ...cellBorderStyle }}
      className={`relative p-1.5 border rounded-lg cursor-pointer min-h-0 flex flex-col justify-between group transition-colors duration-300 ${
        activeMood ? 'border-2' : 'border-gray-200 bg-gray-50 hover:bg-blue-100/50 hover:border-blue-400'
      } ${isHovered ? 'z-[60]' : 'z-10'}`}
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

        {/* IL SELETTORE DINAMICO UMORE */}
        {showMoodSelector && (
          <MonthDayCellMoodMenu
            dateKey={dateKey}
            moodCategoryId={moodCategoryId}
            allCategories={allCategories}
            onMoodChange={onMoodChange}
            onCreateNewMood={onCreateNewMood}
          />
        )}
      </div>

      {/* SEZIONE MULTI/SINGLE DAY ITEMS (Pallini colorati di categoria) */}
      <div className="flex flex-col gap-1 justify-center items-center mt-auto h-5 mb-0.5 pointer-events-none">
        {multiDayItems.length > 0 && (
          <div className="flex gap-1 justify-center items-center w-full">
            {multiDayItems.slice(0, 3).map((item, idx) => (
              <div
                key={`multi-${idx}`}
                className="h-1.5 w-3 rounded-full shrink-0"
                style={{ backgroundColor: getHexColor(item.categoryColor) }}
              />
            ))}
            {multiDayItems.length > 3 && <span className="text-[8px] leading-none text-gray-400 font-bold">+</span>}
          </div>
        )}
        {singleDayItems.length > 0 && (
          <div className="flex gap-1 justify-center items-center w-full">
            {singleDayItems.slice(0, 4).map((item, idx) => (
              <div
                key={`single-${idx}`}
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: getHexColor(item.categoryColor) }}
              />
            ))}
            {singleDayItems.length > 4 && <span className="text-[8px] leading-none text-gray-400 font-bold">+</span>}
          </div>
        )}
      </div>

      {/* POPOVER HOVER */}
      {isHovered && (dayEvents.length > 0 || dayTasks.length > 0) && (
        <MonthDayCellHoverTooltip
          headerDateTitle={headerDateTitle}
          dayEvents={dayEvents}
          dayTasks={dayTasks}
          popoverAlignClass={popoverAlignClass}
        />
      )}
    </div>
  );
};