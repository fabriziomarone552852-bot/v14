// src/mobile/components/trackers/shared/MobileTrackerSearchHeader.tsx
import React from 'react';
import { RotateCcw } from 'lucide-react';
import { SearchIcon, CloseIcon, BackIcon } from '@/components/shared/utils/Icons';

export interface MobileTrackerSearchHeaderProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  keyword: string;
  onKeywordChange: (val: string) => void;
  onInputActivate?: () => void;
  onExecuteSearch: () => void;
  onBack: () => void;
  onClearAll: () => void;
  placeholder: string;
  isClearHighlighted: boolean;
  backTitle?: string;
  autoFocus?: boolean;
}

export const MobileTrackerSearchHeader: React.FC<MobileTrackerSearchHeaderProps> = ({
  inputRef,
  keyword,
  onKeywordChange,
  onInputActivate,
  onExecuteSearch,
  onBack,
  onClearAll,
  placeholder,
  isClearHighlighted,
  backTitle = 'Torna indietro',
  autoFocus = false,
}) => {
  return (
    <div className="border-b border-gray-200 bg-white shrink-0 pt-[env(safe-area-inset-top,0px)] shadow-2xs z-20">
      <div className="px-3 h-14 flex items-center gap-2 max-w-lg mx-auto relative">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer shrink-0 flex items-center justify-center"
          title={backTitle}
          aria-label={backTitle}
        >
          <BackIcon className="w-5 h-5 text-gray-800" />
        </button>

        <div className="relative flex-1 flex items-center min-w-0">
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            autoFocus={autoFocus}
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            onClick={onInputActivate}
            onFocus={onInputActivate}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onExecuteSearch();
              }
            }}
            placeholder={placeholder}
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-2xs"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => onKeywordChange('')}
              className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-600 active:scale-90 transition-all cursor-pointer"
              title="Cancella testo"
              aria-label="Cancella testo"
            >
              <CloseIcon className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClearAll}
          className={`w-9 h-9 rounded-xl border active:scale-90 transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-2xs ${
            isClearHighlighted
              ? 'border-red-200/80 bg-red-50/60 text-red-500 hover:text-red-700 hover:bg-red-50'
              : 'border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
          title="Ripristina tutta la ricerca"
          aria-label="Ripristina ricerca"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );
};

export default MobileTrackerSearchHeader;
