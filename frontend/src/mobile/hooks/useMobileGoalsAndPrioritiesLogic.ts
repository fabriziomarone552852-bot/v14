// src/mobile/hooks/useMobileGoalsAndPrioritiesLogic.ts
import { useState, useEffect, useRef } from 'react';

export interface PriorityLikeEntry {
  id?: number;
  testo?: string | null;
  monthly_field?: string | null;
  yearly_field?: string | null;
}

export interface LocalPriorityItem {
  index: number;
  text: string;
  id?: number;
}

export interface EditingPriorityState {
  index: number;
  text: string;
  id?: number;
}

interface UseMobileGoalsAndPrioritiesLogicProps {
  goalText?: string | null;
  priorities?: (PriorityLikeEntry | null)[] | null;
  onSaveGoal: (text: string) => void;
  onSavePriority: (id: number | undefined, text: string, index?: number) => void;
}

export const useMobileGoalsAndPrioritiesLogic = ({
  goalText,
  priorities,
  onSaveGoal,
  onSavePriority,
}: UseMobileGoalsAndPrioritiesLogicProps) => {
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

  // Stato priorità in fase di digitazione inline
  const [editingPriority, setEditingPriority] = useState<EditingPriorityState | null>(null);

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
    const nextSlot =
      localPriorities.find((p) => p.text.length === 0) ||
      localPriorities[filledPriorities.length] || { index: 0, text: '', id: undefined };
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

  return {
    containerRef,
    localGoal,
    setLocalGoal,
    handleGoalBlur,
    filledPriorities,
    editingPriority,
    setEditingPriority,
    expandedPriorityIndex,
    startLongPress,
    cancelLongPress,
    endLongPress,
    handleAddNewPriority,
    handleSavePriorityEdit,
    handleDeletePriority,
    canAddMore,
  };
};
