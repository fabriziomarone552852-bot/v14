import React from 'react';
import { TrashIcon } from '@/components/shared/utils/Icons';
import type { DailyEntry } from '@/types/dailyentries';
import type { DbMonthlyEntry } from '@/types/monthlyentries';
import { getOriginClass, getNumCols } from '@/utils/uiUtils';
import { AutoExpandingTextarea } from '@/components/shared/utils/AutoExpandingTextarea';

export type MoodEvent = DailyEntry | DbMonthlyEntry;

const getEventText = (ev: MoodEvent): string => {
  if ('testo' in ev && ev.testo) return ev.testo;
  if ('monthly_field' in ev && ev.monthly_field) return ev.monthly_field;
  return '';
};

// Lo stile testo lo possiamo condividere o esportare da un file uiUtils.ts
const textStyle = "text-[length:clamp(0.85rem,10cqmin,1.15rem)] font-black leading-tight break-words whitespace-pre-wrap w-full min-w-0 max-w-full";

interface MoodEventCardProps {
  ev: MoodEvent;
  index: number;
  totalBlocks: number;
  themeColor: 'green' | 'red';
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (id: number, newTitle: string) => void;
  onDelete: (id: number) => void;
  layout?: 'horizontal' | 'vertical';
}

export const MoodEventCard: React.FC<MoodEventCardProps> = ({
  ev, index, totalBlocks, themeColor, isEditing, onStartEdit, onCancelEdit, onSave, onDelete, layout = 'horizontal'
}) => {
  const originClass = getOriginClass(index, getNumCols(totalBlocks));
  const isVertical = layout === 'vertical';
  
  const colors = themeColor === 'green' 
    ? { bgHover: 'hover:bg-green-50', bgIdle: 'bg-green-100', border: 'border-green-200', text: 'text-green-900', editingBg: 'bg-green-50 border-green-400', trashBtn: 'bg-green-200/70 text-green-700 hover:bg-red-200 hover:text-red-800' }
    : { bgHover: 'hover:bg-red-50', bgIdle: 'bg-red-100', border: 'border-red-200', text: 'text-red-900', editingBg: 'bg-red-50 border-red-400', trashBtn: 'bg-red-200/70 text-red-700 hover:bg-red-300 hover:text-red-900' };

  const handleSave = (newVal: string) => {
    const trimmedVal = newVal.trim();
    if (trimmedVal) onSave(ev.id, trimmedVal);
    else onDelete(ev.id);
  };

  const baseWidthClass = isVertical 
    ? (isEditing ? "w-[130px] max-w-[85vw]" : "w-full group-hover:w-[130px] group-hover:max-w-[85vw]") 
    : "w-full";

  return (
    <div className={`relative w-full h-full @container group ${isEditing ? 'z-[100]' : 'z-10 hover:z-[100]'}`}>
      <div
        onClick={() => { if (!isEditing) onStartEdit(); }}
        className={`absolute bottom-0 left-0 right-0 flex flex-col justify-center items-center text-center rounded-lg border transition-all duration-300 ease-out min-h-full ${originClass} ${baseWidthClass} 
          ${isEditing 
            ? `h-auto max-h-[250px] overflow-y-auto custom-scrollbar shadow-2xl scale-[1.30] p-4 ${colors.editingBg} ${colors.text}`
            : `overflow-hidden shadow-sm group-hover:h-auto group-hover:max-h-[250px] group-hover:overflow-y-auto group-hover:custom-scrollbar group-hover:shadow-2xl group-hover:scale-[1.30] group-hover:p-4 ${colors.bgIdle} ${colors.border} ${colors.text} ${colors.bgHover}`
          }
        `}
      >
        {!isEditing && (
          <button 
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onDelete(ev.id); }} 
            className={`absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full z-10 ${colors.trashBtn}`}
            title="Elimina"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="w-full flex flex-col items-center justify-center min-w-0 flex-1">
          {isEditing ? (
            <AutoExpandingTextarea 
              initialValue={getEventText(ev)}
              onBlur={(e) => handleSave(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(e.currentTarget.value); }
                if (e.key === 'Escape') onCancelEdit();
              }}
              themeColor={themeColor}
              autoFocus
            />
          ) : (
            <span className={`${textStyle} ${isVertical ? 'line-clamp-2' : 'line-clamp-3'} group-hover:line-clamp-none`}>
              {getEventText(ev)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};