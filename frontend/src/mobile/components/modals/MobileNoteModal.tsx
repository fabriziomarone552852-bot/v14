// src/mobile/components/modals/MobileNoteModal.tsx
import React, { useState, useEffect } from 'react';
import MobileBaseModal from './MobileBaseModal';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import type { DailyEntry } from '@/types/dailyentries';
import type { NoteVariant } from '@/types';
import { getLocalDateString } from '@/utils/dateUtils';
import { isNoteVariant } from '@/utils/noteUtils';
import { logger } from '@/utils/logger';

interface MobileNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteToEdit?: DailyEntry | null;
  onSave: (payload: { data_riferimento: string; testo: string; tipo: NoteVariant; id?: number }) => Promise<void> | void;
}

const VARIANTS: { id: NoteVariant; label: string; bg: string; border: string; text: string; activeRing: string }[] = [
  { id: 'N1', label: 'Giallo', bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900', activeRing: 'ring-yellow-500' },
  { id: 'N2', label: 'Verde', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900', activeRing: 'ring-green-500' },
  { id: 'N3', label: 'Blu', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900', activeRing: 'ring-blue-500' },
  { id: 'N4', label: 'Rosa', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900', activeRing: 'ring-pink-500' },
];

export const MobileNoteModal: React.FC<MobileNoteModalProps> = ({
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
      logger.error('Errore salvataggio nota mobile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentVariant = VARIANTS.find((v) => v.id === tipo) || VARIANTS[0];

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={noteToEdit ? 'Modifica Nota' : 'Nuova Nota'}
      formId="mobile-note-form"
      confirmText={noteToEdit ? 'Salva Modifiche' : 'Crea Nota'}
      isConfirmDisabled={!testo.trim()}
      isLoading={isSaving}
    >
      <form id="mobile-note-form" onSubmit={handleSubmit} className="space-y-4 pb-4 animate-fadeIn flex flex-col h-full">
        {/* 1. SELEZIONE DATA DI RIFERIMENTO */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Data di Riferimento
          </label>
          <DatePicker
            value={dataRiferimento}
            onChange={setDataRiferimento}
            isOpen={isDatePickerOpen}
            onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
            onClose={() => setIsDatePickerOpen(false)}
            placeholder="Seleziona data..."
            overlay={true}
            align="center"
          />
        </div>

        {/* 2. SELEZIONE COLORE NOTA */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Colore della Nota
          </label>
          <div className="grid grid-cols-4 gap-2">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setTipo(v.id)}
                className={`py-2.5 px-2 text-xs font-extrabold rounded-xl border transition-all cursor-pointer text-center shadow-2xs ${v.bg} ${v.border} ${v.text} ${
                  tipo === v.id
                    ? `ring-2 ${v.activeRing} scale-105 font-black shadow-sm`
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. TESTO DELLA NOTA */}
        <div className="flex-1 flex flex-col min-h-[220px]">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Contenuto della Nota
          </label>
          <div className={`p-3.5 rounded-2xl shadow-xs border ${currentVariant.bg} ${currentVariant.border} flex-1 flex flex-col relative`}>
            {/* Angolino post-it */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-black/10 rounded-tl-md rounded-br-2xl pointer-events-none" />

            <textarea
              value={testo}
              onChange={(e) => setTesto(e.target.value)}
              placeholder="Scrivi qui i tuoi pensieri, memo o appunti..."
              rows={8}
              className={`w-full flex-1 bg-transparent border-none focus:ring-0 resize-none outline-none text-sm font-medium leading-relaxed font-mono p-0 custom-scrollbar ${currentVariant.text}`}
              autoFocus
              required
            />
          </div>
        </div>
      </form>
    </MobileBaseModal>
  );
};

export default MobileNoteModal;
