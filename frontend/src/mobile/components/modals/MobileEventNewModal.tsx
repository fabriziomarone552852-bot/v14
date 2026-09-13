// src/mobile/components/modals/MobileEventNewModal.tsx
import React, { useState } from 'react';
import { CategoryGenre, type DbEvent, type CalendarEvent } from '@/types';
import CategorySelect from '@/components/shared/utils/CategorySelect';
import MobileBaseModal from './MobileBaseModal';
import { FormInput, FormTextarea, LocationAutocompleteInput } from '@/components/shared/form';
import { useEventFormLogic } from '@/hooks/forms/useEventFormLogic';
import { MobileEventDateTimeSection } from './event/MobileEventDateTimeSection';
import { MobileEventRecurrenceSection } from './event/MobileEventRecurrenceSection';
import { MobileEventFrequencyPickerModal } from './event/MobileEventFrequencyPickerModal';

interface MobileEventNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: CalendarEvent | null;
  onEventSaved?: (savedEvent?: DbEvent) => void;
  initialDate?: string | null;
}

export const MobileEventNewModal: React.FC<MobileEventNewModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  initialDate,
  onEventSaved,
}) => {
  const {
    newEventForm,
    setNewEventForm,
    dynamicFormId,
    activeDatePicker,
    setActiveDatePicker,
    isRecurrent,
    setIsRecurrent,
    rruleInterval,
    setRruleInterval,
    rruleFreq,
    setRruleFreq,
    rruleUntil,
    setRruleUntil,
    isSaving,
    handleSalvaNuovoEvento,
    isConfirmDisabled,
  } = useEventFormLogic({
    isOpen,
    onClose,
    eventToEdit,
    initialDate,
    onEventSaved,
  });

  const [isFreqModalOpen, setIsFreqModalOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <MobileBaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={eventToEdit ? 'Modifica Evento' : 'Nuovo Evento'}
        formId={dynamicFormId}
        confirmText={eventToEdit ? 'Aggiorna Evento' : 'Salva Evento'}
        isLoading={isSaving}
        isConfirmDisabled={isConfirmDisabled}
      >
        <form
          id={dynamicFormId}
          onSubmit={handleSalvaNuovoEvento}
          className="space-y-4"
        >
          {/* Rigo 1: Titolo */}
          <div className="w-full">
            <FormInput
              label="Titolo Evento"
              type="text"
              required
              placeholder="Es. Visita Medica, Riunione..."
              value={newEventForm.titolo}
              onChange={(e) =>
                setNewEventForm({ ...newEventForm, titolo: e.target.value })
              }
            />
          </div>

          {/* Rigo 2: Descrizione */}
          <div className="w-full">
            <FormTextarea
              label="Descrizione"
              placeholder="Aggiungi dettagli..."
              value={newEventForm.descrizione}
              onChange={(e) =>
                setNewEventForm({ ...newEventForm, descrizione: e.target.value })
              }
              className="h-20"
            />
          </div>

          {/* Rigo 3 & 4: Date & Orari (Inizio / Fine) */}
          <MobileEventDateTimeSection
            newEventForm={newEventForm}
            setNewEventForm={setNewEventForm}
            activeDatePicker={activeDatePicker}
            setActiveDatePicker={setActiveDatePicker}
          />

          {/* Rigo 5: Tutto il giorno / Ricorrenza */}
          <MobileEventRecurrenceSection
            newEventForm={newEventForm}
            setNewEventForm={setNewEventForm}
            isRecurrent={isRecurrent}
            setIsRecurrent={setIsRecurrent}
            rruleInterval={rruleInterval}
            setRruleInterval={setRruleInterval}
            rruleFreq={rruleFreq}
            rruleUntil={rruleUntil}
            setRruleUntil={setRruleUntil}
            activeDatePicker={activeDatePicker}
            setActiveDatePicker={setActiveDatePicker}
            onOpenFreqModal={() => setIsFreqModalOpen(true)}
            isModalOpen={isOpen}
          />

          {/* Rigo 6: Categoria con overlay centrato */}
          <div className="w-full">
            <CategorySelect
              value={newEventForm.category}
              onChange={(catName) =>
                setNewEventForm({ ...newEventForm, category: catName })
              }
              genreType={CategoryGenre.EVENTS}
              overlay={true}
            />
          </div>

          {/* Rigo 7: Luogo */}
          <div className="w-full">
            <LocationAutocompleteInput
              label="Luogo"
              placeholder="Es. Via Roma 10, Milano o Ufficio..."
              value={newEventForm.luogo}
              onChange={(val) =>
                setNewEventForm({ ...newEventForm, luogo: val })
              }
            />
          </div>
        </form>
      </MobileBaseModal>

      {/* Modal Scelta Frequenza */}
      <MobileEventFrequencyPickerModal
        isOpen={isFreqModalOpen}
        onClose={() => setIsFreqModalOpen(false)}
        rruleFreq={rruleFreq}
        setRruleFreq={setRruleFreq}
        rruleInterval={rruleInterval}
      />
    </>
  );
};

export default MobileEventNewModal;
