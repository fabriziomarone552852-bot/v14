// src/mobile/components/modals/event/MobileEventFrequencyPickerModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';

export const FREQ_OPTIONS = [
  { value: 'DAILY', labelSingular: 'giorno', labelPlural: 'giorni' },
  { value: 'WEEKLY', labelSingular: 'settimana', labelPlural: 'settimane' },
  { value: 'MONTHLY', labelSingular: 'mese', labelPlural: 'mesi' },
  { value: 'YEARLY', labelSingular: 'anno', labelPlural: 'anni' },
];

interface MobileEventFrequencyPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rruleFreq: string;
  setRruleFreq: (freq: string) => void;
  rruleInterval: string;
}

export const MobileEventFrequencyPickerModal: React.FC<MobileEventFrequencyPickerModalProps> = ({
  isOpen,
  onClose,
  rruleFreq,
  setRruleFreq,
  rruleInterval,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn pointer-events-auto select-none"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 max-w-[90vw] animate-fadeIn max-h-[75vh] flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 shrink-0">
          <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            Frequenza Ripetizione
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="py-2 space-y-1">
          {FREQ_OPTIONS.map((f) => {
            const isSelected = rruleFreq === f.value;
            const itemLabel =
              parseInt(rruleInterval, 10) > 1 ? f.labelPlural : f.labelSingular;
            return (
              <div
                key={f.value}
                onClick={() => {
                  setRruleFreq(f.value);
                  onClose();
                }}
                className={`px-3 py-2.5 rounded-xl text-sm font-bold capitalize cursor-pointer flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-blue-900'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span>{itemLabel}</span>
                {isSelected && (
                  <CheckCircleIcon className="w-4 h-4 text-blue-600 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MobileEventFrequencyPickerModal;
