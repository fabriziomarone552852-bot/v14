// src/components/trackers/shared/TrackerMultiYearSelect.tsx
import React, { useState, useEffect } from 'react';
import { SelectModalDialog } from '@/components/shared/form/SelectModalDialog';
import {
  BackIcon,
  ForwardIcon,
  DropdownIcon,
  CancelIcon,
} from '@/components/shared/utils/Icons';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { toggleMultiOrValue } from '@/utils/trackerFilterUtils';

export interface TrackerMultiYearSelectProps {
  label?: string;
  years: readonly string[];
  onChange: (nextYears: string[]) => void;
  allLabel?: string;
  asModal?: boolean;
}

const get9YearRangeStart = (y: number): number => {
  return 2000 + Math.floor((y - 2000) / 9) * 9;
};

export const TrackerMultiYearSelect: React.FC<TrackerMultiYearSelectProps> = ({
  label = 'Anno di Uscita',
  years,
  onChange,
  allLabel = 'Tutti gli anni',
  asModal = false,
}) => {
  const currentYear = new Date().getFullYear();
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [yearRangeStart, setYearRangeStart] = useState<number>(() =>
    get9YearRangeStart(currentYear)
  );

  const hasSelection = years.length > 0;
  const summaryText = !hasSelection
    ? allLabel
    : years.length === 1
    ? years[0]
    : `${years.length} selezionati`;

  const ref = useOutsideClick<HTMLDivElement>(() => {
    if (!asModal && isOpen) setIsOpen(false);
  });

  useEffect(() => {
    if (isOpen) {
      const anchorYear =
        years.length > 0 && /^\d{4}$/.test(years[years.length - 1])
          ? Number(years[years.length - 1])
          : currentYear;
      setYearRangeStart(get9YearRangeStart(anchorYear));

      if (!asModal && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUpwards(spaceBelow < 280);
      }
    }
  }, [isOpen, asModal, currentYear, ref]);

  const gridYears = Array.from({ length: 9 }, (_, i) => String(yearRangeStart + i));

  const renderYearGridContent = () => (
    <div className="select-none">
      {/* Navigazione blocco 9 anni in stile DatePicker */}
      <div className="flex justify-between items-center mb-2 px-1">
        <button
          type="button"
          onClick={() => setYearRangeStart((prev) => prev - 9)}
          className="text-gray-400 hover:text-gray-800 transition-colors focus:outline-none cursor-pointer p-1 rounded-lg hover:bg-gray-100"
          title="Anni precedenti"
        >
          <BackIcon className="w-4 h-4" />
        </button>
        <span className="font-bold text-gray-800 text-sm">
          {yearRangeStart} - {yearRangeStart + 8}
        </span>
        <button
          type="button"
          onClick={() => setYearRangeStart((prev) => prev + 9)}
          className="text-gray-400 hover:text-gray-800 transition-colors focus:outline-none cursor-pointer p-1 rounded-lg hover:bg-gray-100"
          title="Anni successivi"
        >
          <ForwardIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Griglia 3x3 circolare in stile DatePicker con selezione multipla */}
      <div className="grid grid-cols-3 gap-y-3 gap-x-2 mt-2 p-1">
        {gridYears.map((yr) => {
          const isSelected = years.includes(yr);
          const isTodayYear = Number(yr) === currentYear;

          return (
            <div key={yr} className="flex justify-center items-center">
              <button
                type="button"
                onClick={() => {
                  const next = toggleMultiOrValue(years, yr).sort((a, b) =>
                    b.localeCompare(a)
                  );
                  onChange(next);
                }}
                className={`w-12 h-12 flex justify-center items-center rounded-full text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md font-extrabold ring-4 ring-blue-100'
                    : isTodayYear
                    ? 'bg-amber-500 text-white shadow-md ring-4 ring-amber-100 font-extrabold hover:bg-amber-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {yr}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={ref}>
      <div className="flex items-center justify-between gap-1.5 mb-1 min-h-[18px]">
        <label className="block text-xs font-bold text-gray-500 uppercase truncate">
          {label}
        </label>
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

          {!asModal && isOpen && (
            <div
              className={`absolute left-0 z-[100] w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl p-3 animate-fadeIn ${
                openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
              }`}
            >
              {renderYearGridContent()}
            </div>
          )}
        </div>

        {!asModal && hasSelection && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
              setIsOpen(false);
            }}
            className="text-red-400 hover:text-red-600 cursor-pointer shrink-0 transition-colors"
            title="Azzera selezione anno"
          >
            <CancelIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {asModal && (
        <SelectModalDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={label}
          maxWidthClass="max-w-xs"
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
                Conferma{hasSelection ? ` (${years.length})` : ''}
              </button>
            </div>
          }
        >
          {renderYearGridContent()}
        </SelectModalDialog>
      )}
    </div>
  );
};

export default TrackerMultiYearSelect;
