import React, { useRef, useState } from 'react';
import { getHexColor } from '@/utils/uiUtils';
import { TimeDisplay, DateRangeDisplay } from '@/components/shared/utils/DateTimeDisplays';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { CalendarIcon, TaskListIcon } from '@/components/shared/utils/Icons';
import { nomiMesiLungo } from '@/utils/dateUtils';
import type { CalendarGridItem } from './MonthGrid';

// 1. IMPORTIAMO I TIPI RIGOROSI DAL CONTRATTO (Zero 'any')
import { CategoryGenre, type Category } from '@/types'; 

// 2. AGGIORNIAMO LE PROPS
interface MonthDayCellProps {
  dateKey: string;
  dayNum: number;
  colIndex?: number;
  isToday: boolean;
  items: CalendarGridItem[];
  
  // Niente più stringhe testuali o enum fissi, usiamo l'ID relazionale
  moodCategoryId?: number | null; 
  allCategories?: Category[]; 
  
  onDayClick?: (dateStr: string) => void;
  onAddEventClick?: (dateStr: string) => void;
  
  // Il setter ora restituisce rigorosamente un ID numerico (o null)
  onMoodChange?: (dateStr: string, categoryId: number | null) => void; 
  onCreateNewMood?: (dateStr: string) => void; // Handler per aprire il modale esterno
  
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
  showMoodSelector = false 
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stato per il menu a tendina locale
  const [isMoodMenuOpen, setIsMoodMenuOpen] = useState<boolean>(false);

  const moodMenuRef = useOutsideClick<HTMLDivElement>(() => {
    if (isMoodMenuOpen) setIsMoodMenuOpen(false);
  });

  // --- LOGICA FRONTEND RIGOROSA ---
  // Filtriamo al volo le categorie per estrarre solo gli stati d'animo dell'utente
  const userMoods: Category[] = allCategories.filter((c: Category) => c.genre === CategoryGenre.MOOD);
  
  // Troviamo l'oggetto completo del mood attualmente assegnato a questo giorno
  const activeMood: Category | null = userMoods.find((c: Category) => c.id === moodCategoryId) || null;

  const dayEvents = items.filter(i => i.type === 'event');
  const dayTasks = items.filter(i => i.type === 'task');
  const hasItems = dayEvents.length > 0 || dayTasks.length > 0;
  const multiDayItems = items.filter(i => i.isMultiDay);
  const singleDayItems = items.filter(i => !i.isMultiDay);

  const [yearStr, monthStr, dayStr] = dateKey.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const meseName = nomiMesiLungo[monthIdx]?.toUpperCase() || '';
  const dayNumber = parseInt(dayStr, 10);
  const headerDateTitle = `${dayNumber} ${meseName} ${yearStr}`;

  const popoverAlignClass = 
    colIndex !== undefined
      ? colIndex >= 5 
        ? 'right-0 left-auto transform translate-x-0' 
        : colIndex <= 1 
        ? 'left-0 right-auto transform translate-x-0' 
        : 'left-1/2 transform -translate-x-1/2'
      : 'left-1/2 transform -translate-x-1/2';

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

  // Funzione fortemente tipizzata per la selezione dal menu
  const handleMoodSelect = (e: React.MouseEvent, categoryId: number | null) => {
    e.stopPropagation(); 
    setIsMoodMenuOpen(false);
    if (onMoodChange) onMoodChange(dateKey, categoryId);
  };

  // --- STILI DINAMICI BASATI SULLA TABELLA CATEGORIES ---
  // 1. Dichiariamo una variabile sicura: se il colore è null o vuoto, usiamo un grigio di default.
  // In questo modo 'moodColor' sarà SEMPRE e SOLO una 'string'.
  const moodColor: string = activeMood?.colore || '#9CA3AF'; 

  // 2. Ora possiamo passare la stringa sicura a React senza che TypeScript si lamenti.
  const cellBgStyle = activeMood ? { backgroundColor: `${moodColor}15` } : {};
  const cellBorderStyle = activeMood ? { borderColor: moodColor } : {};

