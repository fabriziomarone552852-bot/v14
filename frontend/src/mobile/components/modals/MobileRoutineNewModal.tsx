// src/mobile/components/modals/MobileRoutineNewModal.tsx
import React from 'react';
import type { RoutineItem } from '@/components/day/RoutineColumn';
import type { RoutineSavePayload } from '@/components/day/RoutineNewModal';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import MobileBaseModal from './MobileBaseModal';
import { RecurrenceEditor } from '@/components/shared/utils/RecurrenceEditor';
import ImagePositionModal from '@/components/shared/dialog/ImagePositionModal';
import { FormInput } from '@/components/shared/form';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';
import { useMobileRoutineFormLogic } from '@/mobile/hooks/useMobileRoutineFormLogic';
import { MobileRoutineCoverImageSection } from './routine/MobileRoutineCoverImageSection';
import { MobileRoutineTargetSection } from './routine/MobileRoutineTargetSection';

interface MobileRoutineNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  routineToEdit?: RoutineItem | null;
  onSave: (routineData: RoutineSavePayload) => Promise<void> | void;
}

export const MobileRoutineNewModal: React.FC<MobileRoutineNewModalProps> = ({
  isOpen,
  onClose,
  routineToEdit,
  onSave,
}) => {
  const {
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
  } = useMobileRoutineFormLogic({
    isOpen,
    onClose,
    routineToEdit,
    onSave,
  });

  if (!isOpen) return null;

  return (
    <>
      <MobileBaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={routineToEdit ? 'Modifica Routine' : 'Nuova Routine'}
        formId="mobile-routine-form"
        confirmText={routineToEdit ? 'Aggiorna Routine' : 'Salva Routine'}
        isConfirmDisabled={!form.titolo.trim()}
        isLoading={isSaving}
      >
        <form
          id="mobile-routine-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Nome Routine */}
          <div className="w-full">
            <FormInput
              label="Nome Routine"
              type="text"
              required
              placeholder="Es. Skincare Serale, Lettura, Esercizi..."
              value={form.titolo}
              onChange={(e) => setForm({ ...form, titolo: e.target.value })}
            />
          </div>

          {/* A partire dal */}
          <div className="w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              A partire dal
            </label>
            <DatePicker
              value={form.data_inizio}
              onChange={(val) => setForm({ ...form, data_inizio: val })}
              isOpen={isDatePickerOpen}
              onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
              onClose={() => setIsDatePickerOpen(false)}
              placeholder="Oggi"
              overlay={true}
            />
          </div>

          {/* Immagine di Copertina URL */}
          <MobileRoutineCoverImageSection
            imageUrl={form.immagine_url}
            onImageUrlChange={(url) => setForm({ ...form, immagine_url: url })}
            onOpenPositionModal={() => setIsPositionModalOpen(true)}
          />

          {/* Sezione Ricorrenza */}
          <div className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 shadow-2xs">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Frequenza & Ricorrenza
            </label>
            <RecurrenceEditor
              hideToggle={true}
              isRecurrent={true}
              interval={form.rruleInterval}
              onIntervalChange={(val) => setForm({ ...form, rruleInterval: val })}
              freq={form.rruleFreq}
              onFreqChange={(val) => setForm({ ...form, rruleFreq: val })}
              untilDate={form.rruleUntil}
              onUntilDateChange={(val) => setForm({ ...form, rruleUntil: val })}
              overlay={true}
            />
          </div>

          {/* Obiettivo Giornaliero (più volte al giorno) */}
          <MobileRoutineTargetSection
            piuVolte={form.piu_volte}
            onPiuVolteChange={handlePiuVolteToggle}
            targetCompletamenti={form.target_completamenti}
            onIncrement={incrementTarget}
            onDecrement={decrementTarget}
          />
        </form>
      </MobileBaseModal>

      {/* Modale centratura immagine */}
      <ImagePositionModal
        isOpen={isPositionModalOpen}
        onClose={() => setIsPositionModalOpen(false)}
        imageUrl={form.immagine_url || DEFAULT_COVER_IMAGE}
        value={form.immagine_posizione}
        onChange={(val) => setForm({ ...form, immagine_posizione: val })}
        titlePreview={form.titolo || 'Titolo Routine'}
      />
    </>
  );
};

export default MobileRoutineNewModal;
