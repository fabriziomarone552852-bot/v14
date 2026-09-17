// src/mobile/components/modals/MobileHabitNewModal.tsx
import React, { useState, useEffect } from 'react';
import MobileBaseModal from './MobileBaseModal';
import { getLocalTodayStr } from '@/utils/dateUtils';
import { InfoIcon } from '@/components/shared/utils/Icons';
import { buildRRule } from '@/utils/rruleUtils';
import type { HabitItem } from '@/components/day/HabitDetailModal';
import type { HabitSavePayload } from '@/components/day/HabitNewModal';
import { logger } from '@/utils/logger';

interface MobileHabitNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: HabitItem | null;
  onSave: (habitData: HabitSavePayload) => Promise<void> | void;
}

export const MobileHabitNewModal: React.FC<MobileHabitNewModalProps> = ({
  isOpen,
  onClose,
  habitToEdit,
  onSave,
}) => {
  const [form, setForm] = useState({
    titolo: '',
    icona: '✨',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (habitToEdit) {
        setForm({
          titolo: habitToEdit.title || '',
          icona: habitToEdit.icon || '✨',
        });
      } else {
        setForm({ titolo: '', icona: '✨' });
      }
    }
  }, [isOpen, habitToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titolo.trim()) return;

    setIsSaving(true);
    try {
      const payload: HabitSavePayload = {
        titolo: form.titolo.trim(),
        tipo: 'H',
        data_inizio: getLocalTodayStr(),
        immagine_url: form.icona || '✨',
        rrule: buildRRule('DAILY', '1', ''),
        attiva: true,
      };

      await onSave(payload);
      onClose();
    } catch (error) {
      logger.error('Errore salvataggio abitudine mobile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={habitToEdit ? 'Modifica Abitudine' : 'Nuova Abitudine'}
      formId="mobile-habit-form"
      confirmText={habitToEdit ? 'Salva Modifiche' : 'Crea Abitudine'}
      isConfirmDisabled={!form.titolo.trim()}
      isLoading={isSaving}
    >
      <form id="mobile-habit-form" onSubmit={handleSubmit} className="space-y-4 pb-4 animate-fadeIn">
        <div className="flex gap-3 items-end">
          <div className="w-20 shrink-0">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Icona
            </label>
            <input
              type="text"
              maxLength={2}
              required
              value={form.icona}
              onChange={(e) => setForm({ ...form, icona: e.target.value })}
              className="w-full h-11 text-center border border-gray-200 rounded-xl text-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs bg-white"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Nome Abitudine
            </label>
            <input
              type="text"
              required
              placeholder="Es. Leggere, Meditare, Bere acqua..."
              value={form.titolo}
              onChange={(e) => setForm({ ...form, titolo: e.target.value })}
              className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs bg-white"
              autoFocus
            />
          </div>
        </div>

        <div className="bg-purple-50 text-purple-900 p-3.5 rounded-xl text-xs font-medium flex gap-2.5 border border-purple-100/80 shadow-2xs">
          <InfoIcon className="h-4 w-4 shrink-0 mt-0.5 text-purple-600" />
          <span>Le abitudini hanno frequenza giornaliera costante (1 volta al giorno) a partire dalla data odierna.</span>
        </div>
      </form>
    </MobileBaseModal>
  );
};

export default MobileHabitNewModal;
