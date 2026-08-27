// src/context/EventModalContext.tsx
import React, { createContext, useContext, type ReactNode } from 'react';
import type { CalendarEvent } from '@/types';
import EventDetailModal, { type EventDeletePayload } from '@/components/shared/events/EventDetailModal';
import NewEventModal from '@/components/shared/events/EventNewModal';
import { useEventMutations } from '@/hooks/mutations/useEventMutations';
import { useModal } from '@/hooks/useModals';

// 1. Definiamo l'interfaccia del Context con tipi stringenti (Zero any!)
interface EventModalContextType {
  isDetailOpen: boolean;
  selectedEvent: CalendarEvent | null;
  isFormOpen: boolean;
  eventToEdit: CalendarEvent | null;
  initialDate: string | null;
  openEventDetail: (event: CalendarEvent) => void;
  closeEventDetail: () => void;
  openEventForm: (eventToEdit?: CalendarEvent | null, initialDate?: string | null) => void;
  closeEventForm: () => void;
}

// Creiamo il context impostando il valore iniziale come undefined per sicurezza
const EventModalContext = createContext<EventModalContextType | undefined>(undefined);

interface EventFormModalState {
  eventToEdit?: CalendarEvent | null;
  initialDate?: string | null;
}

export const EventModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const detailModal = useModal<CalendarEvent>();
  const formModal = useModal<EventFormModalState>();

  const { deleteRecurringEvent } = useEventMutations(['events']);

  const handleEditEvent = () => {
    if (detailModal.data) {
      formModal.open({ eventToEdit: detailModal.data, initialDate: null });
      detailModal.close();
    }
  };

  const handleDeleteEvent = (payload: EventDeletePayload) => {
    deleteRecurringEvent(payload);
    detailModal.close();
  };

  return (
    <EventModalContext.Provider
      value={{
        isDetailOpen: detailModal.isOpen,
        selectedEvent: detailModal.data || null,
        isFormOpen: formModal.isOpen,
        eventToEdit: formModal.data?.eventToEdit || null,
        initialDate: formModal.data?.initialDate || null,
        openEventDetail: (event) => detailModal.open(event),
        closeEventDetail: detailModal.close,
        openEventForm: (eventToEdit = null, initialDate = null) => {
          formModal.open({ eventToEdit, initialDate });
        },
        closeEventForm: formModal.close,
      }}
    >
      {children}
      <EventDetailModal 
        isOpen={detailModal.isOpen} 
        onClose={detailModal.close} 
        selectedEvent={detailModal.data} 
        onDeleteClick={handleDeleteEvent} 
        onEditClick={handleEditEvent} 
      />

      <NewEventModal 
        isOpen={formModal.isOpen} 
        onClose={formModal.close} 
        eventToEdit={formModal.data?.eventToEdit || null} 
        initialDate={formModal.data?.initialDate || null}
        onEventSaved={() => {}}  
      />
    </EventModalContext.Provider>
  );
};

// 3. Custom Hook per consumare comodamente il context in giro per l'app
export const useEventModals = (): EventModalContextType => {
  const context = useContext(EventModalContext);
  if (!context) {
    throw new Error('useEventModals deve essere utilizzato all\'interno di un EventModalProvider');
  }
  return context;
};