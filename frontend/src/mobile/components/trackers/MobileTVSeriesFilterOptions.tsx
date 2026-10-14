// src/mobile/components/trackers/MobileTVSeriesFilterOptions.tsx
import React, { useState } from 'react';
import type { MediaList } from '@/types/trackers';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import {
  SearchIcon,
  DropdownIcon,
  CheckCircleIcon,
} from '@/components/shared/utils/Icons';
import { SelectModalDialog } from '@/components/shared/form/SelectModalDialog';
import { MobileModalSelect } from '../common/MobileModalSelect';
import type { MediaFilterState } from '@/hooks/trackers/useMediaFilterOptions';

const BookmarkIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
    />
  </svg>
);

export interface MobileTVSeriesFilterOptionsProps {
  filters: MediaFilterState;
  hasActiveFilters: boolean;
  myLists?: MediaList[];
  availableGenres: Array<{ value: string; label: string }>;
  availableNetworks: Array<{ value: string; label: string }>;
  ratingOptions: Array<{ value: string; label: string }>;
  tmdbStatusOptions: Array<{ value: string; label: string }>;
  sortOptions: Array<{ value: string; label: string }>;
  isDatePickerOpen: boolean;
  setIsDatePickerOpen: (open: boolean) => void;
  handleFieldChange: <K extends keyof MediaFilterState>(field: K, value: MediaFilterState[K]) => void;
  toggleRating: (rating: string) => void;
  handleYearChange: (dateStr: string | null) => void;
  onExecuteSearch: () => void;
}

export const MobileTVSeriesFilterOptions: React.FC<MobileTVSeriesFilterOptionsProps> = ({
  filters,
  myLists,
  availableGenres,
  availableNetworks,
  ratingOptions,
  tmdbStatusOptions,
  sortOptions,
  isDatePickerOpen,
  setIsDatePickerOpen,
  handleFieldChange,
  toggleRating,
  handleYearChange,
  onExecuteSearch,
}) => {
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  const selectedList = myLists?.find((l) => l.id === filters.listId);
  const selectedListName = selectedList ? selectedList.name : 'Tutte le Serie';
  const selectedListCount = selectedList ? (selectedList.items?.length ?? 0) : null;

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
      {/* Area filtri scrollabile */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-3.5">
        {/* 1. BARRA PER L'APERTURA DEL MODALE DELLA LISTA */}
      <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsListModalOpen(true)}
          className="w-full p-3 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-gray-50/80 active:bg-gray-100/70 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
              <BookmarkIcon className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 leading-tight">
                Liste
              </span>
              <div className="flex items-center gap-2 mt-0.5 min-w-0">
                <span className="text-sm font-extrabold text-gray-900 truncate">
                  {selectedListName}
                </span>
                {selectedListCount !== null && (
                  <span className="text-[10px] font-bold bg-blue-100/80 text-blue-700 px-1.5 py-0.5 rounded-full shrink-0">
                    {selectedListCount} serie
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center shrink-0 text-gray-400">
            <DropdownIcon className="w-4 h-4 text-gray-400" isDropdownOpen={false} />
          </div>
        </button>
      </div>

      {/* MODALE CENTRALE PER LA SCELTA DELLA LISTA */}
      <SelectModalDialog
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        title="Liste"
        maxWidthClass="max-w-sm"
        zIndex={10040}
      >
        <div className="space-y-1.5 py-1">
          {/* Opzione Tutte le Serie */}
          <button
            type="button"
            onClick={() => {
              handleFieldChange('listId', null);
              setIsListModalOpen(false);
            }}
            className={`w-full py-3 px-3.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
              filters.listId === null
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]'
            }`}
          >
            <div className="truncate">
              <span className="truncate">Tutte le Serie</span>
            </div>
            {filters.listId === null && (
              <CheckCircleIcon className="w-4 h-4 shrink-0 text-white" />
            )}
          </button>

          {/* Elenco Liste Personali */}
          {myLists && myLists.length > 0 ? (
            myLists.map((list) => {
              const isSelected = filters.listId === list.id;
              const count = list.items?.length || 0;
              return (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => {
                    handleFieldChange('listId', list.id);
                    setIsListModalOpen(false);
                  }}
                  className={`w-full py-3 px-3.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]'
                  }`}
                >
                  <span className="truncate mr-2">{list.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      {count} serie
                    </span>
                    {isSelected && (
                      <CheckCircleIcon className="w-4 h-4 shrink-0 text-white" />
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-4 text-xs text-gray-400">
              Nessuna lista creata.
            </div>
          )}
        </div>
      </SelectModalDialog>

      {/* 2. CARD FILTRI APPROFONDITI (TUTTI CON MODALI CENTRALI) */}
      <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs p-3.5 space-y-3.5">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
          Filtri di Catalogo TMDB
        </h4>

        {/* Griglia Genere & Network con Modali Centrali */}
        <div className="grid grid-cols-2 gap-3">
          <MobileModalSelect
            label="Genere"
            title="Scegli Genere"
            value={filters.genre || 'all'}
            options={availableGenres}
            onChange={(val: string) => handleFieldChange('genre', val)}
            allLabel="Tutti i generi"
          />

          <MobileModalSelect
            label="Network"
            title="Scegli Network"
            value={filters.network || 'all'}
            options={availableNetworks}
            onChange={(val: string) => handleFieldChange('network', val)}
            allLabel="Tutti i network"
          />
        </div>

        {/* Griglia Anno & Stato Produzione */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Anno di Uscita
            </label>
            <div className="relative">
              <DatePicker
                value={filters.year && filters.year !== 'all' ? `${filters.year}-01-01` : ''}
                onChange={handleYearChange}
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
                selectionMode="year"
                overlay={true}
                align="center"
                customTrigger={
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs transition-colors cursor-pointer ${
                      filters.year && filters.year !== 'all'
                        ? 'border-blue-300 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-gray-200 bg-white text-gray-700 font-normal hover:border-gray-300'
                    }`}
                  >
                    <span className="truncate">
                      {filters.year && filters.year !== 'all' ? filters.year : 'Tutti gli anni'}
                    </span>
                    <DropdownIcon className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                  </button>
                }
              />
            </div>
          </div>

          <MobileModalSelect
            label="Stato Produzione"
            title="Stato Produzione"
            value={filters.tmdbStatus || 'all'}
            options={tmdbStatusOptions}
            onChange={(val: string) => handleFieldChange('tmdbStatus', val)}
            allLabel="Tutti gli stati"
          />
        </div>

        {/* Voto Personale (Multi-selezione) */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
            Voto Personale
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {ratingOptions.map((opt) => {
              const isSelected = (filters.ratings || []).includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleRating(opt.value)}
                  className={`flex items-center justify-center min-w-[2.75rem] h-9 px-2.5 rounded-xl text-xs font-extrabold transition-all border shrink-0 cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-2xs font-black'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ordinamento con Modale Centrale */}
        <div className="pt-2 border-t border-gray-100">
          <MobileModalSelect
            label="Ordina per"
            title="Ordina per"
            value={filters.sortBy || 'date_added_desc'}
            options={sortOptions}
            onChange={(val: string) => handleFieldChange('sortBy', val)}
            showAllOption={false}
          />
        </div>
      </div>

      </div>

      {/* 3. PULSANTE AZIONE FISSO IN FONDO */}
      <div className="shrink-0 p-3 pt-2 pb-[max(env(safe-area-inset-bottom,0px),12px)] bg-white/95 backdrop-blur-md border-t border-gray-200 z-20 shadow-xs">
        <button
          type="button"
          onClick={onExecuteSearch}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <SearchIcon className="w-4 h-4 text-white" />
          <span>
            {filters.listId !== null
              ? filters.keyword?.trim()
                ? 'Cerca nella Lista'
                : 'Mostra Serie della Lista'
              : 'Cerca su TMDB'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default MobileTVSeriesFilterOptions;
