// src/mobile/components/common/MobileMultiModalSelect.tsx
import React, { useState } from 'react';
import { SelectModalDialog } from '@/components/shared/form/SelectModalDialog';
import { DropdownIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
import {
  formatMultiSelectSummary,
  toggleMultiOrValue,
  type FilterSelectOption,
} from '@/utils/trackerFilterUtils';

export interface MobileMultiModalSelectProps {
  label: string;
  title?: string;
  values: readonly string[];
  options: readonly FilterSelectOption[];
  onChange: (nextValues: string[]) => void;
  allLabel?: string;
  disabled?: boolean;
  headerAction?: React.ReactNode;
  displayValueOverride?: string;
}

/**
 * Standard Mobile UI per selezioni multiple con logica "O" (OR):
 * Apre esclusivamente una finestra modale centrata (SelectModalDialog) con sfondo oscurato.
 */
export const MobileMultiModalSelect: React.FC<MobileMultiModalSelectProps> = ({
  label,
  title,
  values,
  options,
  onChange,
  allLabel = 'Tutti',
  disabled = false,
  headerAction,
  displayValueOverride,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasSelection = values.length > 0;
  const selectedName = formatMultiSelectSummary(
    values,
    options,
    allLabel,
    displayValueOverride
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-1.5 mb-1 min-h-[18px]">
        <label className="block text-xs font-bold text-gray-500 uppercase truncate">
          {label}
        </label>
        {headerAction && (
          <div className="shrink-0 flex items-center">{headerAction}</div>
        )}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs transition-colors cursor-pointer outline-none ${
          hasSelection
            ? 'border-blue-300 bg-blue-50/50 text-blue-900 font-bold'
            : 'border-gray-200 bg-white text-gray-700 font-normal hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="truncate">{selectedName}</span>
        <DropdownIcon
          className="w-4 h-4 text-gray-400 shrink-0 ml-2"
          isDropdownOpen={isOpen}
        />
      </button>

      <SelectModalDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title || `Scegli ${label}`}
        maxWidthClass="max-w-sm"
        zIndex={10040}
        footerSlot={
          <div className="flex items-center gap-2">
            {hasSelection && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="px-3.5 py-2.5 rounded-2xl bg-red-50 text-red-600 font-extrabold text-xs active:scale-95 transition-all cursor-pointer"
              >
                Azzera
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-blue-600 text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              Conferma{hasSelection ? ` (${values.length})` : ''}
            </button>
          </div>
        }
      >
        <div className="space-y-1.5 py-1 select-none">
          <button
            type="button"
            onClick={() => {
              onChange([]);
              setIsOpen(false);
            }}
            className={`w-full py-3 px-3.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
              !hasSelection
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]'
            }`}
          >
            <span>{allLabel}</span>
            {!hasSelection && (
              <CheckCircleIcon className="w-4 h-4 text-white shrink-0" />
            )}
          </button>

          {options.map((opt) => {
            const isSelected = values.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(toggleMultiOrValue(values, opt.value))}
                className={`w-full py-3 px-3.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]'
                }`}
              >
                <span className="truncate mr-2">{opt.label}</span>
                {isSelected && (
                  <CheckCircleIcon className="w-4 h-4 text-white shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </SelectModalDialog>
    </div>
  );
};

export default MobileMultiModalSelect;
