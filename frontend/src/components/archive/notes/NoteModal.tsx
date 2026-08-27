// src/components/notes/NoteModal.tsx
import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import type { DailyEntry } from '@/types/dailyentries';
import type { NoteVariant } from '@/types';
import { getLocalDateString } from '@/utils/dateUtils';
import { isNoteVariant } from '@/utils/noteUtils';
import { logger } from '@/utils/logger';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteToEdit?: DailyEntry | null;
  onSave: (payload: { data_riferimento: string; testo: string; tipo: NoteVariant; id?: number }) => Promise<void> | void;
}

const VARIANTS: { id: NoteVariant; label: string; bg: string; border: string; text: string }[] = [
  { id: 'N1', label: 'Giallo', bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900' },
  { id: 'N2', label: 'Verde', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900' },
  { id: 'N3', label: 'Blu', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900' },
  { id: 'N4', label: 'Rosa', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900' },
];

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  noteToEdit,
  onSave,
}) => {
  const [dataRiferimento, setDataRiferimento] = useState(getLocalDateString());
  const [tipo, setTipo] = useState<NoteVariant>('N1');
  const [testo, setTesto] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (noteToEdit) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Form state reset when modal opens or edit target changes
        setDataRiferimento(noteToEdit.data_riferimento?.substring(0, 10) || getLocalDateString());
        setTipo(isNoteVariant(noteToEdit.tipo) ? noteToEdit.tipo : 'N1');
        setTesto(noteToEdit.testo || '');
      } else {
        setDataRiferimento(getLocalDateString());
        setTipo('N1');
        setTesto('');
      }
    }
    setIsDatePickerOpen(false);
  }, [isOpen, noteToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = testo.trim();
    if (!cleanText) return;

    setIsSaving(true);
    try {
      await onSave({
        id: noteToEdit?.id,
        data_riferimento: dataRiferimento,
        tipo,
        testo: cleanText,
      });
      onClose();
    } catch (err) {
      logger.error('Errore salvataggio nota:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={noteToEdit ? 'Modifica Nota' : 'Nuova Nota'}
      maxWidthClass="max-w-md"
      formId="note-form"
      confirmText={noteToEdit ? 'Salva Modifiche' : 'Crea Nota'}
      isConfirmDisabled={!testo.trim()}
      isLoading={isSaving}
      overflowVisible={true}
    >
      <form id="note-form" onSubmit={handleSubmit} className="space-y-4">
        {/* 1. SELEZIONE DATA DI RIFERIMENTO */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Data di Riferimento
          </label>
          <DatePicker
            value={dataRiferimento}
            onChange={setDataRiferimento}
            isOpen={isDatePickerOpen}
            onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
            onClose={() => setIsDatePickerOpen(false)}
          />
        </div>

        {/* 2. SELEZIONE VARIANTE / COLORE NOTA */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Colore della Nota
          </label>
          <div className="grid grid-cols-4 gap-2">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setTipo(v.id)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${v.bg} ${v.border} ${v.text} ${
                  tipo === v.id
                    ? 'ring-2 ring-blue-600 scale-105 font-black shadow-sm'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. TESTO DELLA NOTA */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Contenuto della Nota
          </label>
          <textarea
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            placeholder="Scrivi qui i tuoi pensieri, memo o appunti..."
            rows={6}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors resize-y leading-relaxed font-sans"
            autoFocus
            required
          />
        </div>
      </form>
    </BaseModal>
  );
};

export default NoteModal;
