// src/views/Archive/CountdownsPage.tsx
import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';
import { CountdownIcon, UndoIcon } from '@/components/shared/utils/Icons';
import { CountdownFilterBar } from '@/components/countdowns/CountdownFilterBar';
import { CountdownCard } from '@/components/countdowns/CountdownCard';
import {
  CountdownFilterModal,
  type CountdownFilterState,
} from '@/components/countdowns/CountdownFilterModal';
import CountdownNewModal, {
  type CountdownSavePayload,
} from '@/components/day/CountdownNewModal';
import CountdownDetailModal from '@/components/day/CountdownDetailModal';
import { useCountdownArchiveData } from '@/hooks/useCountdownArchiveData';
import { mapToCountdownItems } from '@/utils/countdownUtils';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import type { RawCountdown } from '@/types/countdowns';

const PANEL_CLASS = 'rounded-2xl border border-slate-200/90 bg-white shadow-xs';

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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 4. STATO MODALI (DETTAGLIO E CREAZIONE/MODIFICA)
  const [selectedCountdown, setSelectedCountdown] = useState<CountdownItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [countdownToEdit, setCountdownToEdit] = useState<CountdownItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // 5. HOOK IN RAM PER FILTRAGGIO, ORDINAMENTO E PAGINAZIONE
  const {
    filteredCountdowns,
    paginatedCountdowns,
    totalPages,
  } = useCountdownArchiveData({
    rawCountdowns,
    filters,
    currentPage,
    pageSize: 12,
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

  const handleOpenNew = () => {
    setCountdownToEdit(null);
    setIsNewModalOpen(true);
  };

  const handleSelectCountdown = (cd: CountdownItem) => {
    setSelectedCountdown(cd);
    setIsDetailModalOpen(true);
  };

  const handleEditFromDetail = () => {
    if (!selectedCountdown) return;
    setCountdownToEdit(selectedCountdown);
    setIsDetailModalOpen(false);
    setIsNewModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      setIsDetailModalOpen(false);
      setSelectedCountdown(null);
    } catch (err) {
      console.error('Errore eliminazione countdown:', err);
    }
  };

  const handleRenew = async (renewed: CountdownItem) => {
    try {
      await saveMutation.mutateAsync({
        id: renewed.id,
        title: renewed.title,
        targetDateStr: renewed.targetDateStr,
        imageUrl: renewed.imageUrl,
      });
      setSelectedCountdown(renewed);
    } catch (err) {
      console.error('Errore rinnovo countdown:', err);
    }
  };

  const handleSaveCountdown = async (payload: CountdownSavePayload) => {
    await saveMutation.mutateAsync(payload);
    setIsNewModalOpen(false);
    setCountdownToEdit(null);
  };

  return (
    <div className="h-full flex flex-col gap-3.5 max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER STANDARD SENZA BOLLE STATS */}
      <ArchiveHeader
        title="GESTIONE COUNTDOWN"
        subtitle="Tieni traccia dei giorni mancanti alle tue date più importanti."
        icon={<CountdownIcon className="h-6 w-6 text-white" />}
        className={PANEL_CLASS}
      />

      {/* 2. RIGA AZIONI: TASTO NUOVO COUNTDOWN E LENTE DI RICERCA */}
      <CountdownFilterBar
        onOpenNewCountdown={handleOpenNew}
        onOpenSearch={() => setIsFilterModalOpen(true)}
        activeFiltersCount={activeFiltersCount}
        panelClass={PANEL_CLASS}
      />

      {/* 3. GRIGLIA A 3 COLONNE CON LE TARGHE COUNTDOWN */}
      <div className={`${PANEL_CLASS} flex flex-col flex-1 min-h-0 overflow-hidden`}>
        {/* CORPO DELLA GRIGLIA SCROLLABILE */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold">Caricamento countdown in corso...</span>
            </div>
          ) : filteredCountdowns.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="p-4 rounded-full bg-slate-50 text-slate-400 mb-3 border border-slate-100">
                <CountdownIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Nessun countdown trovato</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {hasActiveFilters
                  ? 'Nessun countdown corrisponde ai filtri selezionati. Prova ad azzerarli.'
                  : 'Non ci sono countdown registrati nel sistema.'}
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
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center gap-2 shrink-0">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Precedente
            </button>
            <span className="text-xs font-semibold text-slate-500 px-2">
              Pagina {currentPage} di {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Successiva
            </button>
          </div>
        )}
      </div>

      {/* 4. MODALE FILTRI & RICERCA IN OVERLAY GLOBALE */}
      <CountdownFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
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
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCountdown(null);
        }}
        countdown={selectedCountdown}
        onEditClick={handleEditFromDetail}
        onDeleteClick={handleDelete}
        onRenewClick={handleRenew}
      />

      {/* 6. MODALE NUOVO / MODIFICA COUNTDOWN */}
      <CountdownNewModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
          setCountdownToEdit(null);
        }}
        countdownToEdit={countdownToEdit}
        onSave={handleSaveCountdown}
      />
    </div>
  );
};

export default CountdownsPage;
