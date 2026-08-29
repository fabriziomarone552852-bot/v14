// src/components/day/CountdownNewModal.tsx
import React, { useState, useEffect } from 'react';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import TimeInput from '@/components/shared/utils/TimeInput';
import ImagePositionModal from '@/components/shared/dialog/ImagePositionModal';
import { TargetIcon } from '@/components/shared/utils/Icons';
import { pad } from '@/utils/dateUtils';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { logger } from '@/utils/logger';

export type CountdownSavePayload = Omit<CountdownItem, 'id'> & { id?: number };

interface CountdownNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  countdownToEdit?: CountdownItem | null;
  onSave: (cd: CountdownSavePayload) => Promise<void> | void;
}

const CountdownNewModal: React.FC<CountdownNewModalProps> = ({ isOpen, onClose, countdownToEdit, onSave }) => {
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
    
    setIsSaving(true); // 🟢 Accendiamo lo spinner!

    try {
        // 1. Uniamo data e ora SENZA specificare il fuso. 
        // Il browser capirà in automatico che si tratta dell'ora locale italiana!
        const timeToUse = timeStr || '00:00';
        const localDate = new Date(`${dateStr}T${timeToUse}:00`);

        // 2. Ora possiamo convertirla in modo sicuro per il database
        const finalIso = localDate.toISOString();

      // Aspettiamo che il backend finisca di salvare
      await onSave({
        id: countdownToEdit?.id,
        title,
        targetDateStr: finalIso,
        imageUrl: imageUrl || DEFAULT_COVER_IMAGE,
        immaginePosizione: imagePosition,
      });
      
      onClose(); // Chiudiamo solo se è andato tutto bene
    } catch (error) {
      logger.error("Errore durante il salvataggio:", error);
    } finally {
      setIsSaving(false); // 🔴 Spegniamo lo spinner in ogni caso
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={countdownToEdit ? 'Modifica Countdown' : 'Nuovo Countdown'}
        maxWidthClass="max-w-md"
        formId="countdown-form"
        confirmText={countdownToEdit ? 'Salva Modifiche' : 'Crea Countdown'}
        isConfirmDisabled={!dateStr || !title.trim()}
        isLoading={isSaving}
        overflowVisible={true} 
      >
        <form id="countdown-form" onSubmit={handleSubmit} className="space-y-5">

          
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Titolo Evento</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Es. Esame di Stato, Compleanno..." className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 shadow-sm" required />
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <div className="w-full">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Data Scadenza</label>
                {/* MAGIA 1: DatePicker */}
                <DatePicker 
                  value={dateStr}
                  onChange={setDateStr}
                  isOpen={isDatePickerOpen}
                  onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  onClose={() => setIsDatePickerOpen(false)}
                />
                </div>
              </div>

              <div>
                <div className="relative w-full">
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ora Scadenza</label>
                 {/* MAGIA 2: TimeInput */}
                 <TimeInput value={timeStr} onChange={setTimeStr} />
              </div>
            </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Sfondo Personalizzato
                </label>
                <button
                  type="button"
                  onClick={() => setIsPositionModalOpen(true)}
                  className="hover:bg-blue-100 text-gray-500 hover:text-blue-500 rounded p-0.5 transition-colors cursor-pointer"
                  title="Centra l'immagine"
                >
                  <TargetIcon className="h-4 w-4" />
                </button>
              </div>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="Incolla l'URL dell'immagine..."
                className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 shadow-sm"
              />
              <p className="text-[10px] text-gray-400 font-medium mt-1.5 ml-1">Se lasciato vuoto, verrà utilizzata un'immagine di default.</p>
            </div>

          </form>
        
      </BaseModal>

      {/* MODALE IN OVERLAY PER CENTRARE L'IMMAGINE */}
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

export default CountdownNewModal;