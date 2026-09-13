// src/mobile/components/modals/event/MobileEventDateTimeSection.tsx
import React from 'react';
import type { EventFormState } from '@/hooks/forms/useEventFormLogic';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import TimeInput from '@/components/shared/utils/TimeInput';
import { CancelIcon } from '@/components/shared/utils/Icons';

interface MobileEventDateTimeSectionProps {
  newEventForm: EventFormState;
  setNewEventForm: React.Dispatch<React.SetStateAction<EventFormState>>;
  activeDatePicker: 'start' | 'end' | 'until' | null;
  setActiveDatePicker: (picker: 'start' | 'end' | 'until' | null) => void;
}

export const MobileEventDateTimeSection: React.FC<MobileEventDateTimeSectionProps> = ({
  newEventForm,
  setNewEventForm,
  activeDatePicker,
  setActiveDatePicker,
}) => {
  return (
    <>
      {/* Data Inizio & Ora Inizio */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <div className="w-full">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Data Inizio
          </label>
          <DatePicker
            value={newEventForm.data_inizio}
            onChange={(date) =>
              setNewEventForm((prev) => ({ ...prev, data_inizio: date }))
            }
            isOpen={activeDatePicker === 'start'}
            onToggle={() =>
              setActiveDatePicker(activeDatePicker === 'start' ? null : 'start')
            }
            onClose={() => setActiveDatePicker(null)}
            overlay={true}
          />
        </div>

        <div className="w-full">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Ora Inizio
          </label>
          <TimeInput
            value={newEventForm.ora_inizio}
            onChange={(newTime: string) =>
              setNewEventForm((prev) => ({ ...prev, ora_inizio: newTime }))
            }
            disabled={newEventForm.tutto_il_giorno}
          />
        </div>
      </div>

      {/* Data Fine & Ora Fine */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <div className="w-full">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Data Fine
          </label>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 min-w-0">
              <DatePicker
                value={newEventForm.data_fine}
                onChange={(date) =>
                  setNewEventForm((prev) => ({ ...prev, data_fine: date }))
                }
                isOpen={activeDatePicker === 'end'}
                onToggle={() =>
                  setActiveDatePicker(activeDatePicker === 'end' ? null : 'end')
                }
                onClose={() => setActiveDatePicker(null)}
                placeholder="Stesso giorno"
                overlay={true}
              />
            </div>
            {newEventForm.data_fine && (
              <button
                type="button"
                onClick={() =>
                  setNewEventForm((prev) => ({ ...prev, data_fine: '' }))
                }
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Rimuovi data fine"
              >
                <CancelIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="w-full">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Ora Fine
          </label>
          <TimeInput
            value={newEventForm.ora_fine}
            onChange={(newTime: string) =>
              setNewEventForm((prev) => ({ ...prev, ora_fine: newTime }))
            }
            disabled={newEventForm.tutto_il_giorno}
          />
        </div>
      </div>
    </>
  );
};

export default MobileEventDateTimeSection;
