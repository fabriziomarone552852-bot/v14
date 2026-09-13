// src/mobile/components/modals/MobileCountdownNewModal.tsx
import React from 'react';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import TimeInput from '@/components/shared/utils/TimeInput';
import ImagePositionModal from '@/components/shared/dialog/ImagePositionModal';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';
import MobileBaseModal from './MobileBaseModal';
import {
  useMobileCountdownFormLogic,
  type CountdownSavePayload,
} from '@/mobile/hooks/useMobileCountdownFormLogic';
import { MobileCountdownCoverInput } from './countdown/MobileCountdownCoverInput';

export type { CountdownSavePayload };

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
  const {
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
  } = useMobileCountdownFormLogic({
    isOpen,
    onClose,
    countdownToEdit,
    onSave,
  });

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
          <MobileCountdownCoverInput
            imageUrl={imageUrl}
            onChangeImageUrl={setImageUrl}
            onOpenPositionModal={() => setIsPositionModalOpen(true)}
          />
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
