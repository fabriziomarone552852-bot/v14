// src/components/trackers/shared/DesktopGenreTriStateSelect.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { DropdownIcon, CheckCircleIcon, CancelIcon } from '@/components/shared/utils/Icons';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';
import { GenreIncludeAllButton } from './GenreIncludeAllButton';
import {
  EMPTY_GENRE_FILTER,
  cycleGenreTriState,
  formatGenreFilterSummary,
  getGenreTriState,
  isGenreFilterActive,
  type FilterSelectOption,
  type GenreFilterRule,
} from '@/utils/trackerFilterUtils';

export interface DesktopGenreTriStateSelectProps {
  label?: string;
  rule: GenreFilterRule;
  options: readonly FilterSelectOption[];
  onChange: (nextRule: GenreFilterRule) => void;
  allLabel?: string;
}

export const DesktopGenreTriStateSelect: React.FC<DesktopGenreTriStateSelectProps> = ({
  label = 'Genere',
  rule,
  options,
  onChange,
  allLabel = 'Tutti i generi',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const { handleScroll, scrollbarClass } = useFadeScrollbar();

  const isActive = isGenreFilterActive(rule);
  const hasOnlyExclude = rule.include.length === 0 && rule.exclude.length > 0;
  const summaryText = formatGenreFilterSummary(rule, options, allLabel);

  const ref = useOutsideClick<HTMLDivElement>(() => {
    if (isOpen) setIsOpen(false);
  });

  useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 260);
    }
  }, [isOpen, ref]);

  return (
    <div ref={ref}>
      <div className="flex items-center justify-between gap-1.5 mb-1 min-h-[18px]">
        <label className="block text-xs font-bold text-gray-500 uppercase truncate">
          {label}
        </label>
        <GenreIncludeAllButton rule={rule} onChange={onChange} />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
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

          {isOpen && (
            <div
              className={`absolute left-0 z-[100] w-60 sm:w-64 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden animate-fadeIn ${
                openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
              }`}
            >
              <div
                onScroll={handleScroll}
                className={`max-h-60 overflow-y-auto ${scrollbarClass} py-1`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onChange(EMPTY_GENRE_FILTER);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    !isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span>{allLabel}</span>
                  {!isActive && (
                    <CheckCircleIcon className="w-3.5 h-3.5 text-blue-700 shrink-0 ml-2" />
                  )}
                </button>

                {options.map((opt) => {
                  const state = getGenreTriState(rule, opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChange(cycleGenreTriState(rule, opt.value))}
                      className={`w-full px-3 py-2 text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        state === 'include'
                          ? 'bg-blue-600 text-white'
                          : state === 'exclude'
                          ? 'bg-sky-100 text-sky-800'
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <span className="truncate text-left">{opt.label}</span>

                      {state === 'include' && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/25 text-white shrink-0">
                          <Plus className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                      {state === 'exclude' && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-sky-200/90 text-sky-800 shrink-0">
                          <Minus className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {isActive && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(EMPTY_GENRE_FILTER);
              setIsOpen(false);
            }}
            className="text-red-400 hover:text-red-600 cursor-pointer shrink-0 transition-colors"
            title="Azzera generi"
          >
            <CancelIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DesktopGenreTriStateSelect;
