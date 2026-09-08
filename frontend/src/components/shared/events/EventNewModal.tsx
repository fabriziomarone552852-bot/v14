// src/components/shared/events/EventNewModal.tsx
import React from 'react';
import { CategoryGenre, type DbEvent, type CalendarEvent } from '@/types';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import CategorySelect from '@/components/shared/utils/CategorySelect';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { CancelIcon } from '@/components/shared/utils/Icons';
import { RecurrenceEditor } from '@/components/shared/utils/RecurrenceEditor';
import TimeInput from '@/components/shared/utils/TimeInput';
import { FormInput, FormTextarea, LocationAutocompleteInput } from '@/components/shared/form';
import { useEventFormLogic } from '@/hooks/forms/useEventFormLogic';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: CalendarEvent | null;
  onEventSaved?: (savedEvent?: DbEvent) => void;
  initialDate?: string | null;
}

const NewEventModal: React.FC<NewEventModalProps> = ({
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

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={eventToEdit ? 'Modifica Evento' : 'Nuovo Evento'}
      maxWidthClass="max-w-xl"
      formId={dynamicFormId}
      confirmText={eventToEdit ? 'Aggiorna Evento' : 'Salva Evento'}
      isLoading={isSaving}
      isConfirmDisabled={isConfirmDisabled}
      overflowVisible={true}
    >
      <form
        id={dynamicFormId}
        onSubmit={handleSalvaNuovoEvento}
        className="space-y-4"
      >
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

        <FormTextarea
          label="Descrizione"
          placeholder="Aggiungi dettagli..."
          value={newEventForm.descrizione}
          onChange={(e) =>
            setNewEventForm({ ...newEventForm, descrizione: e.target.value })
          }
          className="h-20"
        />

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDayToggle"
              checked={newEventForm.tutto_il_giorno}
              onChange={(e) =>
                setNewEventForm({
                  ...newEventForm,
                  tutto_il_giorno: e.target.checked,
                  ora_inizio: '',
                  ora_fine: '',
                })
              }
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="allDayToggle"
              className="text-sm font-bold text-gray-700 cursor-pointer select-none"
            >
              Tutto il giorno
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Data Inizio
            </label>
            <DatePicker
              value={newEventForm.data_inizio}
              onChange={(date) =>
                setNewEventForm({ ...newEventForm, data_inizio: date })
              }
              isOpen={activeDatePicker === 'start'}
              onToggle={() =>
                setActiveDatePicker(activeDatePicker === 'start' ? null : 'start')
              }
              onClose={() => setActiveDatePicker(null)}
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Ora Inizio
            </label>
            <TimeInput
              value={newEventForm.ora_inizio}
              onChange={(newTime: string) =>
                setNewEventForm({ ...newEventForm, ora_inizio: newTime })
              }
              disabled={newEventForm.tutto_il_giorno}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 items-end">
          <div className="relative">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Data Fine
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <DatePicker
                  value={newEventForm.data_fine}
                  onChange={(date) =>
                    setNewEventForm({ ...newEventForm, data_fine: date })
                  }
                  isOpen={activeDatePicker === 'end'}
                  onToggle={() =>
                    setActiveDatePicker(activeDatePicker === 'end' ? null : 'end')
                  }
                  onClose={() => setActiveDatePicker(null)}
                  placeholder="Stesso giorno"
                />
              </div>
              {newEventForm.data_fine && (
                <button
                  type="button"
                  onClick={() =>
                    setNewEventForm({ ...newEventForm, data_fine: '' })
                  }
                  className="text-red-400 hover:text-red-600 cursor-pointer"
                  title="Rimuovi data fine"
                >
                  <CancelIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Ora Fine
            </label>
            <TimeInput
              value={newEventForm.ora_fine}
              onChange={(newTime: string) =>
                setNewEventForm({ ...newEventForm, ora_fine: newTime })
              }
              disabled={newEventForm.tutto_il_giorno}
            />
          </div>
        </div>

        <RecurrenceEditor
          isRecurrent={isRecurrent}
          onRecurrentChange={setIsRecurrent}
          interval={rruleInterval}
          onIntervalChange={setRruleInterval}
          freq={rruleFreq}
          onFreqChange={setRruleFreq}
          untilDate={rruleUntil}
          onUntilDateChange={setRruleUntil}
        />

        <div className="grid grid-cols-2 gap-4 mt-2 items-end">
          <div className="w-full">
            <CategorySelect
              value={newEventForm.category}
              onChange={(catName) =>
                setNewEventForm({ ...newEventForm, category: catName })
              }
              genreType={CategoryGenre.EVENTS}
            />
          </div>

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
        </div>
      </form>
    </BaseModal>
  );
};

export default NewEventModal;