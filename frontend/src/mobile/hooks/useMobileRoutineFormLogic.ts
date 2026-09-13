// src/mobile/hooks/useMobileRoutineFormLogic.ts
import { useState, useEffect } from 'react';
import type { RoutineItem } from '@/components/day/RoutineColumn';
import type { RoutineSavePayload } from '@/components/day/RoutineNewModal';
import { getLocalDateString } from '@/utils/dateUtils';
import { parseRRule, buildRRule } from '@/utils/rruleUtils';
import { logger } from '@/utils/logger';

export interface RoutineFormState {
  titolo: string;
  data_inizio: string;
  immagine_url: string;
  immagine_posizione: string;
  piu_volte: boolean;
  target_completamenti: number;
  rruleInterval: string;
  rruleFreq: string;
  rruleUntil: string;
  isRecurrent: boolean;
}

interface UseMobileRoutineFormLogicProps {
  isOpen: boolean;
  onClose: () => void;
  routineToEdit?: RoutineItem | null;
  onSave: (routineData: RoutineSavePayload) => Promise<void> | void;
}

export const useMobileRoutineFormLogic = ({
  isOpen,
  onClose,
  routineToEdit,
  onSave,
}: UseMobileRoutineFormLogicProps) => {
  const [form, setForm] = useState<RoutineFormState>({
    titolo: '',
    data_inizio: getLocalDateString(),
    immagine_url: '',
    immagine_posizione: '50% 50%',
    piu_volte: false,
    target_completamenti: 1,
    rruleInterval: '1',
    rruleFreq: 'DAILY',
    rruleUntil: '',
    isRecurrent: true,
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (routineToEdit) {
        const { isRecurrent, freq, interval, until } = parseRRule(routineToEdit.rrule);
        setForm({
          titolo: routineToEdit.titolo || routineToEdit.title || '',
          data_inizio: routineToEdit.data_inizio || getLocalDateString(),
          immagine_url: routineToEdit.imageUrl || '',
          immagine_posizione: routineToEdit.immaginePosizione || '50% 50%',
          piu_volte: routineToEdit.targetCompletions > 1,
          target_completamenti: routineToEdit.targetCompletions || 1,
          rruleFreq: freq,
          rruleInterval: interval,
          rruleUntil: until,
          isRecurrent: isRecurrent,
        });
      } else {
        setForm({
          titolo: '',
          data_inizio: getLocalDateString(),
          immagine_url: '',
          immagine_posizione: '50% 50%',
          piu_volte: false,
          target_completamenti: 1,
          rruleFreq: 'DAILY',
          rruleInterval: '1',
          rruleUntil: '',
          isRecurrent: true,
        });
      }
    } else {
      setIsDatePickerOpen(false);
      setIsPositionModalOpen(false);
    }
  }, [isOpen, routineToEdit]);

  const incrementTarget = () => {
    setForm((prev) => ({
      ...prev,
      target_completamenti: prev.target_completamenti + 1,
    }));
  };

  const decrementTarget = () => {
    setForm((prev) => ({
      ...prev,
      target_completamenti: Math.max(2, prev.target_completamenti - 1),
    }));
  };

  const handlePiuVolteToggle = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      piu_volte: checked,
      target_completamenti: checked ? 2 : 1,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.titolo.trim()) return;
    setIsSaving(true);

    try {
      const rruleString = form.isRecurrent
        ? buildRRule(form.rruleFreq, form.rruleInterval, form.rruleUntil)
        : '';

      const payload: RoutineSavePayload = {
        titolo: form.titolo.trim(),
        tipo: 'R',
        data_inizio: form.data_inizio,
        immagine_url: form.immagine_url || '',
        immagine_posizione: form.immagine_posizione,
        target_completamenti: form.target_completamenti,
        rrule: rruleString,
      };

      await onSave(payload);
      onClose();
    } catch (error) {
      logger.error('Errore nel salvataggio della routine mobile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    form,
    setForm,
    isDatePickerOpen,
    setIsDatePickerOpen,
    isPositionModalOpen,
    setIsPositionModalOpen,
    isSaving,
    incrementTarget,
    decrementTarget,
    handlePiuVolteToggle,
    handleSubmit,
  };
};
