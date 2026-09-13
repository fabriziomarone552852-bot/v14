// src/mobile/hooks/useMobileCountdownFormLogic.ts
import { useState, useEffect } from 'react';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import { pad } from '@/utils/dateUtils';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';
import { logger } from '@/utils/logger';

export type CountdownSavePayload = Omit<CountdownItem, 'id'> & { id?: number };

interface UseMobileCountdownFormLogicProps {
  isOpen: boolean;
  onClose: () => void;
  countdownToEdit?: CountdownItem | null;
  onSave: (cd: CountdownSavePayload) => Promise<void> | void;
}

export const useMobileCountdownFormLogic = ({
  isOpen,
  onClose,
  countdownToEdit,
  onSave,
}: UseMobileCountdownFormLogicProps) => {
  const [title, setTitle] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePosition, setImagePosition] = useState('50% 50%');

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (countdownToEdit && isOpen) {
      setTitle(countdownToEdit.title);
      setImageUrl(countdownToEdit.imageUrl);
      setImagePosition(countdownToEdit.immaginePosizione || '50% 50%');

      const d = new Date(countdownToEdit.targetDateStr);
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());

      setDateStr(`${yyyy}-${mm}-${dd}`);
      setTimeStr(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
    } else {
      setTitle('');
      setDateStr('');
      setTimeStr('');
      setImageUrl('');
      setImagePosition('50% 50%');
    }
    setIsDatePickerOpen(false);
    setIsPositionModalOpen(false);
  }, [countdownToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateStr) return;

    setIsSaving(true);

    try {
      const timeToUse = timeStr || '00:00';
      const localDate = new Date(`${dateStr}T${timeToUse}:00`);
      const finalIso = localDate.toISOString();

      await onSave({
        id: countdownToEdit?.id,
        title,
        targetDateStr: finalIso,
        imageUrl: imageUrl || DEFAULT_COVER_IMAGE,
        immaginePosizione: imagePosition,
      });

      onClose();
    } catch (error) {
      logger.error('Errore durante il salvataggio del countdown:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    title,
    setTitle,
    dateStr,
    setDateStr,
    timeStr,
    setTimeStr,
    imageUrl,
    setImageUrl,
    imagePosition,
    setImagePosition,
    isDatePickerOpen,
    setIsDatePickerOpen,
    isPositionModalOpen,
    setIsPositionModalOpen,
    isSaving,
    handleSubmit,
  };
};
