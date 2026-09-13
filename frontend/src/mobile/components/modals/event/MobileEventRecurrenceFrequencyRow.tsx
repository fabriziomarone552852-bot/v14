// src/mobile/components/modals/event/MobileEventRecurrenceFrequencyRow.tsx
import React from 'react';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import { CancelIcon, DropdownIcon } from '@/components/shared/utils/Icons';
import { FREQ_OPTIONS } from './MobileEventFrequencyPickerModal';

export interface MobileEventRecurrenceFrequencyRowProps {
  rruleInterval: string;
  setRruleInterval: (val: string) => void;
  rruleFreq: string;
  rruleUntil: string;
  setRruleUntil: (val: string) => void;
  activeDatePicker: 'start' | 'end' | 'until' | null;
  setActiveDatePicker: (picker: 'start' | 'end' | 'until' | null) => void;
  onOpenFreqModal: () => void;
}

export const MobileEventRecurrenceFrequencyRow: React.FC<MobileEventRecurrenceFrequencyRowProps> = ({
  rruleInterval,
  setRruleInterval,
  rruleFreq,
  rruleUntil,
  setRruleUntil,
  activeDatePicker,
  setActiveDatePicker,
  onOpenFreqModal,
}) => {
  const currentFreqObj = FREQ_OPTIONS.find((f) => f.value === rruleFreq) || FREQ_OPTIONS[1];
  const freqLabel =
    parseInt(rruleInterval, 10) > 1
      ? currentFreqObj.labelPlural
      : currentFreqObj.labelSingular;

  return (
    <div className="w-full mt-2 pt-2.5 px-3 pb-3 text-xs text-gray-700 relative z-10 animate-fadeIn">
      <div className="flex items-center gap-1.5 w-full flex-nowrap">
        <span className="font-bold text-gray-700 shrink-0">Ripeti ogni</span>
        <input
          type="number"
          min="1"
          value={rruleInterval}
          onChange={(e) => setRruleInterval(e.target.value)}
          className="w-9 px-1 py-1.5 border border-gray-300 rounded-lg text-center font-extrabold bg-white text-gray-800 focus:outline-none focus:border-blue-500 shadow-2xs shrink-0"
        />
        <button
          type="button"
          onClick={onOpenFreqModal}
          className="px-2 py-1.5 bg-white border border-gray-300 rounded-lg font-extrabold text-gray-800 text-xs flex items-center gap-1 hover:border-blue-500 transition-colors shadow-2xs cursor-pointer shrink-0"
        >
          <span>{freqLabel}</span>
          <DropdownIcon isDropdownOpen={false} />
        </button>
        <span className="font-bold text-gray-700 shrink-0 ml-0.5">fino a</span>
        <div className="flex-1 min-w-[85px] flex items-center gap-1">
          <div className="flex-1 min-w-0">
            <DatePicker
              value={rruleUntil}
              onChange={setRruleUntil}
              isOpen={activeDatePicker === 'until'}
              onToggle={() =>
                setActiveDatePicker(activeDatePicker === 'until' ? null : 'until')
              }
              onClose={() => setActiveDatePicker(null)}
              placeholder="Senza limite"
              overlay={true}
            />
          </div>
          {rruleUntil && (
            <button
              type="button"
              onClick={() => setRruleUntil('')}
              className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Rimuovi data limite"
            >
              <CancelIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
