// src/mobile/components/trackers/hooks/useMobileSeriesPersonalListsLogic.ts
import { useState, useMemo, useEffect, useCallback } from 'react';
import type { MediaList, TVSeries } from '@/types/trackers';
import { normalizeMediaStatus } from '@/utils/mediaStatusTheme';
import type { CatalogStatusTab } from '../catalog';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { logger } from '@/utils/logger';

export interface UseMobileSeriesPersonalListsLogicProps {
  isOpen: boolean;
  onClose: () => void;
  myLists: MediaList[];
  series: TVSeries[];
  initialSelectedList?: MediaList | null;
}

export function useMobileSeriesPersonalListsLogic({
  isOpen,
  onClose,
  myLists,
  series,
  initialSelectedList,
}: UseMobileSeriesPersonalListsLogicProps) {
  const [selectedList, setSelectedList] = useState<MediaList | null>(initialSelectedList || null);
  const [statusFilter, setStatusFilter] = useState<CatalogStatusTab>('all');
  const [listSort, setListSort] = useState<string>('recent');
  const [seriesSort, setSeriesSort] = useState<string>('added_desc');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [listToEdit, setListToEdit] = useState<MediaList | null>(null);

  // Selezione multipla
  const [selectedListIds, setSelectedListIds] = useState<number[]>([]);
  const [selectedSeriesTmdbIds, setSelectedSeriesTmdbIds] = useState<number[]>([]);

  // Dialog conferma eliminazione
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'lists' | 'series';
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
      setSelectedSeriesTmdbIds([]);
      setConfirmDeleteDialog({ isOpen: false, type: 'lists', count: 0 });
    }
  }, [isOpen, initialSelectedList]);

  // Sincronizza selectedList con i dati aggiornati di myLists se cambia qualcosa
  useEffect(() => {
    if (selectedList) {
      const updated = myLists.find((l) => l.id === selectedList.id);
      if (updated) {
        setSelectedList(updated);
      }
    }
  }, [myLists, selectedList?.id]);

  // Toggle selezione lista (nella panoramica di tutte le liste)
  const toggleListSelection = useCallback((id: number) => {
    setSelectedListIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const clearListSelection = useCallback(() => {
    setSelectedListIds([]);
  }, []);

  // Toggle selezione serie (all'interno di una lista)
  const toggleSeriesSelection = useCallback((tmdbId: number) => {
    setSelectedSeriesTmdbIds((prev) =>
      prev.includes(tmdbId) ? prev.filter((item) => item !== tmdbId) : [...prev, tmdbId]
    );
  }, []);

  const clearSeriesSelection = useCallback(() => {
    setSelectedSeriesTmdbIds([]);
  }, []);

  // Apertura modale di modifica per la lista selezionata (quando selectedListIds ha lunghezza 1)
  const openEditSelectedList = useCallback(() => {
    if (selectedListIds.length !== 1) return;
    const target = myLists.find((l) => l.id === selectedListIds[0]);
    if (target) {
      setListToEdit(target);
      setIsCreateModalOpen(true);
    }
  }, [selectedListIds, myLists]);

  // Apertura modale di conferma cancellazione
  const openDeleteConfirm = useCallback((type: 'lists' | 'series') => {
    const count = type === 'lists' ? selectedListIds.length : selectedSeriesTmdbIds.length;
    if (count === 0) return;
    setConfirmDeleteDialog({
      isOpen: true,
      type,
      count,
    });
  }, [selectedListIds.length, selectedSeriesTmdbIds.length]);

  const closeDeleteConfirm = useCallback(() => {
    setConfirmDeleteDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Esecuzione eliminazione batch confermata
  const executeDelete = useCallback(async () => {
    if (confirmDeleteDialog.type === 'lists') {
      try {
        await Promise.all(selectedListIds.map((id) => deleteListAsync(id)));
        setSelectedListIds([]);
      } catch (err) {
        logger.error('Errore durante l\'eliminazione delle liste selezionate:', err);
      } finally {
        closeDeleteConfirm();
      }
    } else if (confirmDeleteDialog.type === 'series' && selectedList) {
      try {
        const itemsToRemove = (selectedList.items || []).filter(
          (it) => it.series_tmdb_id && selectedSeriesTmdbIds.includes(it.series_tmdb_id)
        );
        await Promise.all(
          itemsToRemove.map((item) =>
            removeFromListAsync({ list_id: selectedList.id, item_id: item.id })
          )
        );
        // Aggiorna optimistic lo stato locale della lista
        setSelectedList((prev) =>
          prev
            ? {
                ...prev,
                items: (prev.items || []).filter(
                  (it) => !selectedSeriesTmdbIds.includes(it.series_tmdb_id || 0)
                ),
              }
            : null
        );
        setSelectedSeriesTmdbIds([]);
      } catch (err) {
        logger.error('Errore durante la rimozione delle serie dalla lista:', err);
      } finally {
        closeDeleteConfirm();
      }
    }
  }, [
    confirmDeleteDialog.type,
    selectedListIds,
    selectedSeriesTmdbIds,
    selectedList,
    deleteListAsync,
    removeFromListAsync,
    closeDeleteConfirm,
  ]);

  // Gestione navigazione indietro (Tasto Header e Back fisico Android)
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
    if (selectedSeriesTmdbIds.length > 0) {
      setSelectedSeriesTmdbIds([]);
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
    selectedSeriesTmdbIds.length,
    selectedList,
    onClose,
    closeDeleteConfirm,
  ]);

  // 1. Liste filtrate e ordinate per la vista panoramica
  const sortedLists = useMemo(() => {
    let res = [...myLists];

    if (statusFilter !== 'all') {
      res = res.filter((list) => {
        if (!list.items || list.items.length === 0) return false;
        return list.items.some((item) => {
          const existing = series.find((s) => s.tmdb_id === item.series_tmdb_id);
          const status = existing?.status || item.series?.status;
          const tmdbStatus = existing?.tmdb_status;
          const normalized = normalizeMediaStatus(status, tmdbStatus);

          if (statusFilter === 'watching') return normalized === 'watching';
          if (statusFilter === 'waiting') return normalized === 'waiting';
          if (statusFilter === 'completed') return normalized === 'completed';
          if (statusFilter === 'to_watch') {
            return (
              normalized === 'to_watch' ||
              normalized === 'dropped' ||
              normalized === 'on_hold' ||
              normalized === 'untracked'
            );
          }
          return true;
        });
      });
    }

    switch (listSort) {
      case 'name_asc':
        return res.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return res.sort((a, b) => b.name.localeCompare(a.name));
      case 'count_desc':
        return res.sort((a, b) => (b.items?.length || 0) - (a.items?.length || 0));
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
  }, [myLists, listSort, statusFilter, series]);

  // 2. Serie appartenenti alla lista selezionata, filtrate e ordinate
  const selectedListSeries = useMemo(() => {
    if (!selectedList || !selectedList.items) return [];

    let listSeries: TVSeries[] = selectedList.items.map((item) => {
      const existing = series.find((s) => s.tmdb_id === item.series_tmdb_id);
      if (existing) return existing;

      return {
        id: -(item.id || 1),
        tmdb_id: item.series_tmdb_id || 0,
        title: item.series?.title || 'Serie TV',
        poster_path: item.series?.poster_path || null,
        status: (item.series?.status as TVSeries['status']) || 'untracked',
        created_at: item.added_at || new Date().toISOString(),
        updated_at: item.added_at || new Date().toISOString(),
      } as TVSeries;
    });

    if (statusFilter !== 'all') {
      listSeries = listSeries.filter((s) => {
        const normalized = normalizeMediaStatus(s.status, s.tmdb_status);
        if (statusFilter === 'watching') return normalized === 'watching';
        if (statusFilter === 'waiting') return normalized === 'waiting';
        if (statusFilter === 'completed') return normalized === 'completed';
        if (statusFilter === 'to_watch') {
          return (
            normalized === 'to_watch' ||
            normalized === 'dropped' ||
            normalized === 'on_hold' ||
            normalized === 'untracked'
          );
        }
        return true;
      });
    }

    switch (seriesSort) {
      case 'added_asc':
        listSeries.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case 'name_asc':
        listSeries.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name_desc':
        listSeries.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'release_date_desc':
        listSeries.sort((a, b) =>
          (b.first_air_date || '').localeCompare(a.first_air_date || '')
        );
        break;
      case 'rating_desc':
        listSeries.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'added_desc':
      default:
        listSeries.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return listSeries;
  }, [selectedList, series, statusFilter, seriesSort]);

  const hasActiveSortOrFilter =
    statusFilter !== 'all' ||
    (selectedList ? seriesSort !== 'added_desc' : listSort !== 'recent');

  return {
    selectedList,
    setSelectedList,
    statusFilter,
    setStatusFilter,
    listSort,
    setListSort,
    seriesSort,
    setSeriesSort,
    isSortModalOpen,
    setIsSortModalOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    listToEdit,
    setListToEdit,
    selectedListIds,
    toggleListSelection,
    clearListSelection,
    selectedSeriesTmdbIds,
    toggleSeriesSelection,
    clearSeriesSelection,
    confirmDeleteDialog,
    openDeleteConfirm,
    closeDeleteConfirm,
    executeDelete,
    openEditSelectedList,
    handleBack,
    sortedLists,
    selectedListSeries,
    hasActiveSortOrFilter,
  };
}
