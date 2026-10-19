// src/mobile/components/trackers/MobileSeriesCreateListModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { TVSeries, MediaList } from '@/types/trackers';
import { CloseIcon, SearchIcon, TvIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import { useBackHandler } from '@/utils/backButtonManager';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useSearchTMDBSeries } from '@/hooks/queries/useTrackersQueries';
import { resolveImageUrl } from '@/utils/imageUtils';
import { getMediaBorderClass } from '@/utils/mediaStatusTheme';
import { SelectModalDialog } from '@/components/shared/form/SelectModalDialog';
import { logger } from '@/utils/logger';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';

export interface MobileSeriesCreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: TVSeries[];
  listToEdit?: MediaList | null;
}

export type MediaListPrivacy = 'private' | 'friends' | 'public';

interface SelectableSeriesItem {
  tmdb_id: number;
  title: string;
  poster_path?: string | null;
  custom_poster_path?: string | null;
  status?: string | null;
  tmdb_status?: string | null;
  first_air_date?: string | null;
}

export const MobileSeriesCreateListModal: React.FC<MobileSeriesCreateListModalProps> = ({
  isOpen,
  onClose,
  series,
  listToEdit,
}) => {
  const [listName, setListName] = useState('');
  const [privacy, setPrivacy] = useState<MediaListPrivacy>('private');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedTmdbIds, setSelectedTmdbIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { handleScroll, scrollbarClass } = useFadeScrollbar();

  const { createListAsync, updateListAsync, addToListAsync, removeFromListAsync } = useTrackersMutations();

  // Debounce per la ricerca TMDB
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset dello stato all'apertura del modale
  useEffect(() => {
    if (isOpen) {
      if (listToEdit) {
        setListName(listToEdit.name || '');
        setPrivacy((listToEdit.visibility as MediaListPrivacy) || 'private');
        const existingIds = (listToEdit.items || [])
          .map((it) => it.series_tmdb_id)
          .filter((id): id is number => typeof id === 'number');
        setSelectedTmdbIds(existingIds);
      } else {
        setListName('');
        setPrivacy('private');
        setSelectedTmdbIds([]);
      }
      setSearchQuery('');
      setDebouncedQuery('');
      setIsSaving(false);
      setIsPrivacyModalOpen(false);
    }
  }, [isOpen, listToEdit]);

  // Ricerca remota su TMDB
  const isSearchActive = debouncedQuery.length > 0;
  const { data: tmdbSearchData, isLoading: isSearchLoading } = useSearchTMDBSeries(
    debouncedQuery,
    1,
    isSearchActive
  );

  // Gestione tasto fisico/gesture back
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

  // Unione dei risultati:
  // Se non c'è ricerca: l'intero catalogo personale
  // Se c'è ricerca: serie del catalogo locale corrispondenti AL PRIMO POSTO, poi i risultati TMDB
  const displaySeriesList: SelectableSeriesItem[] = useMemo(() => {
    if (!isSearchActive) {
      return series.map((s) => ({
        tmdb_id: s.tmdb_id,
        title: s.title,
        poster_path: s.poster_path,
        custom_poster_path: s.custom_poster_path,
        status: s.status,
        tmdb_status: s.tmdb_status,
        first_air_date: s.first_air_date,
      }));
    }

    const q = debouncedQuery.toLowerCase();
    const seenIds = new Set<number>();
    const results: SelectableSeriesItem[] = [];

    // 1. Serie del proprio catalogo corrispondenti alla query (priorità assoluta)
    series.forEach((s) => {
      const match =
        s.title.toLowerCase().includes(q) ||
        (s.original_title && s.original_title.toLowerCase().includes(q));
      if (match) {
        seenIds.add(s.tmdb_id);
        results.push({
          tmdb_id: s.tmdb_id,
          title: s.title,
          poster_path: s.poster_path,
          custom_poster_path: s.custom_poster_path,
          status: s.status,
          tmdb_status: s.tmdb_status,
          first_air_date: s.first_air_date,
        });
      }
    });

    // 2. Risultati TMDB: se già presenti nel catalogo, usa i dati completi con stato
    const tmdbResults = tmdbSearchData?.results || [];
    tmdbResults.forEach((item) => {
      if (seenIds.has(item.id)) return;
      seenIds.add(item.id);

      const existingLocal = series.find((s) => s.tmdb_id === item.id);
      if (existingLocal) {
        results.push({
          tmdb_id: existingLocal.tmdb_id,
          title: existingLocal.title,
          poster_path: existingLocal.poster_path,
          custom_poster_path: existingLocal.custom_poster_path,
          status: existingLocal.status,
          tmdb_status: existingLocal.tmdb_status,
          first_air_date: existingLocal.first_air_date,
        });
      } else {
        results.push({
          tmdb_id: item.id,
          title: item.name,
          poster_path: item.poster_path,
          status: 'untracked',
          tmdb_status: null,
          first_air_date: item.first_air_date,
        });
      }
    });

    return results;
  }, [series, isSearchActive, debouncedQuery, tmdbSearchData]);

  const handleToggleSelectSeries = (tmdbId: number) => {
    setSelectedTmdbIds((prev) =>
      prev.includes(tmdbId) ? prev.filter((id) => id !== tmdbId) : [...prev, tmdbId]
    );
  };

  const handleSaveList = async () => {
    const trimmed = listName.trim();
    if (!trimmed || isSaving) return;

    try {
      setIsSaving(true);
      if (listToEdit) {
        // Aggiornamento nome e privacy della lista esistente
        await updateListAsync({
          list_id: listToEdit.id,
          payload: {
            name: trimmed,
            visibility: privacy,
          },
        });

        // Sincronizzazione serie aggiunte e rimosse
        const originalIds = (listToEdit.items || [])
          .map((it) => it.series_tmdb_id)
          .filter((id): id is number => typeof id === 'number');

        const toAdd = selectedTmdbIds.filter((id) => !originalIds.includes(id));
        const toRemove = (listToEdit.items || []).filter(
          (it) => it.series_tmdb_id && !selectedTmdbIds.includes(it.series_tmdb_id)
        );

        await Promise.all([
          ...toAdd.map((tmdbId) =>
            addToListAsync({
              list_id: listToEdit.id,
              payload: { series_tmdb_id: tmdbId },
            })
          ),
          ...toRemove.map((item) =>
            removeFromListAsync({
              list_id: listToEdit.id,
              item_id: item.id,
            })
          ),
        ]);
      } else {
        const newList = await createListAsync({
          name: trimmed,
          visibility: privacy,
        });

        if (newList?.id && selectedTmdbIds.length > 0) {
          await Promise.all(
            selectedTmdbIds.map((tmdbId) =>
              addToListAsync({
                list_id: newList.id,
                payload: { series_tmdb_id: tmdbId },
              })
            )
          );
        }
      }

      onClose();
    } catch (err) {
      logger.error('Errore durante il salvataggio della lista:', err);
      alert('Si è verificato un errore durante il salvataggio della lista.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPrivacyLabel = (p: MediaListPrivacy) => {
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

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10040] bg-white flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none">
      {/* 1. HEADER (STILE CREAZIONE TASK AGENDA MOBILE) */}
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

      {/* 2. AREA SUPERIORE FISSA: NOME LISTA + BARRA DI RICERCA TMDB / CATALOGO */}
      <div className="shrink-0 p-3 sm:p-4 space-y-2.5 bg-white border-b border-gray-100 shadow-2xs">
        {/* Input Nome Lista */}
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

        {/* Barra di ricerca tra nome lista e locandine */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <SearchIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca serie nel catalogo o su TMDB..."
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

      {/* 3. GRIGLIA UNICA DELLE LOCANDINE (SENZA DIVISIONE CATALOGO) CON BORDI E TESTO IN SFUMATURA */}
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

        {displaySeriesList.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-xs text-gray-400 italic">
            Nessuna serie trovata
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 content-start pb-6">
            {displaySeriesList.map((item) => {
              const isSelected = selectedTmdbIds.includes(item.tmdb_id);
              const poster = item.custom_poster_path
                ? resolveImageUrl(item.custom_poster_path)
                : item.poster_path
                ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                : null;

              const borderClass = getMediaBorderClass(item.status, item.tmdb_status, {
                isThick: true,
              });

              return (
                <div
                  key={item.tmdb_id}
                  onClick={() => handleToggleSelectSeries(item.tmdb_id)}
                  className={`relative aspect-[2/3] rounded-xl overflow-hidden shadow-xs bg-gray-900 ${borderClass} active:scale-95 transition-all cursor-pointer select-none group ${
                    isSelected ? 'ring-3 ring-blue-500 shadow-blue-500/30' : ''
                  }`}
                  title={item.title}
                >
                  {/* Locandina */}
                  {poster ? (
                    <img
                      src={poster}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full p-2 flex flex-col items-center justify-center text-center bg-linear-to-b from-gray-800 to-gray-950 text-gray-300">
                      <TvIcon className="w-6 h-6 text-gray-500 mb-1" />
                      <span className="text-[10px] font-bold text-white/90 line-clamp-2 leading-tight">
                        {item.title}
                      </span>
                    </div>
                  )}

                  {/* ALONE BLU SULLA LOCANDINA QUANDO SELEZIONATA */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-600/30 backdrop-brightness-95 pointer-events-none transition-all z-10" />
                  )}

                  {/* SPUNTA DI SELEZIONE IN BASSO A DESTRA */}
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

      {/* 4. FOOTER: DUE COLONNE (COLONNA SINISTRA: PRIVACY, COLONNA DESTRA: SALVA) */}
      <div className="shrink-0 px-4 py-3 bg-gray-50 border-t border-gray-200 shadow-lg select-none pb-[max(env(safe-area-inset-bottom,0px),12px)]">
        <div className="grid grid-cols-2 gap-3 w-full">
          {/* Colonna di sinistra: Selettore Privacy a tutta larghezza colonna */}
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

          {/* Colonna di destra: Tasto Salva a tutta larghezza colonna */}
          <button
            type="button"
            disabled={!listName.trim() || isSaving}
            onClick={handleSaveList}
            className="w-full h-11 flex items-center justify-center gap-2 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isSaving && <LoadingIcon className="w-3.5 h-3.5 animate-spin shrink-0" />}
            <span className="truncate">Salva{selectedTmdbIds.length > 0 ? ` (${selectedTmdbIds.length})` : ''}</span>
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

export default MobileSeriesCreateListModal;
