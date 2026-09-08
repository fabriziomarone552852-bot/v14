// src/mobile/components/modals/MobileCountdownNewModal.tsx
import React, { useState, useEffect } from 'react';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import TimeInput from '@/components/shared/utils/TimeInput';
import ImagePositionModal from '@/components/shared/dialog/ImagePositionModal';
import { TargetIcon } from '@/components/shared/utils/Icons';
import { pad } from '@/utils/dateUtils';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';
import MobileBaseModal from './MobileBaseModal';
import { logger } from '@/utils/logger';

export type CountdownSavePayload = Omit<CountdownItem, 'id'> & { id?: number };

interface MobileCountdownNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  countdownToEdit?: CountdownItem | null;
  onSave: (cd: CountdownSavePayload) => Promise<void> | void;
}

export const MobileCountdownNewModal: React.FC<MobileCountdownNewModalProps> = ({
  isOpen,
  onClose,
  countdownToEdit,
  onSave,
}) => {
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

  if (!isOpen) return null;

  return (
    <>
      <MobileBaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={countdownToEdit ? 'Modifica Countdown' : 'Nuovo Countdown'}
        formId="mobile-countdown-form"
        confirmText={countdownToEdit ? 'Salva Modifiche' : 'Crea Countdown'}
        isConfirmDisabled={!dateStr || !title.trim()}
        isLoading={isSaving}
      >
        <form
          id="mobile-countdown-form"
          onSubmit={handleSubmit}
          className="space-y-4 pb-4 animate-fadeIn"
        >
          {/* Titolo Evento */}
          <div className="w-full">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Titolo Evento
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Esame di Stato, Compleanno, Viaggio..."
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
              required
            />
          </div>

          {/* Data e Ora Scadenza */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Data Scadenza
              </label>
              <DatePicker
                value={dateStr}
                onChange={setDateStr}
                isOpen={isDatePickerOpen}
                onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
                onClose={() => setIsDatePickerOpen(false)}
                placeholder="Seleziona data"
                overlay={true}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Ora Scadenza
              </label>
              <TimeInput value={timeStr} onChange={setTimeStr} />
            </div>
          </div>

          {/* Immagine di Copertina URL */}
          <div className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 shadow-2xs">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Sfondo Personalizzato (URL)
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setIsPositionModalOpen(true)}
                  className="hover:bg-blue-100 text-blue-600 bg-blue-50/80 border border-blue-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold shadow-2xs"
                  title="Regola inquadratura"
                >
                  <TargetIcon className="h-3.5 w-3.5" />
                  <span>Inquadra</span>
                </button>
              )}
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Incolla l'URL dell'immagine..."
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
            />
            <p className="text-[11px] text-gray-400 font-medium mt-1">
              Se vuoto, verrà utilizzata l'illustrazione di sfondo predefinita.
            </p>
          </div>
        </form>
      </MobileBaseModal>

      {/* Modal Inquadratura Immagine */}
      <ImagePositionModal
        isOpen={isPositionModalOpen}
        onClose={() => setIsPositionModalOpen(false)}
        imageUrl={imageUrl || DEFAULT_COVER_IMAGE}
        value={imagePosition}
        onChange={setImagePosition}
        titlePreview={title || 'Titolo Countdown'}
      />
    </>
  );
};

export default MobileCountdownNewModal;
