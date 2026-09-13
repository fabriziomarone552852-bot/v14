// src/mobile/components/mood/MobileMoodEventOverlayEditing.tsx
import React from 'react';
import { TrashIcon } from '@/components/shared/utils/Icons';
import { AutoExpandingTextarea } from '@/components/shared/utils/AutoExpandingTextarea';
import { type MoodEvent, getEventText } from '../MobileMoodEventCard';

interface MobileMoodEventOverlayEditingProps {
  editingEvent: MoodEvent;
  themeColor: 'green' | 'red';
  editingBg: string;
  textColor: string;
  trashBtnColor: string;
  onSave: (id: number, val: string) => void;
  onDelete: (e: React.MouseEvent | React.TouchEvent, id: number) => void;
  onCancel: () => void;
}

export const MobileMoodEventOverlayEditing: React.FC<MobileMoodEventOverlayEditingProps> = ({
  editingEvent,
  themeColor,
  editingBg,
  textColor,
  trashBtnColor,
  onSave,
  onDelete,
  onCancel,
}) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute inset-1.5 z-50 rounded-2xl border-2 shadow-2xl p-4 flex flex-col justify-center items-center text-center animate-fadeIn ${editingBg} ${textColor}`}
    >
      {/* TASTO ELIMINA IN ALTO A DESTRA CON PREVENT DEFAULT SU TOUCH START PER EVITARE IL BLUR DEL TEXTAREA */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        onTouchEnd={(e) => onDelete(e, editingEvent.id)}
        onClick={(e) => onDelete(e, editingEvent.id)}
        className={`absolute top-2.5 right-2.5 p-1.5 rounded-full z-30 cursor-pointer shadow-xs active:scale-90 transition-all ${trashBtnColor}`}
        title="Elimina"
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>

      <div className="w-full flex-1 flex items-center justify-center">
        <AutoExpandingTextarea
          initialValue={getEventText(editingEvent)}
          onBlur={(e) => onSave(editingEvent.id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSave(editingEvent.id, e.currentTarget.value);
            }
            if (e.key === 'Escape') onCancel();
          }}
          themeColor={themeColor}
          autoFocus
        />
      </div>
    </div>
  );
};

export default MobileMoodEventOverlayEditing;
