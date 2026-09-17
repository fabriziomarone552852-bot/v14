import { useState, useRef } from 'react';
import { logger } from '@/utils/logger';
import type { DbBingoEntry } from '@/types/yearlyentries';

export interface ExpandedCardState {
  id?: number;
  pos: number;
  text: string;
  isNew: boolean;
}

export const getFallbackRotation = (id: number, pos: number = 0): number => {
  return Math.abs((id * 137 + pos * 149) % 360);
};

interface UseMobileBingoLogicProps {
  cells: DbBingoEntry[];
  onCreateCell: (testo: string, posizione?: number) => Promise<void>;
  onUpdateText: (id: number, testo: string) => Promise<void>;
  onToggleDone: (id: number, done: boolean) => Promise<void>;
  onDeleteCell: (id: number) => Promise<void>;
}

export const useMobileBingoLogic = ({
  cells,
  onCreateCell,
  onUpdateText,
  onToggleDone,
  onDeleteCell,
}: UseMobileBingoLogicProps) => {
  // Stato card allargata su tutta la griglia (aperta con long-press o tap su vuota)
  const [expandedState, setExpandedState] = useState<ExpandedCardState | null>(null);

  // Timer per rilevare Long Press (~450ms)
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);

  const completedCount = cells.filter((c) => c.done).length;

  const startLongPress = (cell: DbBingoEntry, pos: number) => {
    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(35);
      }
      setExpandedState({
        id: cell.id,
        pos,
        text: cell.testo || '',
        isNew: false,
      });
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const endLongPress = (cell: DbBingoEntry) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Singolo clic: segna completata (o toglie il completamento)
    // void esplicito: la promise è intenzionalmente non awaited (aggiornamento ottimistico)
    if (!isLongPressTriggeredRef.current) {
      void onToggleDone(cell.id, cell.done);
    }
  };

  const handleCollapse = async () => {
    if (!expandedState) return;
    const trimmed = expandedState.text.trim();

    try {
      if (expandedState.isNew) {
        if (trimmed) {
          await onCreateCell(trimmed, expandedState.pos);
        }
      } else if (expandedState.id) {
        const original = cells.find((c) => c.id === expandedState.id)?.testo || '';
        if (trimmed !== original) {
          await onUpdateText(expandedState.id, trimmed);
        }
      }
    } catch (error) {
      logger.error('Errore durante il salvataggio della cella bingo:', error);
    } finally {
      // Il finally garantisce che la cella venga sempre chiusa,
      // anche se il backend fallisce (evita cella bloccata)
      setExpandedState(null);
    }
  };

  const handleDelete = async () => {
    if (!expandedState?.id) return;
    try {
      await onDeleteCell(expandedState.id);
    } catch (error) {
      logger.error('Errore durante la cancellazione della cella bingo:', error);
    } finally {
      setExpandedState(null);
    }
  };

  const currentExpandedCell = expandedState?.id
    ? cells.find((c) => c.id === expandedState.id)
    : null;

  const isExpandedDone = currentExpandedCell?.done ?? false;
  const expandedRotation = currentExpandedCell
    ? typeof currentExpandedCell.rotazione === 'number'
      ? currentExpandedCell.rotazione
      : getFallbackRotation(currentExpandedCell.id, expandedState?.pos || 0)
    : 0;
  const expandedStamp = currentExpandedCell?.timbro ?? null;

  const handleEmptySlotClick = (pos: number) => {
    setExpandedState({
      pos,
      text: '',
      isNew: true,
    });
  };

  return {
    expandedState,
    setExpandedState,
    completedCount,
    isExpandedDone,
    expandedRotation,
    expandedStamp,
    startLongPress,
    cancelLongPress,
    endLongPress,
    handleCollapse,
    handleDelete,
    handleEmptySlotClick,
  };
};
