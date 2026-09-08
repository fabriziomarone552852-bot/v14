// src/mobile/components/modals/MobileEventDetailModal.tsx
import React from 'react';
import type { CalendarEvent } from '@/types';
import { translateRRule } from '@/utils/rruleUtils';
import MobileBaseModal from './MobileBaseModal';
import { Badge } from '@/components/shared/utils/Badges';
import { EditIcon, TrashIcon, ArrowRightLongIcon } from '@/components/shared/utils/Icons';
import { LocationPreview } from '@/components/shared/form';
import { useEventDetailLogic } from '@/hooks/forms/useEventDetailLogic';
import type { EventDeletePayload } from '@/components/shared/events/EventDetailModal';

interface MobileEventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: CalendarEvent | null; 
  onEditClick: () => void;
  onDeleteClick: (payload: EventDeletePayload) => void; 
}

export const MobileEventDetailModal: React.FC<MobileEventDetailModalProps> = ({ 
  isOpen, onClose, selectedEvent, onEditClick, onDeleteClick 
}) => {
  const {
    dataInizio,
    dataFine,
    haFine,
    showRecurringDeleteOptions,
    setShowRecurringDeleteOptions,
    handleDeleteClick,
    confirmRecurringDelete,
  } = useEventDetailLogic({
    isOpen,
    selectedEvent,
    onDeleteClick,
  });

  if (!isOpen || !selectedEvent) return null;

  const HeaderActions = showRecurringDeleteOptions ? null : (
    <div className="flex items-center gap-1">
      <button 
        type="button"
        title="Modifica" 
        onClick={onEditClick} 
        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
      >
        <EditIcon className="h-5 w-5" />
      </button>
      <button 
        type="button"
        title="Elimina" 
        onClick={handleDeleteClick} 
        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );

  const HeaderTags = !showRecurringDeleteOptions && (
    <Badge variant="category" colorHex={selectedEvent.categoryColor}>
      {selectedEvent.category || 'Generico'}
    </Badge>
  );

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={HeaderTags || 'Dettaglio Evento'} 
      headerActions={HeaderActions}
    >
      {showRecurringDeleteOptions ? (
        <div className="flex flex-col items-center justify-center py-4 text-center animate-in fade-in duration-200">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <TrashIcon className="w-7 h-7 text-red-600" />
          </div>
          <h3 className="text-lg font-extrabold text-gray-900 mb-1.5">Elimina Evento Ricorrente</h3>
          <p className="text-xs text-gray-500 mb-6 px-2">
            Questo evento si ripete nel tempo. Quali occorrenze desideri rimuovere dal calendario?
          </p>
          
          <div className="flex flex-col gap-2.5 w-full">
            <button 
              type="button"
              onClick={() => confirmRecurringDelete('single')} 
              className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 font-bold rounded-xl transition-all text-xs sm:text-sm cursor-pointer"
            >
              Elimina solo questo evento
            </button>
            <button 
              type="button"
              onClick={() => confirmRecurringDelete('future')} 
              className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 font-bold rounded-xl transition-all text-xs sm:text-sm cursor-pointer"
            >
              Elimina questo e i successivi
            </button>
            <button 
              type="button"
              onClick={() => confirmRecurringDelete('all')} 
              className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl transition-all text-xs sm:text-sm cursor-pointer"
            >
              Elimina tutte le ripetizioni
            </button>
            <button 
              type="button"
              onClick={() => setShowRecurringDeleteOptions(false)} 
              className="w-full py-2.5 px-4 mt-1 text-gray-500 hover:text-gray-800 font-bold rounded-xl transition-all text-xs cursor-pointer"
            >
              Annulla operazione
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          {/* Titolo e Badge Ricorrenza */}
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 leading-snug">
              {selectedEvent.title}
            </h2>
            
            {/* Nuvoletta Ricorrenza Standardizzata */}
            {selectedEvent.rrule && (
              <div className="mt-2 inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-700">
                🔄 {translateRRule(selectedEvent.rrule, selectedEvent.dateStr)}
              </div>
            )}
          </div>

          {/* Rigo Data e Orari (Card azzurra) */}
          <div className="w-full bg-blue-50/60 border border-blue-100 p-3.5 rounded-xl">
            <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-gray-800">
              <span>{dataInizio} {selectedEvent.time ? `• ${selectedEvent.time}` : '• Tutto il giorno'}</span>
              {haFine && (
                <>
                  <ArrowRightLongIcon className="w-4 h-4 text-blue-500" />
                  <span>
                    {dataFine && dataFine !== dataInizio ? `${dataFine} ` : ''}
                    {selectedEvent.endTime && `• ${selectedEvent.endTime}`}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Luogo (se presente) */}
          {selectedEvent.location && (
            <LocationPreview location={selectedEvent.location} />
          )}
          
          {/* Note / Descrizione (se presente) */}
          {selectedEvent.description && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
                Note aggiuntive
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedEvent.description}
              </p>
            </div>
          )}
        </div>
      )}
    </MobileBaseModal>
  );
};

export default MobileEventDetailModal;
