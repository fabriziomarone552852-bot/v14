// src/components/dashboard/EventDetailModal.tsx
import React from 'react';
import type { CalendarEvent } from '@/types';
import { translateRRule } from '@/utils/rruleUtils';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { Badge } from '@/components/shared/utils/Badges';
import { EditIcon, TrashIcon, ArrowRightLongIcon } from '@/components/shared/utils/Icons';
import { LocationPreview } from '@/components/shared/form';
import { useEventDetailLogic } from '@/hooks/forms/useEventDetailLogic';

export interface EventDeletePayload {
  id: number;
  mode: 'single' | 'future' | 'all';
  dateStr: string;
  currentRrule?: string;
  currentEsclusioni?: string;
}

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: CalendarEvent | null; 
  onEditClick: () => void;
  onDeleteClick: (payload: EventDeletePayload) => void; 
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ 
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
    <>
      <button title="Modifica" onClick={onEditClick} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
        <EditIcon className="h-5 w-5" />
      </button>
      <button title="Elimina" onClick={handleDeleteClick} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
        <TrashIcon className="h-5 w-5" />
      </button>
    </>
  );

  const HeaderTags = !showRecurringDeleteOptions && (
    <Badge variant="category" colorHex={selectedEvent.categoryColor}>
      {selectedEvent.category}
    </Badge>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={HeaderTags || <span />} 
      headerActions={HeaderActions}
      maxWidthClass="max-w-md"
    >
      {showRecurringDeleteOptions ? (
        <div className="flex flex-col items-center justify-center py-2 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-5">
            <TrashIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 mb-2">Elimina Evento Ricorrente</h3>
          <p className="text-sm text-gray-500 mb-8 px-2">
            Questo evento si ripete nel tempo. Quali occorrenze desideri rimuovere dal calendario?
          </p>
          
          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={() => confirmRecurringDelete('single')} 
              className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
            >
              Elimina solo questo evento
            </button>
            <button 
              onClick={() => confirmRecurringDelete('future')} 
              className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
            >
              Elimina questo e i successivi
            </button>
            <button 
              onClick={() => confirmRecurringDelete('all')} 
              className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
            >
              Elimina tutte le ripetizioni
            </button>
            <button 
              onClick={() => setShowRecurringDeleteOptions(false)} 
              className="w-full py-3 px-4 mt-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 font-bold rounded-xl transition-all cursor-pointer"
            >
              Annulla operazione
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">{selectedEvent.title}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm font-bold text-red-500">
              <span>Data: {dataInizio} {selectedEvent.time && ` ${selectedEvent.time}`}</span>
              {haFine && (
                <>
                  <ArrowRightLongIcon className="w-4 h-4" />
                  <span>
                    {dataFine && dataFine !== dataInizio ? `${dataFine} ` : ''}
                    {selectedEvent.endTime && ` ${selectedEvent.endTime}`}
                  </span>
                </>
              )}
            </div>
            
            {selectedEvent.rrule && (
              <div className="mt-2 inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-700">
                🔄 {translateRRule(selectedEvent.rrule, selectedEvent.dateStr)}
              </div>
            )}
          </div>

          {selectedEvent.location && (
            <LocationPreview location={selectedEvent.location} />
          )}
          
          {selectedEvent.description && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Note aggiuntive</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
            </div>
          )}
        </div>
      )}
    </BaseModal>
  );
};

export default EventDetailModal;