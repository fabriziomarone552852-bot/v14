// src/components/archive/countdowns/useCountdownsPageLogic.ts
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';
import { useCountdownArchiveData } from '@/hooks/useCountdownArchiveData';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { useModal } from '@/hooks/useModals';
import { useArchiveHeader } from '@/context/ArchiveHeaderContext';
import { mapToCountdownItems } from '@/utils/countdownUtils';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import type { RawCountdown } from '@/types/countdowns';
import type { CountdownFilterState } from './CountdownFilterModal';
import type { CountdownSavePayload } from '@/components/day/CountdownNewModal';

const initialFilterState: CountdownFilterState = {
  keyword: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
};

export const useCountdownsPageLogic = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // 1. CARICAMENTO DATI CON REACT QUERY
  const { data: rawCountdowns = [], isLoading: loading, isError } = useQuery<CountdownItem[]>({
    queryKey: ['countdowns'],
    queryFn: async () => {
      const res = await api.get<RawCountdown[]>('/countdowns');
      return mapToCountdownItems(res || []);
    },
  });

  // 2. MUTAZIONI (SALVATAGGIO ED ELIMINAZIONE)
  const saveMutation = useMutation({
    mutationFn: async (payload: CountdownSavePayload) => {
      const dbPayload = {
        title: payload.title,
        target_date: payload.targetDateStr,
        immagine_url: payload.imageUrl,
        immagine_posizione: payload.immaginePosizione,
      };
      if (payload.id) {
        return await api.patch(`/countdowns/${payload.id}`, dbPayload);
      } else {
        return await api.post('/countdowns', dbPayload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countdowns'] });
      queryClient.invalidateQueries({ queryKey: ['day'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/countdowns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countdowns'] });
      queryClient.invalidateQueries({ queryKey: ['day'] });
    },
  });

  // 3. STATO FILTRI E PAGINAZIONE
  const [filters, setFilters] = useState<CountdownFilterState>(initialFilterState);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 4. MODALI
  const filterModal = useModal();
  const detailModal = useModal<CountdownItem>();
  const formModal = useModal<CountdownItem>();

  // 5. CALCOLO DINAMICO DEL PAGE SIZE IN BASE ALL'ALTEZZA
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 155,
    columns: (w) => (w >= 1024 ? 3 : w >= 640 ? 2 : 1),
    defaultPageSize: 6,
    minItems: 2,
    maxItems: 18,
  });

  // 6. HOOK IN RAM PER FILTRAGGIO, ORDINAMENTO E PAGINAZIONE
  const {
    paginatedCountdowns,
    totalPages,
    totalCount,
  } = useCountdownArchiveData({
    rawCountdowns,
    filters,
    currentPage,
    pageSize,
  });

  // Conteggio filtri attivi
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.keyword.trim()) count++;
    if (filters.status !== 'all') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  const handleResetFilters = () => {
    setFilters(initialFilterState);
    setCurrentPage(1);
  };

  const handleOpenNew = () => formModal.open(null);

  // Registrazione header archivio per mobile
  useArchiveHeader({
    title: 'Obiettivi & Countdown',
    onOpenSearch: filterModal.open,
    onOpenNew: handleOpenNew,
    activeFiltersCount,
  });

  const handleSelectCountdown = (cd: CountdownItem) => detailModal.open(cd);

  const handleEditFromDetail = () => {
    if (!detailModal.data) return;
    formModal.open(detailModal.data);
    detailModal.close();
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    detailModal.close();
  };

  const handleRenew = async (renewed: CountdownItem) => {
    await saveMutation.mutateAsync({
      id: renewed.id,
      title: renewed.title,
      targetDateStr: renewed.targetDateStr,
      imageUrl: renewed.imageUrl,
    });
    detailModal.open(renewed);
  };

  const handleSaveCountdown = async (payload: CountdownSavePayload) => {
    await saveMutation.mutateAsync(payload);
    formModal.close();
  };

  return {
    queryClient,
    isMobile,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    loading,
    isError,
    paginatedCountdowns,
    totalPages,
    totalCount,
    activeFiltersCount,
    hasActiveFilters,
    containerRef,
    filterModal,
    detailModal,
    formModal,
    handleResetFilters,
    handleOpenNew,
    handleSelectCountdown,
    handleEditFromDetail,
    handleDelete,
    handleRenew,
    handleSaveCountdown,
  };
};
