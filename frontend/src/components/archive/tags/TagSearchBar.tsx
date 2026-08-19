// src/components/tags/TagSearchBar.tsx
import React from 'react';
import { SearchIcon, UndoIcon } from '@/components/shared/utils/Icons';

interface TagSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetSearch: () => void;
  totalCount: number;
  filteredCount: number;
  panelClass?: string;
}

export const TagSearchBar: React.FC<TagSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onResetSearch,
  totalCount,
  filteredCount,
  panelClass = '',
}) => {
  const isFiltered = searchQuery.trim().length > 0;

  return (
    <section className={`${panelClass} p-3 sm:p-4 shrink-0 flex items-center justify-between gap-4`}>
      {/* Campo di Ricerca a tutta larghezza */}
      <div className="relative flex-1 max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <SearchIcon className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cerca per parola chiave nei tag..."
          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm font-medium text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
        />
        {isFiltered && (
          <button
            type="button"
            onClick={onResetSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            title="Azzera ricerca"
          >
            <UndoIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Contatore dei Tag trovati */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200/60 text-purple-700 text-xs font-bold flex items-center gap-1.5">
          <span>
            {isFiltered
              ? `${filteredCount} di ${totalCount} tag`
              : `${totalCount} tag configurati`}
          </span>
        </div>
      </div>
    </section>
  );
};

export default TagSearchBar;
