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
import { MobileEventRecurringDeleteView } from './event';

export interface MobileEventDetailModalProps {
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
        <MobileEventRecurringDeleteView
          onConfirm={confirmRecurringDelete}
          onCancel={() => setShowRecurringDeleteOptions(false)}
        />
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
