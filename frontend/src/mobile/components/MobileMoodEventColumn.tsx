// src/mobile/components/MobileMoodEventColumn.tsx
import React, { useState, useRef } from 'react';
import { PlusIcon, TrashIcon } from '@/components/shared/utils/Icons';
import type { MoodEventType } from '@/types';
import { getGridClasses } from '@/utils/uiUtils';
import { AutoExpandingTextarea } from '@/components/shared/utils/AutoExpandingTextarea';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { MobileMoodEventCard, type MoodEvent, getEventText } from './MobileMoodEventCard';
import { logger } from '@/utils/logger';

interface MobileMoodEventColumnProps {
  title: string;
  type: MoodEventType;
  events: MoodEvent[];
  themeColor: 'green' | 'red';
  periodLabel?: string;
  onAdd: (type: MoodEventType, title: string) => Promise<unknown> | void; 
  onUpdate: (id: number, newTitle: string) => Promise<unknown> | void;
  onDelete: (id: number) => void;
}

export const MobileMoodEventColumn: React.FC<MobileMoodEventColumnProps> = ({
  title,
  type,
  events,
  themeColor,
  periodLabel = 'questa settimana',
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Flag e timestamp per bloccare la propagazione del blur della textarea e il ghost click sull'eliminazione
  const isDeletingRef = useRef<boolean>(false);
  const lastActionTimestampRef = useRef<number>(0);

  // Timer per la pressione prolungata sull'evento già esteso
  const expandedLongPressTimerRef = useRef<number | null>(null);
  const isExpandedLongPressTriggeredRef = useRef<boolean>(false);

  const startExpandedLongPress = (id: number) => {
    isExpandedLongPressTriggeredRef.current = false;
    expandedLongPressTimerRef.current = window.setTimeout(() => {
      isExpandedLongPressTriggeredRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
      setExpandedId(null);
      setEditingId(id);
    }, 450);
  };

  const cancelExpandedLongPress = () => {
    if (expandedLongPressTimerRef.current) {
      clearTimeout(expandedLongPressTimerRef.current);
      expandedLongPressTimerRef.current = null;
    }
  };

  const endExpandedLongPress = () => {
    if (expandedLongPressTimerRef.current) {
      clearTimeout(expandedLongPressTimerRef.current);
      expandedLongPressTimerRef.current = null;
    }

    if (!isExpandedLongPressTriggeredRef.current) {
      // Tap rapido: chiudi l'espansione
      setExpandedId(null);
    }
  };

  const limitedEvents = events.slice(0, 9);
  const totalBlocks = Math.max(1, limitedEvents.length);
  const isGreen = themeColor === 'green';

  const [primaParola, secondaParola] = title.split(' ');

  const titleColor = isGreen ? 'text-green-600' : 'text-red-600';
  const borderTheme = isGreen
    ? 'border-green-300 text-green-500 hover:bg-green-50 hover:text-green-700'
    : 'border-red-300 text-red-500 hover:bg-red-50 hover:text-red-700';

  const emptyMessage = isGreen
    ? `Nessun evento positivo per ${periodLabel}`
    : `Nessun evento negativo per ${periodLabel}`;

  const colors = isGreen
    ? {
        bgIdle: 'bg-green-100',
        border: 'border-green-200',
        text: 'text-green-900',
        editingBg: 'bg-green-50 border-green-400',
        trashBtn: 'bg-green-200/80 text-green-700 hover:bg-red-200 hover:text-red-800',
      }
    : {
        bgIdle: 'bg-red-100',
        border: 'border-red-200',
        text: 'text-red-900',
        editingBg: 'bg-red-50 border-red-400',
        trashBtn: 'bg-red-200/80 text-red-700 hover:bg-red-300 hover:text-red-900',
      };

  const handleSaveNew = async (newVal: string) => {
    const trimmedVal = newVal.trim();
    if (!trimmedVal) {
      setIsAdding(false);
      return;
    }
    if (isSaving) return;

    try {
      setIsSaving(true);
      await onAdd(type, trimmedVal);
    } catch (error) {
      logger.error('Errore durante il salvataggio', error);
    } finally {
      setIsSaving(false);
      setIsAdding(false);
    }
  };

  const handleSaveEdit = async (id: number, newVal: string) => {
    if (isDeletingRef.current || Date.now() - lastActionTimestampRef.current < 400) return;
    const trimmedVal = newVal.trim();
    setEditingId(null);
    if (!trimmedVal) {
      onDelete(id);
    } else {
      await onUpdate(id, trimmedVal);
    }
  };

  const handleDeleteEvent = (e: React.MouseEvent | React.TouchEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    isDeletingRef.current = true;
    lastActionTimestampRef.current = Date.now();
    
    // Esecuzione eliminazione immediata
    onDelete(id);
    setEditingId(null);
    setExpandedId(null);

    setTimeout(() => {
      isDeletingRef.current = false;
    }, 400);
  };

  const expandedEvent = limitedEvents.find((ev) => ev.id === expandedId);
  const editingEvent = limitedEvents.find((ev) => ev.id === editingId);

  return (
    <div className="relative flex flex-col w-full bg-white rounded-2xl shadow-xs border border-gray-200/90 flex-1 min-h-0 transition-all duration-300 z-10 overflow-hidden select-none">
      
      {/* 1. HEADER: Titolo a sinistra, Tasto '+' a destra */}
      <div className="flex items-center justify-between text-center px-3 py-2 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl shrink-0">
        <h3 className={`flex gap-1.5 text-xs sm:text-sm font-black tracking-wider uppercase select-none ${titleColor}`}>
          <span>{primaParola}</span>
          <span>{secondaParola}</span>
        </h3>

        {/* TASTO '+' NELL'INTESTAZIONE */}
        <button
          type="button"
          onClick={() => {
            setExpandedId(null);
            setEditingId(null);
            setIsAdding(true);
          }}
          className={`p-1 rounded-xl border transition-all flex items-center justify-center w-7 h-7 cursor-pointer active:scale-90 ${borderTheme}`}
          title={`Aggiungi ${title}`}
          aria-label={`Aggiungi ${title}`}
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 2. CORPO: Griglia 2D degli eventi */}
      <div className={`flex-1 min-h-0 p-2 grid gap-1.5 relative transition-all duration-500 ease-in-out ${getGridClasses(totalBlocks)}`}>
        {limitedEvents.map((ev, index) => (
          <MobileMoodEventCard
            key={ev.id}
            ev={ev}
            index={index}
            totalBlocks={totalBlocks}
            themeColor={themeColor}
            onTap={() => {
              if (isDeletingRef.current || Date.now() - lastActionTimestampRef.current < 400) return;
              if (editingId === null && !isAdding) {
                setExpandedId(ev.id);
              }
            }}
            onLongPress={() => {
              if (isDeletingRef.current || Date.now() - lastActionTimestampRef.current < 400) return;
              setExpandedId(null);
              setIsAdding(false);
              setEditingId(ev.id);
            }}
          />
        ))}

        {limitedEvents.length === 0 && !isAdding && (
          <div className="col-span-full h-full flex flex-col items-center justify-center p-2 text-center pointer-events-none select-none">
            <EmptyState message={emptyMessage} />
          </div>
        )}

        {/* 3. OVERLAY AGGIUNTA NUOVO EVENTO (A TUTTA GRIGLIA) */}
        {isAdding && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute inset-1.5 z-50 rounded-2xl border-2 shadow-2xl p-4 flex flex-col justify-center items-center text-center animate-fadeIn ${colors.editingBg} ${colors.text}`}
          >
            <div className="w-full flex-1 flex items-center justify-center">
              <AutoExpandingTextarea
                initialValue=""
                onBlur={(e) => handleSaveNew(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveNew(e.currentTarget.value);
                  }
                  if (e.key === 'Escape' && !isSaving) setIsAdding(false);
                }}
                placeholder="Scrivi..."
                themeColor={themeColor}
                autoFocus
                disabled={isSaving}
              />
            </div>
          </div>
        )}

        {/* 4. OVERLAY EVENTO ESTESO A TUTTA LA GRIGLIA (TAP RAPIDO -> CHIUDI; LONG PRESS -> APRI MODIFICA) */}
        {expandedEvent && !isAdding && editingId === null && (
          <div
            onTouchStart={() => startExpandedLongPress(expandedEvent.id)}
            onTouchEnd={endExpandedLongPress}
            onTouchMove={cancelExpandedLongPress}
            onMouseDown={() => startExpandedLongPress(expandedEvent.id)}
            onMouseUp={endExpandedLongPress}
            onMouseLeave={cancelExpandedLongPress}
            className={`absolute inset-1.5 z-50 rounded-2xl border shadow-xl p-4 flex flex-col justify-center items-center text-center animate-fadeIn cursor-pointer ${colors.bgIdle} ${colors.border} ${colors.text}`}
            title="Tocca per chiudere • Tieni premuto per modificare"
          >
            <div className="w-full flex-1 flex items-center justify-center overflow-y-auto custom-scrollbar pointer-events-none">
              <p className="text-[length:clamp(0.95rem,10cqmin,1.25rem)] font-black leading-tight break-words whitespace-pre-wrap w-full select-none">
                {getEventText(expandedEvent)}
              </p>
            </div>
          </div>
        )}

        {/* 5. OVERLAY MODIFICA EVENTO ALLA PRESSIONE PROLUNGATA (CON TASTO ELIMINA IN ALTO A DESTRA STILE WEBPAGE) */}
        {editingEvent && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute inset-1.5 z-50 rounded-2xl border-2 shadow-2xl p-4 flex flex-col justify-center items-center text-center animate-fadeIn ${colors.editingBg} ${colors.text}`}
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
                isDeletingRef.current = true;
              }}
              onTouchEnd={(e) => handleDeleteEvent(e, editingEvent.id)}
              onClick={(e) => handleDeleteEvent(e, editingEvent.id)}
              className={`absolute top-2.5 right-2.5 p-1.5 rounded-full z-30 cursor-pointer shadow-xs active:scale-90 transition-all ${colors.trashBtn}`}
              title="Elimina"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>

            <div className="w-full flex-1 flex items-center justify-center">
              <AutoExpandingTextarea
                initialValue={getEventText(editingEvent)}
                onBlur={(e) => handleSaveEdit(editingEvent.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit(editingEvent.id, e.currentTarget.value);
                  }
                  if (e.key === 'Escape') setEditingId(null);
                }}
                themeColor={themeColor}
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMoodEventColumn;
