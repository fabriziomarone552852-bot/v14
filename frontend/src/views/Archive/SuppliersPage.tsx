// src/views/Archive/SuppliersPage.tsx
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useShoppingData } from '@/hooks/shopping/useShoppingData';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useConfirm } from '@/context/ConfirmContext';
import { useModal } from '@/hooks/useModals';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { fetchAllInventoryBatches, shoppingQueryKeys } from '@/api/shoppingApi';
import type { ItemBatchRecord, ShoppingSupplierOption } from '@/types/shopping';
import { StoreIcon } from '@/components/shared/utils/Icons';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';

import { SupplierStatsOverview } from '@/components/archive/suppliers/SupplierStatsOverview';
import { SupplierFilterBar } from '@/components/archive/suppliers/SupplierFilterBar';
import {
  SupplierTableHeader,
} from '@/components/archive/suppliers/SupplierTableHeader';
import { SupplierTableRow } from '@/components/archive/suppliers/SupplierTableRow';
import {
  SupplierFilterModal,
} from '@/components/archive/suppliers/SupplierFilterModal';
import { SupplierDetailModal } from '@/components/archive/suppliers/SupplierDetailModal';
import { SupplierModal } from '@/components/archive/suppliers/SupplierModal';
import {
  useSupplierArchiveData,
  type EnrichedSupplier,
  type SupplierFilterState,
  type SupplierSortField,
  type SupplierSortDirection,
} from '@/hooks/useSupplierArchiveData';

export const ARCHIVE_PANEL_CLASS = 'rounded-2xl border border-slate-200/90 bg-white shadow-xs';

const initialFilterState: SupplierFilterState = {
  keyword: '',
  status: 'all',
};

export const SuppliersPage: React.FC = () => {
  const { suppliers, config, suppliersLoading } = useShoppingData();
  const mutations = useShoppingMutations();
  const { confirm } = useConfirm();

  // Caricamento di tutti i lotti d'inventario per arricchire i fornitori con dati acquisti
  const { data: allBatches = [], isLoading: batchesLoading } = useQuery<ItemBatchRecord[]>({
    queryKey: shoppingQueryKeys.allBatches(),
    queryFn: ({ signal }) => fetchAllInventoryBatches(signal),
    staleTime: 30_000,
  });

  const loading = suppliersLoading || batchesLoading;

  // 1. STATO FILTRI, ORDINAMENTO E PAGINAZIONE
  const [filters, setFilters] = useState<SupplierFilterState>(initialFilterState);
  const [sortField, setSortField] = useState<SupplierSortField>('name');
  const [sortDirection, setSortDirection] = useState<SupplierSortDirection>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 2. MODALI — useModal<T> al posto di stati separati
  const filterModal = useModal();
  const detailModal = useModal<EnrichedSupplier>();
  const formModal = useModal<ShoppingSupplierOption>();

  // 3. CALCOLO DINAMICO DEL PAGE SIZE IN BASE ALL'ALTEZZA
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 48,
    defaultPageSize: 8,
    minItems: 3,
    maxItems: 30,
  });

  // 4. HOOK PER ELABORAZIONE AD ALTE PRESTAZIONI IN RAM
  const {
    filteredSuppliers,
    paginatedSuppliers,
    totalPages,
  } = useSupplierArchiveData({
    suppliers,
    batches: allBatches,
    filters,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
  });

  // Conteggio filtri attivi
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.keyword.trim()) count++;
    if (filters.status !== 'all') count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  const handleResetFilters = () => {
    setFilters(initialFilterState);
    setCurrentPage(1);
  };

  const handleSort = (field: SupplierSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleOpenNewSupplier = () => formModal.open(null);

  const handleSelectSupplier = (supplier: EnrichedSupplier) => detailModal.open(supplier);

  const handleEditFromDetail = (supplier: EnrichedSupplier) => {
    detailModal.close();
    formModal.open(supplier);
  };

  const handleDeleteFromDetail = (supplier: EnrichedSupplier) => {
    confirm({
      title: 'Elimina Fornitore',
      message: `Sei sicuro di voler eliminare definitivamente il fornitore "${supplier.name}"? Lo storico prezzi associato rimarrà in archivio.`,
      confirmText: 'Elimina',
      isDestructive: true,
      onConfirm: async () => {
        await mutations.deleteSupplier(supplier.id);
        detailModal.close();
      },
    });
  };

  return (
    <div className="h-full flex flex-col gap-3.5 max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER COMPATTO CON ICONA IN BOX NERO */}
      <SupplierStatsOverview panelClass={ARCHIVE_PANEL_CLASS} />

      {/* 2. RIGA AZIONI: TASTO NUOVO FORNITORE E LENTE DI RICERCA */}
      <SupplierFilterBar
        onOpenNewSupplier={handleOpenNewSupplier}
        onOpenSearch={filterModal.open}
        activeFiltersCount={activeFiltersCount}
        panelClass={ARCHIVE_PANEL_CLASS}
      />

      {/* 3. TABELLA FORNITORI CON ORDINAMENTO E PAGINAZIONE */}
      <ArchiveTableContainer
        header={
          <SupplierTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        }
        loading={loading}
        loadingMessage="Caricamento negozi e fornitori in corso..."
        isEmpty={filteredSuppliers.length === 0}
        emptyIcon={<StoreIcon className="w-8 h-8 text-slate-400" />}
        emptyTitle="Nessun negozio o fornitore trovato"
        emptyDescription={
          hasActiveFilters
            ? 'Nessun fornitore corrisponde ai filtri selezionati. Prova ad azzerarli.'
            : 'Non ci sono negozi o fornitori registrati in archivio.'
        }
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className={ARCHIVE_PANEL_CLASS}
        bodyRef={containerRef}
      >
        {paginatedSuppliers.map((supplier) => (
          <SupplierTableRow
            key={supplier.id}
            supplier={supplier}
            onSelect={handleSelectSupplier}
          />
        ))}
      </ArchiveTableContainer>

      {/* 4. MODALE FILTRI & RICERCA IN OVERLAY GLOBALE */}
      <SupplierFilterModal
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

      {/* 5. MODALE DI DETTAGLIO FORNITORE (Al click sulla riga) */}
      <SupplierDetailModal
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        supplier={detailModal.data}
        onEditClick={handleEditFromDetail}
        onDeleteClick={handleDeleteFromDetail}
      />

      {/* 6. MODALE CREAZIONE / MODIFICA FORNITORE */}
      <SupplierModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        supplierToEdit={formModal.data}
        config={config}
      />
    </div>
  );
};

export default SuppliersPage;
