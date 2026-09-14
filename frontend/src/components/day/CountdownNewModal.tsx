// src/components/day/CountdownNewModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import TimeInput from '@/components/shared/utils/TimeInput';
import ImagePositionModal from '@/components/shared/dialog/ImagePositionModal';
import { TargetIcon, PhotoIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import { pad } from '@/utils/dateUtils';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';
import { resolveImageUrl } from '@/utils/imageUtils';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { mediaService } from '@/api/mediaService';
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await mediaService.uploadImage(file, 'countdowns');
      setImageUrl(res.url);
    } catch (error) {
      logger.error('Errore durante il caricamento foto per countdown:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlBlur = async () => {
    const rawUrl = imageUrl?.trim();
    if (!rawUrl || rawUrl.startsWith('/uploads/') || rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
      return;
    }

    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      try {
        setIsUploading(true);
        const res = await mediaService.fetchImageFromUrl(rawUrl, 'countdowns');
        setImageUrl(res.url);
      } catch (error) {
        logger.warn('Download immagine da URL fallito, mantengo URL:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

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
      logger.error("Errore durante il salvataggio:", error);
    } finally {
      setIsSaving(false);
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
                 <TimeInput value={timeStr} onChange={setTimeStr} />
              </div>
            </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Sfondo Personalizzato
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="hover:bg-blue-100 text-blue-600 bg-blue-50/80 border border-blue-200 p-1 rounded-lg transition-colors cursor-pointer flex items-center justify-center shadow-2xs disabled:opacity-50"
                    title="Carica foto dal dispositivo"
                  >
                    {isUploading ? (
                      <LoadingIcon className="animate-spin h-4 w-4 text-blue-600" />
                    ) : (
                      <PhotoIcon className="h-4 w-4" />
                    )}
                  </button>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setIsPositionModalOpen(true)}
                      className="hover:bg-blue-100 text-gray-500 hover:text-blue-500 rounded p-1 transition-colors cursor-pointer"
                      title="Centra l'immagine"
                    >
                      <TargetIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="Incolla URL o carica foto..."
                className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 shadow-sm"
              />
            </div>

          </form>
        
      </BaseModal>

      {/* MODALE IN OVERLAY PER CENTRARE L'IMMAGINE */}
      <ImagePositionModal
        isOpen={isPositionModalOpen}
        onClose={() => setIsPositionModalOpen(false)}
        imageUrl={resolveImageUrl(imageUrl) || DEFAULT_COVER_IMAGE}
        value={imagePosition}
        onChange={setImagePosition}
        titlePreview={title || 'Titolo Countdown'}
      />
    </>
  );
};

export default CountdownNewModal;