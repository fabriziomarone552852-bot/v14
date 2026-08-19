// src/views/Archive/CountdownsPage.tsx
import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';
import { CountdownIcon, UndoIcon } from '@/components/shared/utils/Icons';
import { Pagination } from '@/components/shared/utils/Pagination';
import { CountdownFilterBar } from '@/components/archive/countdowns/CountdownFilterBar';
import { CountdownCard } from '@/components/archive/countdowns/CountdownCard';
import {
  CountdownFilterModal,
  type CountdownFilterState,
} from '@/components/archive/countdowns/CountdownFilterModal';
import CountdownNewModal, {
  type CountdownSavePayload,
} from '@/components/day/CountdownNewModal';
import CountdownDetailModal from '@/components/day/CountdownDetailModal';
import { useCountdownArchiveData } from '@/hooks/useCountdownArchiveData';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { useModal } from '@/hooks/useModals';
import { mapToCountdownItems } from '@/utils/countdownUtils';
import { ARCHIVE_PANEL_CLASS } from './CategoriesPage';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import type { RawCountdown } from '@/types/countdowns';

const initialFilterState: CountdownFilterState = {
  keyword: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
};

export const CountdownsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // 1. CARICAMENTO DATI CON REACT QUERY
  const { data: rawCountdowns = [], isLoading: loading } = useQuery<CountdownItem[]>({
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

  // 4. MODALI — useModal<T> al posto di coppie useState separate
  const filterModal = useModal();
  const detailModal = useModal<CountdownItem>();
  const formModal = useModal<CountdownItem>();

  // 5. CALCOLO DINAMICO DEL PAGE SIZE IN BASE ALL'ALTEZZA
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 230,
    columns: (w) => (w >= 1024 ? 3 : w >= 640 ? 2 : 1),
    defaultPageSize: 6,
    minItems: 2,
    maxItems: 18,
  });

  // 6. HOOK IN RAM PER FILTRAGGIO, ORDINAMENTO E PAGINAZIONE
  const {
    filteredCountdowns,
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

  // --- AZIONI SUI COUNTDOWN ---
  const handleOpenNew = () => formModal.open(null);

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

  return (
    <div className="h-full flex flex-col gap-3.5 max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER STANDARD SENZA BOLLE STATS */}
      <ArchiveHeader
        title="GESTIONE COUNTDOWN"
        subtitle="Tieni traccia dei giorni mancanti alle tue date più importanti."
        icon={<CountdownIcon className="h-6 w-6 text-white" />}
        className={ARCHIVE_PANEL_CLASS}
      />

      {/* 2. RIGA AZIONI: TASTO NUOVO COUNTDOWN E LENTE DI RICERCA */}
      <CountdownFilterBar
        onOpenNewCountdown={handleOpenNew}
        onOpenSearch={filterModal.open}
        activeFiltersCount={activeFiltersCount}
        panelClass={ARCHIVE_PANEL_CLASS}
      />

      {/* 3. GRIGLIA A 3 COLONNE CON LE TARGHE COUNTDOWN */}
      <div className={`${ARCHIVE_PANEL_CLASS} flex flex-col flex-1 min-h-0 overflow-hidden`}>
        {/* CORPO DELLA GRIGLIA SCROLLABILE */}
        <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold">Caricamento countdown in corso...</span>
            </div>
          ) : totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="p-4 rounded-full bg-slate-50 text-slate-400 mb-3 border border-slate-100">
                <CountdownIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Nessun countdown trovato</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {hasActiveFilters
                  ? 'Nessun countdown corrisponde ai filtri selezionati. Prova ad azzerarli.'
                  : 'Crea il tuo primo countdown per iniziare il conteggio!'}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                >
                  <UndoIcon className="w-3.5 h-3.5" />
                  <span>Azzera filtri</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedCountdowns.map((cd) => (
                <CountdownCard
                  key={cd.id}
                  countdown={cd}
                  onClick={() => handleSelectCountdown(cd)}
                />
              ))}
            </div>
          )}
        </div>

        {/* PAGINAZIONE INFERIORE */}
        {totalPages > 1 && (
          <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center shrink-0">
            <Pagination
              current={currentPage}
              total={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* 4. MODALE FILTRI & RICERCA IN OVERLAY GLOBALE */}
      <CountdownFilterModal
        isOpen={filterModal.isOpen}
        onClose={filterModal.close}
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 5. MODALE DI DETTAGLIO COUNTDOWN */}
      <CountdownDetailModal
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        countdown={detailModal.data}
        onEditClick={handleEditFromDetail}
        onDeleteClick={handleDelete}
        onRenewClick={handleRenew}
      />

      {/* 6. MODALE NUOVO / MODIFICA COUNTDOWN */}
      <CountdownNewModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        countdownToEdit={formModal.data}
        onSave={handleSaveCountdown}
      />
    </div>
  );
};

export default CountdownsPage;
