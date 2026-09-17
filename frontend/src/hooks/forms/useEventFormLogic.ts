// src/hooks/forms/useEventFormLogic.ts
import { useState, useEffect, useMemo } from 'react';
import type { CalendarEvent, Category, DbEvent } from '@/types';
import { getLocalTodayStr, formatTimeToServer, combineDateAndTime } from '@/utils/dateUtils';
import { parseRRule, buildRRule } from '@/utils/rruleUtils';
import { useCategories } from '@/hooks/useCategories';
import { useEventMutations } from '@/hooks/mutations/useEventMutations';
import { useConfirm } from '@/context/ConfirmContext';
import { logger } from '@/utils/logger';

export interface EventFormState {
  titolo: string;
  descrizione: string;
  data_inizio: string;
  data_fine: string;
  ora_inizio: string;
  ora_fine: string;
  category: string;
  luogo: string;
  tutto_il_giorno: boolean;
}

export interface EventPayload {
  id?: number;
  titolo: string;
  descrizione: string | null;
  data_inizio: string;
  data_fine: string | null;
  tutto_il_giorno: boolean;
  user_category_id?: number;
  luogo: string | null;
  rrule: string | null;
}

export interface UseEventFormLogicProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: CalendarEvent | null;
  initialDate?: string | null;
  onEventSaved?: (savedEvent?: DbEvent) => void;
}

export const useEventFormLogic = ({
  isOpen,
  onClose,
  eventToEdit,
  initialDate,
  onEventSaved,
}: UseEventFormLogicProps) => {
  const { saveEvent } = useEventMutations<{ events: DbEvent[] }>(['events']);
  const { data: categories = [] } = useCategories();
  const { confirm } = useConfirm();

  const dynamicFormId = useMemo(
    () => `event-form-${Math.random().toString(36).substring(2, 9)}`,
    []
  );

  const [newEventForm, setNewEventForm] = useState<EventFormState>({
    titolo: '',
    descrizione: '',
    data_inizio: getLocalTodayStr(),
    data_fine: '',
    ora_inizio: '',
    ora_fine: '',
    category: '',
    luogo: '',
    tutto_il_giorno: false,
  });

  const [activeDatePicker, setActiveDatePicker] = useState<
    'start' | 'end' | 'until' | null
  >(null);

  const [isRecurrent, setIsRecurrent] = useState(false);
  const [rruleInterval, setRruleInterval] = useState('1');
  const [rruleFreq, setRruleFreq] = useState('WEEKLY');
  const [rruleUntil, setRruleUntil] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        setNewEventForm({
          titolo: eventToEdit.title || '',
          descrizione: eventToEdit.description || '',
          data_inizio: eventToEdit.dateStr || getLocalTodayStr(),
          data_fine: eventToEdit.endDateStr || '',
          ora_inizio: eventToEdit.time || '',
          ora_fine: eventToEdit.endTime || '',
          category: eventToEdit.category || '',
          luogo: eventToEdit.location || '',
          tutto_il_giorno: !!eventToEdit.tutto_il_giorno,
        });

        const {
          isRecurrent: isRec,
          freq,
          interval,
          until,
        } = parseRRule(eventToEdit.rrule);

        setIsRecurrent(isRec);
        setRruleFreq(freq);
        setRruleInterval(interval);
        setRruleUntil(until);
      } else {
        setNewEventForm({
          titolo: '',
          descrizione: '',
          data_inizio: initialDate || getLocalTodayStr(),
          data_fine: '',
          ora_inizio: '',
          ora_fine: '',
          category: '',
          luogo: '',
          tutto_il_giorno: false,
        });
        setIsRecurrent(false);
        setRruleFreq('WEEKLY');
        setRruleInterval('1');
        setRruleUntil('');
      }
    } else {
      setActiveDatePicker(null);
    }
  }, [isOpen, eventToEdit, initialDate]);

  const handleSalvaNuovoEvento = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    let fullStart = newEventForm.data_inizio;
    let fullEnd: string | null = newEventForm.data_fine || null;

    if (!newEventForm.tutto_il_giorno) {
      const serverStart = formatTimeToServer(newEventForm.ora_inizio);
      const serverEnd = formatTimeToServer(newEventForm.ora_fine);

      if (serverStart) {
        fullStart = combineDateAndTime(newEventForm.data_inizio, serverStart);
      }
      if (serverEnd) {
        const baseEndDate =
          newEventForm.data_fine || newEventForm.data_inizio;
        fullEnd = combineDateAndTime(baseEndDate, serverEnd);
      }
    }

    if (fullEnd && new Date(fullEnd) < new Date(fullStart)) {
      confirm({
        title: 'Attenzione',
        message: 'La data/ora di fine non può essere precedente a quella di inizio.',
        confirmText: 'Ho capito',
        isDestructive: false,
        onConfirm: () => {},
      });
      return;
    }

    const matchingCategory = categories.find(
      (c: Category) => c.category_name === newEventForm.category
    );
    const categoryId = matchingCategory ? Number(matchingCategory.id) : undefined;

    let generatedRRule: string | null = null;
    if (isRecurrent) {
      generatedRRule = buildRRule(rruleFreq, rruleInterval, rruleUntil);
    }

    const isAllDay =
      newEventForm.tutto_il_giorno ||
      (!newEventForm.ora_inizio?.trim() && !newEventForm.ora_fine?.trim());

    const payload: EventPayload = {
      titolo: newEventForm.titolo,
      descrizione: newEventForm.descrizione ? newEventForm.descrizione : null,
      data_inizio: fullStart,
      data_fine: fullEnd,
      tutto_il_giorno: isAllDay,
      user_category_id: categoryId,
      luogo: newEventForm.luogo || null,
      rrule: generatedRRule,
    };

    if (eventToEdit && eventToEdit.originalId !== undefined) {
      payload.id = eventToEdit.originalId;
    }

    setIsSaving(true);

    try {
      const savedEvent = await saveEvent(payload);
      if (onEventSaved && savedEvent) {
        onEventSaved(savedEvent);
      }
      onClose();
    } catch (errore) {
      logger.error("Errore nel salvataggio dell'evento", errore);
      confirm({
        title: 'Attenzione',
        message: "Si è verificato un errore durante il salvataggio.",
        confirmText: 'Ho capito',
        isDestructive: false,
        onConfirm: () => {},
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    newEventForm,
    setNewEventForm,
    categories,
    dynamicFormId,
    activeDatePicker,
    setActiveDatePicker,
    isRecurrent,
    setIsRecurrent,
    rruleInterval,
    setRruleInterval,
    rruleFreq,
    setRruleFreq,
    rruleUntil,
    setRruleUntil,
    isSaving,
    handleSalvaNuovoEvento,
    isConfirmDisabled: !newEventForm.titolo.trim(),
  };
};

export default useEventFormLogic;
