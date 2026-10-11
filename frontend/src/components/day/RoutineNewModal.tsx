// src/components/day/RoutineNewModal.tsx
import React from 'react';
import type { RoutineItem } from '@/components/day/RoutineColumn';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker'; 
import BaseModal from '@/components/shared/dialog/BaseModal';
import { RecurrenceEditor } from '@/components/shared/utils/RecurrenceEditor';
import ImagePositionModal from '@/components/shared/dialog/ImagePositionModal';
import { TargetIcon, PhotoIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';
import { resolveImageUrl } from '@/utils/imageUtils';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useRoutineFormLogic } from '@/hooks/forms/useRoutineFormLogic';

export interface RoutineSavePayload {
  titolo: string;
  tipo: 'R';
  immagine_url: string;
  immagine_posizione?: string;
  rrule: string;
  data_inizio: string;
  target_completamenti: number;
}

interface RoutineNewModalProps {
  isOpen: boolean; 
  onClose: () => void;
  routineToEdit?: RoutineItem | null; 
  onSave: (routineData: RoutineSavePayload) => Promise<void> | void;
}

const RoutineNewModal: React.FC<RoutineNewModalProps> = ({ isOpen, onClose, routineToEdit, onSave }) => {
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
  } = useRoutineFormLogic({
    isOpen,
    onClose,
    routineToEdit,
    onSave,
  });

  const {
    fileInputRef,
    isUploading,
    handleFileUpload,
    handleUrlFetch,
    triggerFileInput,
  } = useImageUpload({
    folder: 'habits',
    onSuccess: (url) => setForm((prev) => ({ ...prev, immagine_url: url })),
  });

  if (!isOpen) return null;

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={routineToEdit ? 'Modifica Routine' : 'Nuova Routine'}
        maxWidthClass="max-w-xl" // <--- Importante per le routine!
        formId="routine-form"
        confirmText={routineToEdit ? 'Aggiorna' : 'Crea Routine'}
        isConfirmDisabled={!form.titolo.trim()}
        isLoading={isSaving}
        overflowVisible={true}
      >
        <form id="routine-form" onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nome Routine</label>
              <input type="text" required placeholder="Es. Skincare Serale, Lettura..." value={form.titolo} onChange={(e) => setForm({...form, titolo: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4 items-start">
              <div>
                <div className="flex items-center h-6 mb-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">A partire dal</label>
                </div>
                {/* MAGIA: DatePicker */}
                <DatePicker 
                  value={form.data_inizio}
                  onChange={(val) => setForm({...form, data_inizio: val})}
                  isOpen={isDatePickerOpen}
                  onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  onClose={() => setIsDatePickerOpen(false)}
                  placeholder="Oggi"
                />
              </div> 

              <div>
                <div className="flex justify-between items-center h-6 mb-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Immagine di Sfondo
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
                      onClick={triggerFileInput}
                      disabled={isUploading}
                      className="hover:bg-blue-100 text-blue-600 bg-blue-50/80 border border-blue-200 p-0.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center shadow-2xs disabled:opacity-50"
                      title="Carica foto dal dispositivo"
                    >
                      {isUploading ? (
                        <LoadingIcon className="animate-spin h-3.5 w-3.5 text-blue-600" />
                      ) : (
                        <PhotoIcon className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {form.immagine_url && (
                      <button
                        type="button"
                        onClick={() => setIsPositionModalOpen(true)}
                        className="hover:bg-blue-100 text-gray-500 hover:text-blue-500 rounded p-0.5 transition-colors cursor-pointer"
                        title="Centra l'immagine"
                      >
                        <TargetIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  value={form.immagine_url}
                  onChange={(e) => setForm({ ...form, immagine_url: e.target.value })}
                  onBlur={() => handleUrlFetch(form.immagine_url)}
                  placeholder="Incolla URL o carica foto..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ricorrenza</label>
              
              <RecurrenceEditor 
                hideToggle={true}
                isRecurrent={true}
                interval={form.rruleInterval}
                onIntervalChange={(val) => setForm({...form, rruleInterval: val})}
                freq={form.rruleFreq}
                onFreqChange={(val) => setForm({...form, rruleFreq: val})}
                untilDate={form.rruleUntil}
                onUntilDateChange={(val) => setForm({...form, rruleUntil: val})}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="multiToggle"
                  checked={form.piu_volte}
                  onChange={(e) => handlePiuVolteToggle(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="multiToggle" className="text-sm font-bold text-gray-800 cursor-pointer select-none">
                  Va completata più volte in una giornata
                </label>
              </div>
              
              {form.piu_volte && (
                <div className="flex items-center justify-between mt-4 pl-8 animate-fadeIn">
                   <span className="text-sm font-medium text-gray-600">Volte al giorno:</span>
                   <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <button type="button" onClick={decrementTarget} className="px-4 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-500 font-black transition-colors">-</button>
                      <span className="px-4 py-1.5 font-bold text-gray-800 border-x border-gray-100 min-w-[3rem] text-center">{form.target_completamenti}</span>
                      <button type="button" onClick={incrementTarget} className="px-4 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-green-500 font-black transition-colors">+</button>
                   </div>
                </div>
              )}
            </div>

          </form>
      </BaseModal>

      {/* MODALE IN OVERLAY PER CENTRARE L'IMMAGINE */}
      <ImagePositionModal
        isOpen={isPositionModalOpen}
        onClose={() => setIsPositionModalOpen(false)}
        imageUrl={resolveImageUrl(form.immagine_url) || DEFAULT_COVER_IMAGE}
        value={form.immagine_posizione}
        onChange={(val) => setForm({ ...form, immagine_posizione: val })}
        titlePreview={form.titolo || 'Titolo Routine'}
      />
    </>
  );
};

export default RoutineNewModal;