  return (
    <div 
      onMouseEnter={() => { hasItems && setIsHovered(true); }} 
      onMouseLeave={() => setIsHovered(false)} 
      onClick={handleSingleClick}
      onDoubleClick={handleDoubleClick}
      style={{ ...cellBgStyle, ...cellBorderStyle }}
      className={`relative p-1.5 border rounded-lg cursor-pointer min-h-0 flex flex-col justify-between group transition-colors duration-300 ${
        activeMood ? 'border-2' : 'border-gray-200 bg-gray-50 hover:bg-blue-100/50 hover:border-blue-400'
      } ${isHovered || isMoodMenuOpen ? 'z-[60]' : 'z-10'}`}
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

        {/* IL SELETTORE DINAMICO (Visibile solo se richiesto) */}
        {showMoodSelector && (
          <div className="relative" ref={moodMenuRef} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsMoodMenuOpen(!isMoodMenuOpen); }}
              className="text-base transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-40 hover:!opacity-100 p-1 rounded-md"
              title={activeMood ? activeMood.category_name : "Aggiungi umore"}
            >
              {/* Utilizziamo il Pallino colorato invece del testo per un look minimale */}
              {activeMood ? (
                <div 
                  className="w-3.5 h-3.5 rounded-full shadow-sm" 
                  style={{ backgroundColor: activeMood.colore || '#9CA3AF' }} 
                />
              ) : (
                <span className="text-xs leading-none grayscale">😀</span>
              )}
            </button>

            {/* IL MENU A CASCATA GENERATO DAL DATABASE */}
            {isMoodMenuOpen && (
              <div className="absolute z-[100] right-0 top-full mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-fadeIn cursor-default overflow-hidden flex flex-col">
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
                    + Nuova Emozione
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
      
      {/* SEZIONE MULTI/SINGLE DAY ITEMS (Invariata con i pallini originari per HomePage) */}
      <div className="flex flex-col gap-1 justify-center items-center mt-auto h-5 mb-0.5 pointer-events-none">
        {multiDayItems.length > 0 && (
          <div className="flex gap-1 justify-center items-center w-full">
            {multiDayItems.slice(0, 3).map((item, idx) => <div key={`multi-${idx}`} className="h-1.5 w-3 rounded-full shrink-0" style={{ backgroundColor: getHexColor(item.categoryColor) }}></div>)}
            {multiDayItems.length > 3 && <span className="text-[8px] leading-none text-gray-400 font-bold">+</span>}
          </div>
        )}
        {singleDayItems.length > 0 && (
          <div className="flex gap-1 justify-center items-center w-full">
            {singleDayItems.slice(0, 4).map((item, idx) => <div key={`single-${idx}`} className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: getHexColor(item.categoryColor) }}></div>)}
            {singleDayItems.length > 4 && <span className="text-[8px] leading-none text-gray-400 font-bold">+</span>}
          </div>
        )}
      </div>
      
      {/* POPOVER HOVER: mostra eventi e task del giorno in hover (Stile YearPage con orari eventi) */}
      {isHovered && !isMoodMenuOpen && (dayEvents.length > 0 || dayTasks.length > 0) && (
        <div 
          className={`absolute bottom-full mb-2 bg-slate-900 text-white rounded-xl shadow-xl p-3 border border-slate-800 text-xs z-[100] w-64 animate-fadeIn pointer-events-none ${popoverAlignClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-extrabold text-[11px] text-blue-300 uppercase tracking-wider border-b border-slate-700 pb-1 mb-2 text-left">
            {headerDateTitle}
          </div>

          {dayEvents.length > 0 && (
            <div className={dayTasks.length > 0 ? "mb-2" : ""}>
              <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-blue-400" /> Eventi
              </div>
              <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-0.5 custom-scrollbar">
                {dayEvents.map((item, idx) => (
                  <div 
                    key={item.id || idx} 
                    className="bg-slate-800/80 rounded px-2 py-1 text-[11px] font-medium text-slate-200 truncate flex items-center gap-1.5 border-l-2 border-blue-500 text-left"
                    style={item.categoryColor ? { borderLeftColor: getHexColor(item.categoryColor) } : undefined}
                  >
                    <span className="text-[9px] font-bold text-slate-400 shrink-0 inline-flex items-center">
                      {item.dateStr && item.endDateStr && item.dateStr !== item.endDateStr ? (
                        <DateRangeDisplay startStr={item.dateStr} endStr={item.endDateStr} />
                      ) : (
                        <TimeDisplay time={item.time} endTime={item.endTime} />
                      )}
                    </span>
                    <span className="truncate flex-1" title={item.title}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dayTasks.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                <TaskListIcon className="w-3 h-3 text-emerald-400" /> Task in Scadenza
              </div>
              <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-0.5 custom-scrollbar">
                {dayTasks.map((item, idx) => (
                  <div 
                    key={item.id || idx} 
                    className="bg-slate-800/80 rounded px-2 py-1 text-[11px] font-medium text-slate-200 truncate flex items-center justify-between border-l-2 border-emerald-500 text-left"
                    style={item.categoryColor ? { borderLeftColor: getHexColor(item.categoryColor) } : undefined}
                  >
                    <span className={`truncate flex-1 ${item.done ? 'line-through text-slate-500 italic' : ''}`} title={item.title}>
                      {item.title}
                    </span>
                    {item.done && <span className="text-[9px] text-emerald-400 font-bold ml-1 shrink-0">✓ Fatto</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};