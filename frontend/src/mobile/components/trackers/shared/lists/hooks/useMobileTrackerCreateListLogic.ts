// src/mobile/components/trackers/shared/lists/hooks/useMobileTrackerCreateListLogic.ts
import { useState, useEffect, useMemo } from 'react';
import type { TVSeries, MediaList, TrackerMediaType } from '@/types/trackers';
import type { Movie } from '@/types/movies';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useSearchTMDBSeries } from '@/hooks/queries/useTrackersQueries';
import { useSearchTMDBMovies } from '@/hooks/queries/useMovieQueries';
import {
  filterListItemsByMediaType,
  getMediaListItemTargetId,
} from '@/utils/trackerListUtils';
import { logger } from '@/utils/logger';
import { showTrackerToast } from '@/components/trackers/shared/TrackerToast';

export type MediaListPrivacy = 'private' | 'friends' | 'public';

export interface SelectableTrackerMediaItem {
  tmdb_id: number;
  title: string;
  poster_path?: string | null;
  custom_poster_path?: string | null;
  status?: string | null;
  tmdb_status?: string | null;
  release_date?: string | null;
}

export interface UseMobileTrackerCreateListLogicProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: TrackerMediaType;
  series?: TVSeries[];
  movies?: Movie[];
  listToEdit?: MediaList | null;
}

