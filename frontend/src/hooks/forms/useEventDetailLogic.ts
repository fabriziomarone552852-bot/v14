// src/hooks/forms/useEventDetailLogic.ts
import { useState, useEffect } from 'react';
import type { CalendarEvent } from '@/types';
import { useConfirm } from '@/context/ConfirmContext';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import type { EventDeletePayload } from '@/components/shared/events/EventDetailModal';

export interface UseEventDetailLogicProps {
  isOpen: boolean;
  selectedEvent: CalendarEvent | null;
  onDeleteClick: (payload: EventDeletePayload) => void;
}

export const useEventDetailLogic = ({
  isOpen,
  selectedEvent,
  onDeleteClick,
}: UseEventDetailLogicProps) => {
  const { confirm } = useConfirm();
  const [showRecurringDeleteOptions, setShowRecurringDeleteOptions] =
    useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) setShowRecurringDeleteOptions(false);
  }, [isOpen, selectedEvent]);

  const dataInizio = selectedEvent
    ? formatToItalianShortDate(selectedEvent.dateStr)
    : '';
  const dataFine = selectedEvent
    ? formatToItalianShortDate(selectedEvent.endDateStr)
    : '';
  const haFine =
    selectedEvent &&
    ((dataFine && dataFine !== dataInizio) || selectedEvent.endTime);

  const handleDeleteClick = (): void => {
    if (!selectedEvent || selectedEvent.originalId === undefined) return;

    if (selectedEvent.rrule) {
      setShowRecurringDeleteOptions(true);
    } else {
      confirm({
        title: 'Elimina Evento',
        message:
          'Sei sicuro di voler eliminare definitivamente questo evento dal calendario? L\'azione non è reversibile.',
        confirmText: 'Elimina',
        isDestructive: true,
        onConfirm: () => {
          onDeleteClick({
            id: selectedEvent.originalId!,
            mode: 'all',
            dateStr: selectedEvent.dateStr ?? '',
          });
        },
      });
    }
  };

  const confirmRecurringDelete = (mode: 'single' | 'future' | 'all'): void => {
    if (!selectedEvent || selectedEvent.originalId === undefined) return;

    onDeleteClick({
      id: selectedEvent.originalId,
      mode: mode,
      dateStr: selectedEvent.dateStr ?? '',
      currentRrule: selectedEvent.rrule ?? undefined,
      currentEsclusioni: selectedEvent.esclusioni ?? undefined,
    });
    setShowRecurringDeleteOptions(false);
  };

  return {
    dataInizio,
    dataFine,
    haFine,
    showRecurringDeleteOptions,
    setShowRecurringDeleteOptions,
    handleDeleteClick,
    confirmRecurringDelete,
  };
};

export default useEventDetailLogic;
