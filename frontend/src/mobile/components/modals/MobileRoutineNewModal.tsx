// src/mobile/components/modals/MobileRoutineNewModal.tsx
import React, { useState, useEffect } from 'react';
import type { RoutineItem } from '@/components/day/RoutineColumn';
import type { RoutineSavePayload } from '@/components/day/RoutineNewModal';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import { getLocalDateString } from '@/utils/dateUtils';
import { parseRRule, buildRRule } from '@/utils/rruleUtils';
import MobileBaseModal from './MobileBaseModal';
import { RecurrenceEditor } from '@/components/shared/utils/RecurrenceEditor';
import ImagePositionModal from '@/components/shared/dialog/ImagePositionModal';
import { TargetIcon } from '@/components/shared/utils/Icons';
import { FormInput } from '@/components/shared/form';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';
import { logger } from '@/utils/logger';

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
  const [form, setForm] = useState({
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
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Immagine di Sfondo (URL)
              </label>
              {form.immagine_url && (
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
              value={form.immagine_url}
              onChange={(e) => setForm({ ...form, immagine_url: e.target.value })}
              placeholder="Incolla l'URL dell'immagine..."
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
            />
            <p className="text-[11px] text-gray-400 font-medium mt-1">
              Usata come sfondo visivo per la card della routine.
            </p>
          </div>

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
            />
          </div>

          {/* Obiettivo Giornaliero (più volte al giorno) */}
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 shadow-2xs">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="mobileRoutineMultiToggle"
                checked={form.piu_volte}
                onChange={(e) =>
                  setForm({
                    ...form,
                    piu_volte: e.target.checked,
                    target_completamenti: e.target.checked ? 2 : 1,
                  })
                }
                className="w-4.5 h-4.5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
              />
              <label
                htmlFor="mobileRoutineMultiToggle"
                className="text-xs sm:text-sm font-bold text-gray-800 cursor-pointer select-none"
              >
                Da completare più volte al giorno
              </label>
            </div>

            {form.piu_volte && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/60 animate-fadeIn">
                <span className="text-xs sm:text-sm font-semibold text-gray-600">
                  Target al giorno:
                </span>
                <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        target_completamenti: Math.max(2, form.target_completamenti - 1),
                      })
                    }
                    className="px-3.5 py-2 text-gray-600 hover:bg-gray-100 hover:text-red-500 font-black transition-colors cursor-pointer text-base select-none"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 font-extrabold text-sm text-gray-900 border-x border-gray-100 min-w-[2.5rem] text-center">
                    {form.target_completamenti}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        target_completamenti: form.target_completamenti + 1,
                      })
                    }
                    className="px-3.5 py-2 text-gray-600 hover:bg-gray-100 hover:text-green-600 font-black transition-colors cursor-pointer text-base select-none"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
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
