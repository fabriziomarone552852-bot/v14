// src/mobile/components/modals/event/MobileEventRecurrenceSection.tsx
import React, { useRef } from 'react';
import type { EventFormState } from '@/hooks/forms/useEventFormLogic';
import { MobileEventLShapeBackground } from './MobileEventLShapeBackground';
import { MobileEventRecurrenceFrequencyRow } from './MobileEventRecurrenceFrequencyRow';

export interface MobileEventRecurrenceSectionProps {
  newEventForm: EventFormState;
  setNewEventForm: React.Dispatch<React.SetStateAction<EventFormState>>;
  isRecurrent: boolean;
  setIsRecurrent: (val: boolean) => void;
  rruleInterval: string;
  setRruleInterval: (val: string) => void;
  rruleFreq: string;
  rruleUntil: string;
  setRruleUntil: (val: string) => void;
  activeDatePicker: 'start' | 'end' | 'until' | null;
  setActiveDatePicker: (picker: 'start' | 'end' | 'until' | null) => void;
  onOpenFreqModal: () => void;
  isModalOpen: boolean;
}

export const MobileEventRecurrenceSection: React.FC<MobileEventRecurrenceSectionProps> = ({
  newEventForm,
  setNewEventForm,
  isRecurrent,
  setIsRecurrent,
  rruleInterval,
  setRruleInterval,
  rruleFreq,
  rruleUntil,
  setRruleUntil,
  activeDatePicker,
  setActiveDatePicker,
  onOpenFreqModal,
  isModalOpen,
}) => {
  const lShapeContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full relative" ref={lShapeContainerRef}>
      {/* Se RICORRENTE è attivo: Disegna la nuvoletta ad L come un unico percorso continuo */}
      <MobileEventLShapeBackground
        isRecurrent={isRecurrent}
        isModalOpen={isModalOpen}
        containerRef={lShapeContainerRef}
      />

      {/* Riga 1: Checkbox Tutto il giorno (sx) e Evento ricorrente (dx) */}
      <div className="grid grid-cols-2 gap-3 items-start relative z-10">
        {/* Card Tutto il giorno */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80 flex items-center gap-2 h-[46px] shadow-2xs">
          <input
            type="checkbox"
            id="mobileAllDayToggle"
            checked={newEventForm.tutto_il_giorno}
            onChange={(e) =>
              setNewEventForm((prev) => ({
                ...prev,
                tutto_il_giorno: e.target.checked,
                ora_inizio: '',
                ora_fine: '',
              }))
            }
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
          />
          <label
            htmlFor="mobileAllDayToggle"
            className="text-xs sm:text-sm font-bold text-gray-800 cursor-pointer select-none truncate"
          >
            Tutto il giorno
          </label>
        </div>

        {/* Card Evento ricorrente */}
        <div
          className={
            !isRecurrent
              ? 'bg-gray-50 p-3 rounded-xl border border-gray-200/80 flex items-center gap-2 h-[46px] shadow-2xs'
              : 'p-3 flex items-center gap-2 h-[46px]'
          }
        >
          <input
            type="checkbox"
            id="mobileRecurrenceToggle"
            checked={isRecurrent}
            onChange={(e) => setIsRecurrent(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
          />
          <label
            htmlFor="mobileRecurrenceToggle"
            className="text-xs sm:text-sm font-bold text-gray-800 cursor-pointer select-none truncate"
          >
            Evento ricorrente
          </label>
        </div>
      </div>

      {/* Riga 2: Controlli Frequenza */}
      {isRecurrent && (
        <MobileEventRecurrenceFrequencyRow
          rruleInterval={rruleInterval}
          setRruleInterval={setRruleInterval}
          rruleFreq={rruleFreq}
          rruleUntil={rruleUntil}
          setRruleUntil={setRruleUntil}
          activeDatePicker={activeDatePicker}
          setActiveDatePicker={setActiveDatePicker}
          onOpenFreqModal={onOpenFreqModal}
        />
      )}
    </div>
  );
};

export default MobileEventRecurrenceSection;
