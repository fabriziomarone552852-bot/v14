// src/mobile/components/MobileGoalsAndPrioritiesChips.tsx
import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, CloseIcon } from '@/components/shared/utils/Icons';

export interface PriorityLikeEntry {
  id?: number;
  testo?: string | null;
  monthly_field?: string | null;
  yearly_field?: string | null;
}

interface LocalPriorityItem {
  index: number;
  text: string;
  id?: number;
}

interface MobileGoalsAndPrioritiesChipsProps {
  goalText?: string | null;
  priorities?: (PriorityLikeEntry | null)[] | null;
  onSaveGoal: (text: string) => void;
  onSavePriority: (id: number | undefined, text: string, index?: number) => void;
  goalPlaceholder?: string;
}

export const MobileGoalsAndPrioritiesChips: React.FC<MobileGoalsAndPrioritiesChipsProps> = ({
  goalText,
  priorities,
  onSaveGoal,
  onSavePriority,
  goalPlaceholder = 'Qual è il tuo obiettivo per oggi?',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. STATO LOCALE OBIETTIVO (Inline editing diretto, centralizzato, senza prefisso)
  const [localGoal, setLocalGoal] = useState<string>(goalText ?? '');
  useEffect(() => {
    setLocalGoal(goalText ?? '');
  }, [goalText]);

  const handleGoalBlur = () => {
    const trimmed = localGoal.trim();
    if (trimmed !== (goalText ?? '').trim()) {
      onSaveGoal(trimmed);
    }
  };

  // 2. STATO LOCALE PRIORITÀ (Max 3, con aggiornamento ottimistico immediato)
  const [localPriorities, setLocalPriorities] = useState<LocalPriorityItem[]>([]);

  useEffect(() => {
    const p0 = priorities?.[0];
    const p1 = priorities?.[1];
    const p2 = priorities?.[2];

    setLocalPriorities([
      { index: 0, text: (p0?.testo ?? p0?.monthly_field ?? p0?.yearly_field ?? '').trim(), id: p0?.id },
      { index: 1, text: (p1?.testo ?? p1?.monthly_field ?? p1?.yearly_field ?? '').trim(), id: p1?.id },
      { index: 2, text: (p2?.testo ?? p2?.monthly_field ?? p2?.yearly_field ?? '').trim(), id: p2?.id },
    ]);
  }, [priorities]);

  // Priorità effettivamente valorizzate
  const filledPriorities = localPriorities.filter((p) => p.text.length > 0);

  // Stato priorità in fase di digitazione inline: { index: number, text: string; id?: number } | null
  const [editingPriority, setEditingPriority] = useState<{ index: number; text: string; id?: number } | null>(null);

  // Stato priorità allargata / espansa inline per visualizzazione completa
  const [expandedPriorityIndex, setExpandedPriorityIndex] = useState<number | null>(null);

  // Reset espansione se si clicca fuori dal container
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpandedPriorityIndex(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Timer per rilevare Long Press (Pressione prolungata ~450ms)
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);

  const startLongPress = (item: LocalPriorityItem) => {
    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
      setExpandedPriorityIndex(null);
      setEditingPriority({ index: item.index, text: item.text, id: item.id });
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const endLongPress = (item: LocalPriorityItem) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Se non è stato attivato il long press
    if (!isLongPressTriggeredRef.current && editingPriority?.index !== item.index) {
      if (expandedPriorityIndex === item.index) {
        // SECONDO CLIC su priorità già allargata -> Entra in modalità modifica!
        setExpandedPriorityIndex(null);
        setEditingPriority({ index: item.index, text: item.text, id: item.id });
      } else {
        // PRIMO CLIC -> Allarga la priorità inline per mostrarla per intero!
        setExpandedPriorityIndex(item.index);
      }
    }
  };

  // Apertura nuova priorità tramite tasto '+'
  const handleAddNewPriority = () => {
    setExpandedPriorityIndex(null);
    const nextSlot = localPriorities.find((p) => p.text.length === 0) || localPriorities[filledPriorities.length] || { index: 0, text: '', id: undefined };
    setEditingPriority({ index: nextSlot.index, text: '', id: nextSlot.id });
  };

  const handleSavePriorityEdit = (idx: number, id: number | undefined, text: string) => {
    const trimmed = text.trim();
    // Aggiorna istantaneamente lo stato locale per evitare qualsiasi sfarfallio
    setLocalPriorities((prev) =>
      prev.map((p) => (p.index === idx ? { ...p, text: trimmed } : p))
    );
    setEditingPriority(null);
    setExpandedPriorityIndex(null);
    onSavePriority(id, trimmed, idx);
  };

  const handleDeletePriority = (idx: number, id: number | undefined, e?: React.MouseEvent) => {
    e?.stopPropagation();
    // Rimuove istantaneamente dallo stato locale
    setLocalPriorities((prev) =>
      prev.map((p) => (p.index === idx ? { ...p, text: '' } : p))
    );
    if (editingPriority?.index === idx) {
      setEditingPriority(null);
    }
    if (expandedPriorityIndex === idx) {
      setExpandedPriorityIndex(null);
    }
    onSavePriority(id, '', idx);
  };

  const canAddMore = filledPriorities.length < 3 && editingPriority === null;

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-2 flex flex-col gap-1.5 shrink-0 select-none transition-all"
    >
      {/* 1. OBIETTIVO (Senza prefisso, centralizzato, inline edit) */}
      <div className="flex items-center justify-center px-3 py-1.5 rounded-xl bg-blue-50/60 border border-blue-100/70 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white focus-within:border-blue-300 transition-all w-full">
        <input
          type="text"
          value={localGoal}
          onChange={(e) => setLocalGoal(e.target.value)}
          onBlur={handleGoalBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder={goalPlaceholder}
          className="w-full text-center bg-transparent border-none p-0 text-xs font-semibold text-gray-900 placeholder:text-blue-600/70 placeholder:italic focus:ring-0 focus:outline-none"
        />
      </div>

      {/* 2. PRIORITÀ: RIGO SINGOLO CON ALLARGAMENTO INLINE AL PRIMO CLIC & MODIFICA AL SECONDO CLIC / LONG PRESS */}
      <div className="flex items-center justify-center gap-1.5 w-full flex-nowrap overflow-hidden py-0.5 min-h-[2rem]">
        {/* Priorità già esistenti */}
        {filledPriorities.map((item) => {
          const isCurrentlyEditing = editingPriority?.index === item.index;
          const isExpanded = expandedPriorityIndex === item.index;

          if (isCurrentlyEditing) {
            return (
              <div
                key={item.index}
                className="flex-[3] min-w-0 flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-100/90 border border-amber-300 shadow-2xs animate-fadeIn"
              >
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  {item.index + 1}
                </span>
                <input
                  type="text"
                  autoFocus
                  value={editingPriority.text}
                  onChange={(e) =>
                    setEditingPriority((prev) => (prev ? { ...prev, text: e.target.value } : null))
                  }
                  onBlur={() => handleSavePriorityEdit(item.index, item.id, editingPriority.text)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSavePriorityEdit(item.index, item.id, editingPriority.text);
                    } else if (e.key === 'Escape') {
                      setEditingPriority(null);
                    }
                  }}
                  className="bg-transparent border-none p-0 text-xs font-bold text-gray-900 focus:ring-0 focus:outline-none flex-1 min-w-0"
                  placeholder="Scrivi..."
                />
              </div>
            );
          }

          // Se una priorità è allargata
          if (isExpanded) {
            return (
              <div
                key={item.index}
                onTouchStart={() => startLongPress(item)}
                onTouchEnd={() => endLongPress(item)}
                onTouchMove={cancelLongPress}
                onMouseDown={() => startLongPress(item)}
                onMouseUp={() => endLongPress(item)}
                onMouseLeave={cancelLongPress}
                className="flex-[3] min-w-0 group flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100 border border-amber-300 shadow-xs ring-2 ring-amber-400/20 active:scale-[0.99] transition-all cursor-pointer animate-fadeIn"
                title="Tocca di nuovo per modificare • Tieni premuto per modificare"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    {item.index + 1}
                  </span>
                  <span className="text-xs font-bold text-gray-900 break-words leading-tight flex-1 min-w-0 select-none">
                    {item.text}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeletePriority(item.index, item.id, e)}
                  className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-amber-200/60 transition-colors shrink-0 cursor-pointer ml-1"
                  title="Rimuovi priorità"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          }

          // Chip normale / compatta
          return (
            <div
              key={item.index}
              onTouchStart={() => startLongPress(item)}
              onTouchEnd={() => endLongPress(item)}
              onTouchMove={cancelLongPress}
              onMouseDown={() => startLongPress(item)}
              onMouseUp={() => endLongPress(item)}
              onMouseLeave={cancelLongPress}
              className={`min-w-0 group flex items-center justify-between gap-1 px-2 py-1 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/90 text-gray-900 shadow-2xs active:scale-95 transition-all cursor-pointer overflow-hidden ${
                expandedPriorityIndex !== null ? 'flex-initial shrink-0 max-w-[2.2rem]' : 'flex-1'
              }`}
              title="Tocca per allargare • Tieni premuto per modificare"
            >
              <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  {item.index + 1}
                </span>
                {expandedPriorityIndex === null && (
                  <span className="text-xs font-bold truncate flex-1 min-w-0 leading-tight select-none">
                    {item.text}
                  </span>
                )}
              </div>
              {expandedPriorityIndex === null && (
                <button
                  type="button"
                  onClick={(e) => handleDeletePriority(item.index, item.id, e)}
                  className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-amber-200/60 transition-colors shrink-0 cursor-pointer"
                  title="Rimuovi"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}

        {/* Slot di Nuova Priorità in fase di digitazione */}
        {editingPriority && !filledPriorities.some((p) => p.index === editingPriority.index) && (
          <div className="flex-1 min-w-0 flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-100/90 border border-amber-300 shadow-2xs animate-fadeIn">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
              {filledPriorities.length + 1}
            </span>
            <input
              type="text"
              autoFocus
              value={editingPriority.text}
              onChange={(e) =>
                setEditingPriority((prev) => (prev ? { ...prev, text: e.target.value } : null))
              }
              onBlur={() => handleSavePriorityEdit(editingPriority.index, editingPriority.id, editingPriority.text)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSavePriorityEdit(editingPriority.index, editingPriority.id, editingPriority.text);
                } else if (e.key === 'Escape') {
                  setEditingPriority(null);
                }
              }}
              className="bg-transparent border-none p-0 text-xs font-bold text-gray-900 focus:ring-0 focus:outline-none flex-1 min-w-0"
              placeholder={`Priorità ${filledPriorities.length + 1}...`}
            />
          </div>
        )}

        {/* TASTO '+' AGGIUNGI PRIORITÀ */}
        {canAddMore && (
          <button
            type="button"
            onClick={handleAddNewPriority}
            title="Aggiungi Priorità"
            className="w-7 h-7 shrink-0 border-2 border-dashed border-gray-300 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50/60 active:scale-95 text-gray-400 rounded-xl transition-all flex justify-center items-center cursor-pointer focus:outline-none"
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileGoalsAndPrioritiesChips;
