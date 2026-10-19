// src/mobile/components/trackers/MobileSeriesSortFilterModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '@/components/shared/utils/Icons';
import type { CatalogStatusTab } from './catalog/MobileSeriesCatalogHeader';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';

export interface MobileSeriesSortFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'lists' | 'series';
  statusFilter: CatalogStatusTab;
  onSelectStatusFilter: (status: CatalogStatusTab) => void;
  sortOption: string;
  onSelectSortOption: (sort: string) => void;
}

export const MobileSeriesSortFilterModal: React.FC<MobileSeriesSortFilterModalProps> = ({
  isOpen,
  onClose,
  mode,
  statusFilter,
  onSelectStatusFilter,
  sortOption,
  onSelectSortOption,
}) => {
  const { handleScroll, scrollbarClass } = useFadeScrollbar();

  if (!isOpen) return null;

  const statusOptions: { id: CatalogStatusTab; label: string; dotColor: string }[] = [
    { id: 'all', label: 'Tutte le serie', dotColor: 'bg-blue-600' },
    { id: 'watching', label: 'In visione', dotColor: 'bg-yellow-500' },
    { id: 'to_watch', label: 'In lista', dotColor: 'bg-gray-400' },
    { id: 'waiting', label: 'In attesa', dotColor: 'bg-purple-500' },
    { id: 'completed', label: 'Completate', dotColor: 'bg-green-500' },
  ];

  const listSortOptions: { id: string; label: string }[] = [
    { id: 'recent', label: 'Più recenti (Modificate)' },
    { id: 'created_desc', label: 'Più recenti (Creazione)' },
    { id: 'name_asc', label: 'Alfabetico (A → Z)' },
    { id: 'name_desc', label: 'Alfabetico (Z → A)' },
    { id: 'count_desc', label: 'Numero di serie (Più ricche)' },
  ];

  const seriesSortOptions: { id: string; label: string }[] = [
    { id: 'added_desc', label: 'Ultime serie aggiunte' },
    { id: 'added_asc', label: 'Prime serie aggiunte' },
    { id: 'name_asc', label: 'Titolo (A → Z)' },
    { id: 'name_desc', label: 'Titolo (Z → A)' },
    { id: 'release_date_desc', label: 'Anno di uscita (Più recenti)' },
    { id: 'rating_desc', label: 'Voto personale (Più alto)' },
  ];

  const currentSortOptions = mode === 'lists' ? listSortOptions : seriesSortOptions;

  return createPortal(
    <div
      className="fixed inset-0 z-[10050] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn pointer-events-auto select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-4 sm:p-5 space-y-4 border border-gray-100 animate-scaleUp pointer-events-auto max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Intestazione Modale */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
              Filtro & Ordinamento
            </h3>
            <p className="text-[10px] font-bold text-gray-400">
              {mode === 'lists' ? 'Configura le liste personali' : 'Configura le serie della lista'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Chiudi"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo con le due sezioni a scorrimento verticale fluido */}
        <div
          onScroll={handleScroll}
          className={`flex-1 min-h-0 overflow-y-auto space-y-4 pr-0.5 ${scrollbarClass}`}
        >
          {/* SEZIONE 1: STATO DELLE SERIE (PARAMETRI DELL'OCCHIO) */}
          <div>
            <span className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2">
              Mostra serie per stato
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {statusOptions.map((opt) => {
                const isSelected = statusFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectStatusFilter(opt.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                        : 'bg-gray-50/80 border-gray-200/80 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${opt.dotColor} shrink-0`} />
                    <span className="truncate flex-1">{opt.label}</span>
                    {isSelected && (
                      <span className="text-blue-600 text-xs font-black shrink-0">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEZIONE 2: CRITERIO DI ORDINAMENTO */}
          <div>
            <span className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2">
              {mode === 'lists' ? 'Ordina le liste per' : 'Ordina le serie per'}
            </span>
            <div className="flex flex-col gap-1.5">
              {currentSortOptions.map((opt) => {
                const isSelected = sortOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectSortOption(opt.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                        : 'bg-white border-gray-200/80 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pulsante di chiusura rapida / Applica */}
        <div className="pt-2 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs active:scale-[0.99] transition-all cursor-pointer"
          >
            Applica
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MobileSeriesSortFilterModal;
