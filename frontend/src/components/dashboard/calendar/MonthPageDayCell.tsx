// frontend/src/components/dashboard/calendar/MonthPageDayCell.tsx
import React, { useRef, useState } from 'react';
import { getHexColor } from '@/utils/uiUtils';
import { TimeDisplay, DateRangeDisplay } from '@/components/shared/utils/DateTimeDisplays';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import type { CalendarGridItem } from './MonthGrid';
import { CategoryGenre, type Category, type DbTask } from '@/types'; 

interface MonthPageDayCellProps {
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
  onSelectTask,
  onToggleTask,
  onMoodChange, 
  onCreateNewMood,
  showMoodSelector = false 
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isTaskPopoverOpen, setIsTaskPopoverOpen] = useState<boolean>(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isMoodMenuOpen, setIsMoodMenuOpen] = useState<boolean>(false);

  const moodMenuRef = useOutsideClick<HTMLDivElement>(() => {
    if (isMoodMenuOpen) setIsMoodMenuOpen(false);
  });

  const taskPopoverRef = useOutsideClick<HTMLDivElement>(() => {
    if (isTaskPopoverOpen) setIsTaskPopoverOpen(false);
  });

  const userMoods: Category[] = allCategories.filter((c: Category) => c.genre === CategoryGenre.MOOD);
  const activeMood: Category | null = userMoods.find((c: Category) => c.id === moodCategoryId) || null;

  const hasItems = items.length > 0;
  const hasTasks = dayTasks.length > 0;

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

  const handleMoodSelect = (e: React.MouseEvent, categoryId: number | null) => {
    e.stopPropagation(); 
    setIsMoodMenuOpen(false);
    if (onMoodChange) onMoodChange(dateKey, categoryId);
  };

  const moodColor: string = activeMood?.colore || '#9CA3AF'; 
  const cellBgStyle = activeMood ? { backgroundColor: `${moodColor}15` } : {};
  const cellBorderStyle = activeMood ? { borderColor: moodColor } : {};

  // Posizionamento Smart per evitare che il popover esca dai bordi (SAB/DOM -> a destra; LUN/MAR -> a sinistra; centro -> centrato)
  const popoverAlignClass = 
    colIndex >= 5 
      ? 'right-0 left-auto transform translate-x-0' 
      : colIndex <= 1 
      ? 'left-0 right-auto transform translate-x-0' 
      : 'left-1/2 transform -translate-x-1/2';

  return (
    <div 
      onMouseEnter={() => { hasItems && setIsHovered(true); }} 
      onMouseLeave={() => setIsHovered(false)} 
      onClick={handleSingleClick}
      onDoubleClick={handleDoubleClick}
      style={{ ...cellBgStyle, ...cellBorderStyle }}
      className={`relative p-1.5 border rounded-lg cursor-pointer min-h-0 flex flex-col justify-between group transition-colors duration-300 ${
        activeMood ? 'border-2' : 'border-gray-200 bg-gray-50 hover:bg-blue-100/50 hover:border-blue-400'
      } ${isHovered || isMoodMenuOpen || isTaskPopoverOpen ? 'z-[1000]' : 'z-10'}`}
    >
      <div className="flex justify-between items-start w-full">
        <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full 
          ${isToday 
            ? 'bg-amber-500 text-white shadow-md ring-4 ring-amber-100 font-extrabold' 
            : 'text-gray-600 font-bold group-hover:text-blue-700'
          }`}
        >
          {dayNum}
        </span>

        <div className="flex items-center gap-1">
          {/* PULSANTE FRECCIA ROTANTE TASK (Stile WeekPage) */}
          {hasTasks && (
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
                title={isTaskPopoverOpen ? "Nascondi Task" : `Mostra ${dayTasks.length} Task`}
              >
                <svg 
                  className={`w-3 h-3 text-blue-500 transition-transform duration-300 ${
                    isTaskPopoverOpen ? 'rotate-180 text-blue-600' : ''
                  }`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                </svg>
              </button>

              {/* FINESTRA POPOVER TASK PER IL GIORNO */}
              {isTaskPopoverOpen && (
                <div 
                  className={`absolute bottom-full mb-2 w-60 max-h-[260px] overflow-y-auto custom-scrollbar pointer-events-auto bg-white p-2.5 rounded-xl shadow-2xl border border-gray-200 flex flex-col gap-1.5 transition-all z-[1000] ${popoverAlignClass}`} 
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider border-b border-gray-100 pb-1.5 flex justify-between items-center">
                    <span>Task ({dayTasks.length})</span>
                    <span className="text-[9px] text-gray-400 font-normal">{dateKey.split('-').reverse().slice(0,2).join('/')}</span>
                  </p>
                  <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-0.5 custom-scrollbar">
                    {dayTasks.map(task => {
                      const catColor = getHexColor(task.category?.colore || task.category?.colore || '#3b82f6');
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
                              task.fatto ? 'bg-gray-400 border-gray-400 text-white' : 'border-gray-300 hover:border-blue-500 bg-white'
                            }`}
                          >
                            {task.fatto && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <span className="truncate flex-1" title={task.titolo}>{task.titolo || 'Senza Titolo'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* IL SELETTORE DINAMICO UMORE */}
          {showMoodSelector && (
            <div className="relative" ref={moodMenuRef} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsMoodMenuOpen(!isMoodMenuOpen); }}
                className="text-base transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-40 hover:!opacity-100 p-1 rounded-md"
                title={activeMood ? activeMood.category_name : "Aggiungi umore"}
              >
                {activeMood ? (
                  <div 
                    className="w-3.5 h-3.5 rounded-full shadow-sm" 
                    style={{ backgroundColor: activeMood.colore || '#9CA3AF' }} 
                  />
                ) : (
                  <span className="text-xs leading-none grayscale">😀</span>
                )}
              </button>

              {isMoodMenuOpen && (
                <div className={`absolute z-[1000] top-full mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-fadeIn cursor-default overflow-hidden flex flex-col ${popoverAlignClass}`}>
                  <div className="max-h-40 overflow-y-auto">
                    {userMoods.map((mood: Category) => (
                      <div 
                        key={mood.id} 
                        onClick={(e) => handleMoodSelect(e, mood.id!)} 
                        className={`px-3 py-2 text-xs cursor-pointer flex items-center gap-2 transition-colors ${moodCategoryId === mood.id ? 'bg-blue-50 font-black' : 'hover:bg-gray-50 font-medium text-gray-700'}`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: mood.colore || '#9CA3AF' }} />
                        <span className="truncate">{mood.category_name}</span>
                      </div>
                    ))}
                    {userMoods.length === 0 && (
                       <div className="px-3 py-3 text-xs text-center text-gray-400">Nessuna emozione</div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-100 pt-1 mt-1">
                    <div 
                      onClick={(e) => { e.stopPropagation(); setIsMoodMenuOpen(false); if(onCreateNewMood) onCreateNewMood(dateKey); }} 
                      className="px-3 py-1.5 text-[11px] hover:bg-blue-50 cursor-pointer flex items-center justify-center transition-colors text-blue-600 font-bold"
                    >
                      + Crea Nuovo
                    </div>
                    {activeMood && (
                      <div 
                        onClick={(e) => handleMoodSelect(e, null)} 
                        className="px-3 py-1.5 text-[11px] hover:bg-red-50 cursor-pointer flex items-center justify-center transition-colors text-red-500 font-bold border-t border-gray-50"
                      >
                        Rimuovi
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 🪄 VISUALIZZAZIONE ESCLUSIVA EVENTI (Max 3 barrette) */}
      <div className="flex flex-col gap-1 w-full mt-auto overflow-hidden pointer-events-none pb-0.5">
        {items.filter(i => i.type === 'event').slice(0, 3).map((item, idx) => {
          const catColor = getHexColor(item.categoryColor);
          return (
            <div 
              key={idx} 
              className="w-full flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] leading-tight font-bold border-l-[3px] shadow-2xs overflow-hidden"
              style={{ 
                borderLeftColor: catColor,
                backgroundColor: `${catColor}25`,
                color: '#1e293b'
              }}
            >
              <span className="truncate flex-1 min-w-0" title={item.title}>
                {item.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* INDICATORE +N NELL'ANGOLO IN BASSO A DESTRA */}
      {items.filter(i => i.type === 'event').length > 3 && (
        <span className="absolute bottom-1 right-1 bg-gray-200/90 text-gray-700 text-[9px] font-black px-1 py-0.5 rounded-md shadow-2xs leading-none pointer-events-none border border-gray-300/50">
          +{items.filter(i => i.type === 'event').length - 3}
        </span>
      )}
      
      {/* TOOLTIP HOVER CON Z-[1000] E POSIZIONAMENTO INTELLIGENTE */}
      {isHovered && !isMoodMenuOpen && !isTaskPopoverOpen && (
        <div className={`absolute bottom-full mb-1 w-56 pb-2 cursor-default z-[1000] ${popoverAlignClass}`} onClick={(e) => e.stopPropagation()}>
          <div className="bg-gray-900 text-white rounded-xl shadow-2xl p-3 text-left border border-gray-800 animate-fadeIn relative">
            <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider mb-2 border-b border-gray-800 pb-1">
              Impegni del {dateKey.split('-').reverse().slice(0,2).join('/')}
            </p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs w-full min-w-0 py-0.5">
                  <span className={`h-1.5 rounded-full flex-shrink-0 ${item.isMultiDay ? 'w-3' : 'w-1.5'}`} style={{ backgroundColor: getHexColor(item.categoryColor) }} />
                  <div className="flex-1 min-w-0 text-gray-200 flex items-center gap-1.5 truncate">
                    {item.type === 'event' && <span className="text-[9px] font-bold text-gray-400 shrink-0 inline-flex items-center">{item.dateStr && item.endDateStr && item.dateStr !== item.endDateStr ? <DateRangeDisplay startStr={item.dateStr} endStr={item.endDateStr} /> : <TimeDisplay time={item.time} endTime={item.endTime} />}</span>}
                    <span className={`truncate ${item.done ? 'line-through text-gray-500 italic' : ''}`} title={item.title}>{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
