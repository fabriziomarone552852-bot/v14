// src/mobile/components/common/MobileGenreTriStateModalSelect.tsx
import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { SelectModalDialog } from '@/components/shared/form/SelectModalDialog';
import { DropdownIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
import { GenreIncludeAllButton } from '@/components/trackers/shared/GenreIncludeAllButton';
import {
  EMPTY_GENRE_FILTER,
  cycleGenreTriState,
  formatGenreFilterSummary,
  getGenreTriState,
  isGenreFilterActive,
  type FilterSelectOption,
  type GenreFilterRule,
} from '@/utils/trackerFilterUtils';

export interface MobileGenreTriStateModalSelectProps {
  label?: string;
  title?: string;
  rule: GenreFilterRule;
  options: readonly FilterSelectOption[];
  onChange: (nextRule: GenreFilterRule) => void;
  allLabel?: string;
}

/**
 * Standard Mobile UI per filtro Generi a 3 stati (+ Includi / - Escludi / Neutro)
 * con pulsante "Includi tutti" (O -> E) sulla riga di "Genere" e modale centrato senza scrollbar visibile.
 */
export const MobileGenreTriStateModalSelect: React.FC<
  MobileGenreTriStateModalSelectProps
> = ({
  label = 'Genere',
  title = 'Genere',
  rule,
  options,
  onChange,
  allLabel = 'Tutti i generi',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isActive = isGenreFilterActive(rule);
  const hasOnlyExclude = rule.include.length === 0 && rule.exclude.length > 0;
  const summaryText = formatGenreFilterSummary(rule, options, allLabel);

  return (
    <div>
      <div className="flex items-center justify-between gap-1.5 mb-1 min-h-[18px]">
        <label className="block text-xs font-bold text-gray-500 uppercase truncate">
          {label}
        </label>
        <GenreIncludeAllButton rule={rule} onChange={onChange} />
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs transition-colors cursor-pointer outline-none ${
          hasOnlyExclude
            ? 'border-sky-300 bg-sky-50/70 text-sky-900 font-bold'
            : isActive
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

      <SelectModalDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        maxWidthClass="max-w-sm"
        zIndex={10040}
        headerAction={<GenreIncludeAllButton rule={rule} onChange={onChange} />}
        footerSlot={
          <div className="flex items-center gap-2">
            {isActive && (
              <button
                type="button"
                onClick={() => onChange(EMPTY_GENRE_FILTER)}
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
              Conferma
            </button>
          </div>
        }
      >
        <div className="space-y-1.5 py-1 select-none">
          <button
            type="button"
            onClick={() => {
              onChange(EMPTY_GENRE_FILTER);
              setIsOpen(false);
            }}
            className={`w-full py-3 px-3.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
              !isActive
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]'
            }`}
          >
            <span>{allLabel}</span>
            {!isActive && (
              <CheckCircleIcon className="w-4 h-4 text-white shrink-0" />
            )}
          </button>

          {options.map((opt) => {
            const state = getGenreTriState(rule, opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(cycleGenreTriState(rule, opt.value))}
                className={`w-full py-3 px-3.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  state === 'include'
                    ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
                    : state === 'exclude'
                    ? 'bg-sky-100 text-sky-800 border border-sky-200/90 shadow-2xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-transparent active:scale-[0.99]'
                }`}
              >
                <span className="truncate mr-2">{opt.label}</span>

                {state === 'include' && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/25 text-white shrink-0">
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
                {state === 'exclude' && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-200/90 text-sky-800 shrink-0">
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </SelectModalDialog>
    </div>
  );
};

export default MobileGenreTriStateModalSelect;