export function useMobileTrackerCreateListLogic({
  isOpen,
  onClose,
  mediaType,
  series = [],
  movies = [],
  listToEdit,
}: UseMobileTrackerCreateListLogicProps) {
  const [listName, setListName] = useState('');
  const [privacy, setPrivacy] = useState<MediaListPrivacy>('private');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedTmdbIds, setSelectedTmdbIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { createListAsync, updateListAsync, addToListAsync, removeFromListAsync } =
    useTrackersMutations();

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
        const matchingItems = filterListItemsByMediaType(listToEdit, mediaType);
        const existingIds = matchingItems
          .map((it) => getMediaListItemTargetId(it, mediaType))
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
  }, [isOpen, listToEdit, mediaType]);

  const isSearchActive = debouncedQuery.length > 0;
  const isMovie = mediaType === 'movie';

  const { data: tmdbSeriesSearchData, isLoading: isSeriesSearchLoading } =
    useSearchTMDBSeries(debouncedQuery, 1, isSearchActive && !isMovie);

  const { data: tmdbMoviesSearchData, isLoading: isMoviesSearchLoading } =
    useSearchTMDBMovies(debouncedQuery, 1, isSearchActive && isMovie);

  const isSearchLoading = isMovie ? isMoviesSearchLoading : isSeriesSearchLoading;

  // Normalizzazione del catalogo personale del tracker attivo
  const catalogItems = useMemo<SelectableTrackerMediaItem[]>(() => {
    if (isMovie) {
      return movies.map((m) => ({
        tmdb_id: m.tmdb_id,
        title: m.title,
        poster_path: m.poster_path,
        custom_poster_path: m.custom_poster_path,
        status: m.status,
        tmdb_status: null,
        release_date: m.italy_release_date || m.release_date,
      }));
    }
    return series.map((s) => ({
      tmdb_id: s.tmdb_id,
      title: s.title,
      poster_path: s.poster_path,
      custom_poster_path: s.custom_poster_path,
      status: s.status,
      tmdb_status: s.tmdb_status,
      release_date: s.first_air_date,
    }));
  }, [isMovie, movies, series]);

  // Unione dei risultati: catalogo personale + risultati TMDB se la ricerca è attiva
  const displayItems = useMemo<SelectableTrackerMediaItem[]>(() => {
    if (!isSearchActive) {
      return catalogItems;
    }

    const q = debouncedQuery.toLowerCase();
    const seenIds = new Set<number>();
    const results: SelectableTrackerMediaItem[] = [];

    // 1. Titoli del proprio catalogo corrispondenti alla query (priorità in cima)
    if (isMovie) {
      movies.forEach((m) => {
        const match =
          m.title.toLowerCase().includes(q) ||
          Boolean(m.original_title && m.original_title.toLowerCase().includes(q));
        if (match) {
          seenIds.add(m.tmdb_id);
          results.push({
            tmdb_id: m.tmdb_id,
            title: m.title,
            poster_path: m.poster_path,
            custom_poster_path: m.custom_poster_path,
            status: m.status,
            tmdb_status: null,
            release_date: m.italy_release_date || m.release_date,
          });
        }
      });

      const tmdbMovies = tmdbMoviesSearchData?.results || [];
      tmdbMovies.forEach((item) => {
        if (seenIds.has(item.id)) return;
        seenIds.add(item.id);

        const existingLocal = movies.find((m) => m.tmdb_id === item.id);
        if (existingLocal) {
          results.push({
            tmdb_id: existingLocal.tmdb_id,
            title: existingLocal.title,
            poster_path: existingLocal.poster_path,
            custom_poster_path: existingLocal.custom_poster_path,
            status: existingLocal.status,
            tmdb_status: null,
            release_date: existingLocal.italy_release_date || existingLocal.release_date,
          });
        } else {
          results.push({
            tmdb_id: item.id,
            title: item.title,
            poster_path: item.poster_path,
            status: 'untracked',
            tmdb_status: null,
            release_date: item.release_date,
          });
        }
      });
    } else {
      series.forEach((s) => {
        const match =
          s.title.toLowerCase().includes(q) ||
          Boolean(s.original_title && s.original_title.toLowerCase().includes(q));
        if (match) {
          seenIds.add(s.tmdb_id);
          results.push({
            tmdb_id: s.tmdb_id,
            title: s.title,
            poster_path: s.poster_path,
            custom_poster_path: s.custom_poster_path,
            status: s.status,
            tmdb_status: s.tmdb_status,
            release_date: s.first_air_date,
          });
        }
      });

      const tmdbSeries = tmdbSeriesSearchData?.results || [];
      tmdbSeries.forEach((item) => {
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
            release_date: existingLocal.first_air_date,
          });
        } else {
          results.push({
            tmdb_id: item.id,
            title: item.name,
            poster_path: item.poster_path,
            status: 'untracked',
            tmdb_status: null,
            release_date: item.first_air_date,
          });
        }
      });
    }

    return results;
  }, [
    isSearchActive,
    catalogItems,
    debouncedQuery,
    isMovie,
    movies,
    series,
    tmdbMoviesSearchData,
    tmdbSeriesSearchData,
  ]);

  const handleToggleSelectItem = (tmdbId: number) => {
    setSelectedTmdbIds((prev) =>
      prev.includes(tmdbId) ? prev.filter((id) => id !== tmdbId) : [...prev, tmdbId]
    );
  };

  const buildAddPayload = (tmdbId: number) =>
    isMovie
      ? { movie_tmdb_id: tmdbId, media_type: 'movie' as const }
      : { series_tmdb_id: tmdbId, media_type: 'tv' as const };

  const handleSaveList = async () => {
    const trimmed = listName.trim();
    if (!trimmed || isSaving) return;

    try {
      setIsSaving(true);
      if (listToEdit) {
        await updateListAsync({
          list_id: listToEdit.id,
          payload: {
            name: trimmed,
            visibility: privacy,
          },
        });

        // Sincronizza solo gli elementi del tracker attivo preservando eventuali contenuti di altri tracker
        const currentTypeItems = filterListItemsByMediaType(listToEdit, mediaType);
        const originalIds = currentTypeItems
          .map((it) => getMediaListItemTargetId(it, mediaType))
          .filter((id): id is number => typeof id === 'number');

        const toAdd = selectedTmdbIds.filter((id) => !originalIds.includes(id));
        const toRemove = currentTypeItems.filter((it) => {
          const targetId = getMediaListItemTargetId(it, mediaType);
          return typeof targetId === 'number' && !selectedTmdbIds.includes(targetId);
        });

        await Promise.all([
          ...toAdd.map((tmdbId) =>
            addToListAsync({
              list_id: listToEdit.id,
              payload: buildAddPayload(tmdbId),
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
                payload: buildAddPayload(tmdbId),
              })
            )
          );
        }
      }

      showTrackerToast('Lista salvata con successo', 'success');
      onClose();
    } catch (err) {
      logger.error('Errore durante il salvataggio della lista:', err);
      showTrackerToast(
        'Si è verificato un errore durante il salvataggio della lista.',
        'warning'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
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
  };
}
