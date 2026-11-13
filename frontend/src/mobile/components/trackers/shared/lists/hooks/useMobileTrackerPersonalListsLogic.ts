// src/mobile/components/trackers/shared/lists/hooks/useMobileTrackerPersonalListsLogic.ts
import { useState, useMemo, useEffect, useCallback } from 'react';
import type { MediaList, TVSeries, TrackerMediaType } from '@/types/trackers';
import type { Movie } from '@/types/movies';
import type { CatalogStatusTab } from '../../catalog';
import {
  filterListItemsByMediaType,
  getMediaListItemTargetId,
  matchesListStatusTab,
} from '@/utils/trackerListUtils';
import { calculateSeriesRating } from '@/utils/ratingUtils';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { logger } from '@/utils/logger';

export interface UseMobileTrackerPersonalListsLogicProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: TrackerMediaType;
  myLists: MediaList[];
  series?: TVSeries[];
  movies?: Movie[];
  initialSelectedList?: MediaList | null;
}

export function useMobileTrackerPersonalListsLogic({
  isOpen,
  onClose,
  mediaType,
  myLists,
  series = [],
  movies = [],
  initialSelectedList,
}: UseMobileTrackerPersonalListsLogicProps) {
  const [selectedList, setSelectedList] = useState<MediaList | null>(
    initialSelectedList || null
  );
  const [statusFilter, setStatusFilter] = useState<CatalogStatusTab>('all');
  const [listSort, setListSort] = useState<string>('recent');
  const [itemSort, setItemSort] = useState<string>('added_desc');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [listToEdit, setListToEdit] = useState<MediaList | null>(null);

  // Selezione multipla liste e titoli
  const [selectedListIds, setSelectedListIds] = useState<number[]>([]);
  const [selectedItemTmdbIds, setSelectedItemTmdbIds] = useState<number[]>([]);

  // Dialog conferma eliminazione
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'lists' | 'items';
    count: number;
  }>({
    isOpen: false,
    type: 'lists',
    count: 0,
  });

  const { deleteListAsync, removeFromListAsync } = useTrackersMutations();

  // Inizializzazione allo stato di apertura o cambio initialSelectedList
  useEffect(() => {
    if (isOpen) {
      setSelectedList(initialSelectedList || null);
      setStatusFilter('all');
      setIsSortModalOpen(false);
      setIsCreateModalOpen(false);
      setListToEdit(null);
      setSelectedListIds([]);
      setSelectedItemTmdbIds([]);
      setConfirmDeleteDialog({ isOpen: false, type: 'lists', count: 0 });
    }
  }, [isOpen, initialSelectedList]);

  // Sincronizza selectedList con i dati aggiornati di myLists
  useEffect(() => {
    if (selectedList) {
      const updated = myLists.find((l) => l.id === selectedList.id);
      if (updated) {
        setSelectedList(updated);
      }
    }
  }, [myLists, selectedList?.id]);

  const toggleListSelection = useCallback((id: number) => {
    setSelectedListIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const clearListSelection = useCallback(() => {
    setSelectedListIds([]);
  }, []);

  const toggleItemSelection = useCallback((tmdbId: number) => {
    setSelectedItemTmdbIds((prev) =>
      prev.includes(tmdbId) ? prev.filter((item) => item !== tmdbId) : [...prev, tmdbId]
    );
  }, []);

  const clearItemSelection = useCallback(() => {
    setSelectedItemTmdbIds([]);
  }, []);

  const openEditSelectedList = useCallback(() => {
    if (selectedListIds.length !== 1) return;
    const target = myLists.find((l) => l.id === selectedListIds[0]);
    if (target) {
      setListToEdit(target);
      setIsCreateModalOpen(true);
    }
  }, [selectedListIds, myLists]);

  const openDeleteConfirm = useCallback(
    (type: 'lists' | 'items') => {
      const count =
        type === 'lists' ? selectedListIds.length : selectedItemTmdbIds.length;
      if (count === 0) return;
      setConfirmDeleteDialog({
        isOpen: true,
        type,
        count,
      });
    },
    [selectedListIds.length, selectedItemTmdbIds.length]
  );

  const closeDeleteConfirm = useCallback(() => {
    setConfirmDeleteDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const executeDelete = useCallback(async () => {
    if (confirmDeleteDialog.type === 'lists') {
      try {
        await Promise.all(selectedListIds.map((id) => deleteListAsync(id)));
        setSelectedListIds([]);
      } catch (err) {
        logger.error("Errore durante l'eliminazione delle liste selezionate:", err);
      } finally {
        closeDeleteConfirm();
      }
    } else if (confirmDeleteDialog.type === 'items' && selectedList) {
      try {
        const currentTypeItems = filterListItemsByMediaType(selectedList, mediaType);
        const itemsToRemove = currentTypeItems.filter((it) => {
          const targetId = getMediaListItemTargetId(it, mediaType);
          return typeof targetId === 'number' && selectedItemTmdbIds.includes(targetId);
        });
        const removedItemIds = new Set(itemsToRemove.map((it) => it.id));

        await Promise.all(
          itemsToRemove.map((item) =>
            removeFromListAsync({ list_id: selectedList.id, item_id: item.id })
          )
        );

        setSelectedList((prev) =>
          prev
            ? {
                ...prev,
                items: (prev.items || []).filter((it) => !removedItemIds.has(it.id)),
              }
            : null
        );
        setSelectedItemTmdbIds([]);
      } catch (err) {
        logger.error('Errore durante la rimozione degli elementi dalla lista:', err);
      } finally {
        closeDeleteConfirm();
      }
    }
  }, [
    confirmDeleteDialog.type,
    selectedListIds,
    selectedItemTmdbIds,
    selectedList,
    mediaType,
    deleteListAsync,
    removeFromListAsync,
    closeDeleteConfirm,
  ]);

  const handleBack = useCallback(() => {
    if (confirmDeleteDialog.isOpen) {
      closeDeleteConfirm();
      return;
    }
    if (isCreateModalOpen) {
      setIsCreateModalOpen(false);
      setListToEdit(null);
      return;
    }
    if (isSortModalOpen) {
      setIsSortModalOpen(false);
      return;
    }
    if (selectedListIds.length > 0) {
      setSelectedListIds([]);
      return;
    }
    if (selectedItemTmdbIds.length > 0) {
      setSelectedItemTmdbIds([]);
      return;
    }
    if (selectedList) {
      setSelectedList(null);
      setStatusFilter('all');
      return;
    }
    setStatusFilter('all');
    onClose();
  }, [
    confirmDeleteDialog.isOpen,
    isCreateModalOpen,
    isSortModalOpen,
    selectedListIds.length,
    selectedItemTmdbIds.length,
    selectedList,
    onClose,
    closeDeleteConfirm,
  ]);

  // Liste pertinenti al tracker corrente (che contengono almeno 1 elemento del tracker o sono appena state create vuote)
  const trackerLists = useMemo(() => {
    return myLists.filter((list) => {
      const totalItems = list.items?.length ?? 0;
      if (totalItems === 0) return true;
      return filterListItemsByMediaType(list, mediaType).length > 0;
    });
  }, [myLists, mediaType]);

  // 1. Liste filtrate e ordinate per la vista panoramica
  const sortedLists = useMemo(() => {
    let res = [...trackerLists];

    if (statusFilter !== 'all') {
      res = res.filter((list) => {
        const itemsOfType = filterListItemsByMediaType(list, mediaType);
        if (itemsOfType.length === 0) return false;
        return itemsOfType.some((item) => {
          const targetId = getMediaListItemTargetId(item, mediaType);
          if (mediaType === 'movie') {
            const existingMovie = movies.find((m) => m.tmdb_id === targetId);
            return matchesListStatusTab(existingMovie?.status, null, statusFilter);
          }
          const existingSeries = series.find((s) => s.tmdb_id === targetId);
          return matchesListStatusTab(
            existingSeries?.status || item.series?.status,
            existingSeries?.tmdb_status,
            statusFilter
          );
        });
      });
    }

    switch (listSort) {
      case 'name_asc':
        return res.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return res.sort((a, b) => b.name.localeCompare(a.name));
      case 'count_desc':
        return res.sort(
          (a, b) =>
            filterListItemsByMediaType(b, mediaType).length -
            filterListItemsByMediaType(a, mediaType).length
        );
      case 'created_desc':
        return res.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'recent':
      default:
        return res.sort((a, b) => {
          const timeA = a.updated_at
            ? new Date(a.updated_at).getTime()
            : new Date(a.created_at).getTime();
          const timeB = b.updated_at
            ? new Date(b.updated_at).getTime()
            : new Date(b.created_at).getTime();
          return timeB - timeA;
        });
    }
  }, [trackerLists, listSort, statusFilter, mediaType, movies, series]);

  // 2A. Serie TV appartenenti alla lista selezionata (quando mediaType === 'tv')
  const selectedListSeries = useMemo<TVSeries[]>(() => {
    if (mediaType !== 'tv' || !selectedList) return [];
    const matchingItems = filterListItemsByMediaType(selectedList, 'tv');

    let listSeries: Array<{ seriesItem: TVSeries; listAddedAt: string }> =
      matchingItems.map((item) => {
        const existing = series.find((s) => s.tmdb_id === item.series_tmdb_id);
        const listAddedAt = item.added_at || new Date().toISOString();

        if (existing) {
          return { seriesItem: existing, listAddedAt };
        }

        return {
          seriesItem: {
            id: -(item.id || 1),
            tmdb_id: item.series_tmdb_id || 0,
            title: item.series?.title || 'Serie TV',
            poster_path: item.series?.poster_path || null,
            first_air_date: item.series?.first_air_date || null,
            status: (item.series?.status as TVSeries['status']) || 'untracked',
            created_at: listAddedAt,
            updated_at: listAddedAt,
          } as TVSeries,
          listAddedAt,
        };
      });

    if (statusFilter !== 'all') {
      listSeries = listSeries.filter(({ seriesItem }) =>
        matchesListStatusTab(seriesItem.status, seriesItem.tmdb_status, statusFilter)
      );
    }

    switch (itemSort) {
      case 'added_asc':
        listSeries.sort(
          (a, b) =>
            new Date(a.listAddedAt).getTime() - new Date(b.listAddedAt).getTime()
        );
        break;
      case 'name_asc':
        listSeries.sort((a, b) => a.seriesItem.title.localeCompare(b.seriesItem.title));
        break;
      case 'name_desc':
        listSeries.sort((a, b) => b.seriesItem.title.localeCompare(a.seriesItem.title));
        break;
      case 'release_date_desc':
        listSeries.sort((a, b) =>
          (b.seriesItem.first_air_date || '').localeCompare(
            a.seriesItem.first_air_date || ''
          )
        );
        break;
      case 'rating_desc':
        listSeries.sort(
          (a, b) =>
            calculateSeriesRating(b.seriesItem) - calculateSeriesRating(a.seriesItem)
        );
        break;
      case 'added_desc':
      default:
        listSeries.sort(
          (a, b) =>
            new Date(b.listAddedAt).getTime() - new Date(a.listAddedAt).getTime()
        );
        break;
    }

    return listSeries.map((entry) => entry.seriesItem);
  }, [mediaType, selectedList, series, statusFilter, itemSort]);

  // 2B. Film appartenenti alla lista selezionata (quando mediaType === 'movie')
  const selectedListMovies = useMemo<Movie[]>(() => {
    if (mediaType !== 'movie' || !selectedList) return [];
    const matchingItems = filterListItemsByMediaType(selectedList, 'movie');

    let listMovies: Array<{ movieItem: Movie; listAddedAt: string }> =
      matchingItems.map((item) => {
        const existing = movies.find((m) => m.tmdb_id === item.movie_tmdb_id);
        const listAddedAt = item.added_at || new Date().toISOString();

        if (existing) {
          return { movieItem: existing, listAddedAt };
        }

        return {
          movieItem: {
            id: -(item.id || 1),
            tmdb_id: item.movie_tmdb_id || 0,
            title: item.movie?.title || 'Film',
            poster_path: item.movie?.poster_path || null,
            backdrop_path: item.movie?.backdrop_path || null,
            release_date: item.movie?.release_date || null,
            genres: item.movie?.genres || null,
            status: 'to_watch',
            watch_count: 0,
            added_at: listAddedAt,
            updated_at: listAddedAt,
          } as Movie,
          listAddedAt,
        };
      });

    if (statusFilter !== 'all') {
      listMovies = listMovies.filter(({ movieItem }) =>
        matchesListStatusTab(movieItem.status, null, statusFilter)
      );
    }

    switch (itemSort) {
      case 'added_asc':
        listMovies.sort(
          (a, b) =>
            new Date(a.listAddedAt).getTime() - new Date(b.listAddedAt).getTime()
        );
        break;
      case 'name_asc':
        listMovies.sort((a, b) => a.movieItem.title.localeCompare(b.movieItem.title));
        break;
      case 'name_desc':
        listMovies.sort((a, b) => b.movieItem.title.localeCompare(a.movieItem.title));
        break;
      case 'release_date_desc':
        listMovies.sort((a, b) => {
          const dateA = a.movieItem.italy_release_date || a.movieItem.release_date || '';
          const dateB = b.movieItem.italy_release_date || b.movieItem.release_date || '';
          return dateB.localeCompare(dateA);
        });
        break;
      case 'rating_desc':
        listMovies.sort(
          (a, b) => (b.movieItem.my_rating || 0) - (a.movieItem.my_rating || 0)
        );
        break;
      case 'added_desc':
      default:
        listMovies.sort(
          (a, b) =>
            new Date(b.listAddedAt).getTime() - new Date(a.listAddedAt).getTime()
        );
        break;
    }

    return listMovies.map((entry) => entry.movieItem);
  }, [mediaType, selectedList, movies, statusFilter, itemSort]);

  const hasActiveSortOrFilter =
    statusFilter !== 'all' ||
    (selectedList ? itemSort !== 'added_desc' : listSort !== 'recent');

  return {
    selectedList,
    setSelectedList,
    statusFilter,
    setStatusFilter,
    listSort,
    setListSort,
    itemSort,
    setItemSort,
    isSortModalOpen,
    setIsSortModalOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    listToEdit,
    setListToEdit,
    selectedListIds,
    toggleListSelection,
    clearListSelection,
    selectedItemTmdbIds,
    toggleItemSelection,
    clearItemSelection,
    confirmDeleteDialog,
    openDeleteConfirm,
    closeDeleteConfirm,
    executeDelete,
    openEditSelectedList,
    handleBack,
    trackerLists,
    sortedLists,
    selectedListSeries,
    selectedListMovies,
    hasActiveSortOrFilter,
  };
}
