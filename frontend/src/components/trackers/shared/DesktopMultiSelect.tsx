// src/components/trackers/shared/DesktopMultiSelect.tsx
import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, DropdownIcon, CancelIcon } from '@/components/shared/utils/Icons';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';
import {
  formatMultiSelectSummary,
  toggleMultiOrValue,
  type FilterSelectOption,
} from '@/utils/trackerFilterUtils';

export interface DesktopMultiSelectProps {
  label: string;
  values: readonly string[];
  options: readonly FilterSelectOption[];
  onChange: (nextValues: string[]) => void;
  allLabel?: string;
  headerAction?: React.ReactNode;
  displayValueOverride?: string;
}

export const DesktopMultiSelect: React.FC<DesktopMultiSelectProps> = ({
  label,
  values,
  options,
  onChange,
  allLabel = 'Tutti',
  headerAction,
  displayValueOverride,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const { handleScroll, scrollbarClass } = useFadeScrollbar();

  const hasSelection = values.length > 0;
  const summaryText = formatMultiSelectSummary(
    values,
    options,
    allLabel,
    displayValueOverride
  );

  const ref = useOutsideClick<HTMLDivElement>(() => {
    if (isOpen) setIsOpen(false);
  });

  useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 240);
    }
  }, [isOpen, ref]);

  return (
    <div ref={ref}>
      <div className="flex items-center justify-between gap-1.5 mb-1 min-h-[18px]">
        <label className="block text-xs font-bold text-gray-500 uppercase truncate">
          {label}
        </label>
        {headerAction && (
          <div className="shrink-0 flex items-center">{headerAction}</div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs transition-colors cursor-pointer outline-none ${
              hasSelection
                ? 'border-blue-300 bg-blue-50/50 text-blue-900 font-bold'
                : 'border-gray-200 bg-white text-gray-700 font-normal hover:border-gray-300'
            }`}
          >
            <span className="truncate">{summaryText}</span>
            <DropdownIcon
              className="w-4 h-4 text-gray-400 shrink-0 ml-2"
              isDropdownOpen={isOpen}
            />
          </button>

          {isOpen && (
            <div
              onScroll={handleScroll}
              className={`absolute z-[100] min-w-full w-max max-w-[260px] bg-white border border-gray-100 rounded-xl shadow-xl py-1 max-h-64 overflow-y-auto ${scrollbarClass} animate-fadeIn ${
                openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  onChange([]);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  !hasSelection
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span>{allLabel}</span>
                {!hasSelection && (
                  <CheckCircleIcon className="w-3.5 h-3.5 text-blue-700 shrink-0 ml-2" />
                )}
              </button>

              {options.map((opt) => {
                const isSelected = values.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(toggleMultiOrValue(values, opt.value))}
                    className={`w-full px-3 py-2 text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className="truncate text-left">{opt.label}</span>
                    {isSelected && (
                      <CheckCircleIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {hasSelection && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
              setIsOpen(false);
            }}
            className="text-red-400 hover:text-red-600 cursor-pointer shrink-0 transition-colors"
            title={`Azzera ${label.toLowerCase()}`}
          >
            <CancelIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DesktopMultiSelect;
