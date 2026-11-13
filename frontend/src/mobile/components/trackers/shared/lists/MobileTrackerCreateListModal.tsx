// src/mobile/components/trackers/shared/lists/MobileTrackerCreateListModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import type { TVSeries, MediaList, TrackerMediaType } from '@/types/trackers';
import type { Movie } from '@/types/movies';
import {
  CloseIcon,
  SearchIcon,
  TvIcon,
  FilmIcon,
  LoadingIcon,
} from '@/components/shared/utils/Icons';
import { useBackHandler } from '@/utils/backButtonManager';
import { resolveTrackerPosterUrl } from '@/utils/trackerListUtils';
import { getMediaBorderClass } from '@/utils/mediaStatusTheme';
import { SelectModalDialog } from '@/components/shared/form/SelectModalDialog';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';
import {
  useMobileTrackerCreateListLogic,
  type MediaListPrivacy,
} from './hooks/useMobileTrackerCreateListLogic';

export interface MobileTrackerCreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: TrackerMediaType;
  series?: TVSeries[];
  movies?: Movie[];
  listToEdit?: MediaList | null;
}

const renderPrivacyLabel = (p: MediaListPrivacy): string => {
  switch (p) {
    case 'private':
      return 'Solo Io';
    case 'friends':
      return 'Amici';
    case 'public':
      return 'Pubblica';
  }
};

const renderPrivacyIcon = (p: MediaListPrivacy) => {
  if (p === 'private') {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    );
  }
  if (p === 'friends') {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

export const MobileTrackerCreateListModal: React.FC<MobileTrackerCreateListModalProps> = ({
  isOpen,
  onClose,
  mediaType,
  series,
  movies,
  listToEdit,
}) => {
  const { handleScroll, scrollbarClass } = useFadeScrollbar();
  const {
    listName,
    setListName,
    privacy,
    setPrivacy,
    isPrivacyModalOpen,
    setIsPrivacyModalOpen,
    searchQuery,
    setSearchQuery,
    selectedTmdbIds,
    isSaving,
    isSearchLoading,
    displayItems,
    handleToggleSelectItem,
    handleSaveList,
  } = useMobileTrackerCreateListLogic({
    isOpen,
    onClose,
    mediaType,
    series,
    movies,
    listToEdit,
  });

  useBackHandler(
    isOpen,
    () => {
      if (isPrivacyModalOpen) {
        setIsPrivacyModalOpen(false);
        return true;
      }
      onClose();
      return true;
    },
    30
  );

  if (!isOpen) return null;

  const isMovie = mediaType === 'movie';
  const searchPlaceholder = isMovie
    ? 'Cerca film nel catalogo o su TMDB...'
    : 'Cerca serie nel catalogo o su TMDB...';
  const emptyText = isMovie ? 'Nessun film trovato' : 'Nessuna serie trovata';

  return createPortal(
    <div className="fixed inset-0 z-[10040] bg-white flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none">
      {/* 1. HEADER */}
      <div className="px-4 py-3.5 border-b border-gray-200 flex justify-between items-center bg-gray-50/95 shrink-0 pt-[max(env(safe-area-inset-top,0px),14px)] select-none">
        <div className="text-base font-extrabold text-gray-900 uppercase tracking-wider truncate flex-1 min-w-0 pr-2">
          {listToEdit ? 'Modifica Lista' : 'Nuova Lista'}
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          aria-label="Chiudi"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 2. AREA SUPERIORE FISSA: NOME LISTA + BARRA DI RICERCA */}
      <div className="shrink-0 p-3 sm:p-4 space-y-2.5 bg-white border-b border-gray-100 shadow-2xs">
        <div>
          <input
            type="text"
            required
            autoFocus
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="Nome della lista..."
            className="w-full px-3.5 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <SearchIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 bg-gray-100 rounded-xl border border-transparent text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. GRIGLIA UNICA DELLE LOCANDINE */}
      <div
        onScroll={handleScroll}
        className={`flex-1 min-h-0 overflow-y-auto p-3 ${scrollbarClass}`}
      >
        {isSearchLoading && (
          <div className="flex items-center justify-center py-6 text-gray-400 gap-2">
            <LoadingIcon className="w-4 h-4 animate-spin" />
            <span className="text-xs font-bold">Ricerca in corso...</span>
          </div>
        )}

        {displayItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-xs text-gray-400 italic">
            {emptyText}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 content-start pb-6">
            {displayItems.map((item) => {
              const isSelected = selectedTmdbIds.includes(item.tmdb_id);
              const poster = resolveTrackerPosterUrl(
                item.custom_poster_path || item.poster_path,
                'w300'
              );

              const borderClass = getMediaBorderClass(item.status, item.tmdb_status, {
                isThick: true,
              });

              return (
                <div
                  key={item.tmdb_id}
                  onClick={() => handleToggleSelectItem(item.tmdb_id)}
                  className={`relative aspect-[2/3] rounded-xl overflow-hidden shadow-xs bg-gray-900 ${borderClass} active:scale-95 transition-all cursor-pointer select-none group ${
                    isSelected ? 'ring-3 ring-blue-500 shadow-blue-500/30' : ''
                  }`}
                  title={item.title}
                >
                  {poster ? (
                    <img
                      src={poster}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full p-2 flex flex-col items-center justify-center text-center bg-linear-to-b from-gray-800 to-gray-950 text-gray-300">
                      {isMovie ? (
                        <FilmIcon className="w-6 h-6 text-gray-500 mb-1" />
                      ) : (
                        <TvIcon className="w-6 h-6 text-gray-500 mb-1" />
                      )}
                      <span className="text-[10px] font-bold text-white/90 line-clamp-2 leading-tight">
                        {item.title}
                      </span>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-600/30 backdrop-brightness-95 pointer-events-none transition-all z-10" />
                  )}

                  {isSelected && (
                    <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg ring-2 ring-white z-20">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. FOOTER: DUE COLONNE (PRIVACY & SALVA) */}
      <div className="shrink-0 px-4 py-3 bg-gray-50 border-t border-gray-200 shadow-lg select-none pb-[max(env(safe-area-inset-bottom,0px),12px)]">
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="w-full h-11 flex items-center justify-center gap-2 px-3 rounded-2xl bg-white border border-gray-200 text-gray-700 text-xs font-bold shadow-2xs hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
            title="Modifica visibilità"
          >
            {renderPrivacyIcon(privacy)}
            <span className="truncate">{renderPrivacyLabel(privacy)}</span>
            <span className="text-gray-400 text-[10px] shrink-0">▼</span>
          </button>

          <button
            type="button"
            disabled={!listName.trim() || isSaving}
            onClick={handleSaveList}
            className="w-full h-11 flex items-center justify-center gap-2 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isSaving && <LoadingIcon className="w-3.5 h-3.5 animate-spin shrink-0" />}
            <span className="truncate">
              Salva{selectedTmdbIds.length > 0 ? ` (${selectedTmdbIds.length})` : ''}
            </span>
          </button>
        </div>
      </div>

      {/* Modale Centrato Scelta Privacy (Mobile UI Rule) */}
      <SelectModalDialog
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title="Visibilità della Lista"
        zIndex={10060}
      >
        {(['private', 'friends', 'public'] as MediaListPrivacy[]).map((p) => {
          const isSelected = privacy === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPrivacy(p);
                setIsPrivacyModalOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {renderPrivacyIcon(p)}
                <span>{renderPrivacyLabel(p)}</span>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </SelectModalDialog>
    </div>,
    document.body
  );
};

export default MobileTrackerCreateListModal;
