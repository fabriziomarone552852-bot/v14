// src/mobile/hooks/useMobileMoodEventColumnLogic.ts
import { useState, useRef } from 'react';
import type { MoodEventType } from '@/types';
import type { MoodEvent } from '@/mobile/components/MobileMoodEventCard';
import { logger } from '@/utils/logger';

interface UseMobileMoodEventColumnLogicProps {
  title: string;
  type: MoodEventType;
  events: MoodEvent[];
  themeColor: 'green' | 'red';
  periodLabel?: string;
  onAdd: (type: MoodEventType, title: string) => Promise<unknown> | void;
  onUpdate: (id: number, newTitle: string) => Promise<unknown> | void;
  onDelete: (id: number) => void;
}

export const useMobileMoodEventColumnLogic = ({
  title,
  type,
  events,
  themeColor,
  periodLabel = 'questa settimana',
  onAdd,
  onUpdate,
  onDelete,
}: UseMobileMoodEventColumnLogicProps) => {
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

  const handleCardTap = (id: number) => {
    if (isDeletingRef.current || Date.now() - lastActionTimestampRef.current < 400) return;
    if (editingId === null && !isAdding) {
      setExpandedId(id);
    }
  };

  const handleCardLongPress = (id: number) => {
    if (isDeletingRef.current || Date.now() - lastActionTimestampRef.current < 400) return;
    setExpandedId(null);
    setIsAdding(false);
    setEditingId(id);
  };

  const handleHeaderAdd = () => {
    setExpandedId(null);
    setEditingId(null);
    setIsAdding(true);
  };

  return {
    isAdding,
    setIsAdding,
    editingId,
    setEditingId,
    expandedId,
    isSaving,
    limitedEvents,
    totalBlocks,
    primaParola,
    secondaParola,
    titleColor,
    borderTheme,
    emptyMessage,
    colors,
    expandedEvent,
    editingEvent,
    startExpandedLongPress,
    cancelExpandedLongPress,
    endExpandedLongPress,
    handleSaveNew,
    handleSaveEdit,
    handleDeleteEvent,
    handleCardTap,
    handleCardLongPress,
    handleHeaderAdd,
  };
};
