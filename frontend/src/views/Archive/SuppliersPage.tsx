// src/views/Archive/SuppliersPage.tsx
import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useShoppingData } from '@/hooks/shopping/useShoppingData';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useConfirm } from '@/context/ConfirmContext';
import { useModal } from '@/hooks/useModals';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { fetchAllInventoryBatches, shoppingQueryKeys } from '@/api/shoppingApi';
import type { ItemBatchRecord, ShoppingSupplierOption } from '@/types/shopping';
import { StoreIcon, TagIcon } from '@/components/shared/utils/Icons';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import { ArchiveActionBar } from '@/components/shared/layout/ArchiveActionBar';
import { SegmentedTabs, type TabItem } from '@/components/shared/layout/SegmentedTabs';
import { ERROR_MESSAGES } from '@/data/loadingMessages';

import { SupplierStatsOverview } from '@/components/archive/suppliers/SupplierStatsOverview';
import { SupplierTableHeader } from '@/components/archive/suppliers/SupplierTableHeader';
import { SupplierTableRow } from '@/components/archive/suppliers/SupplierTableRow';
import { SupplierFilterModal } from '@/components/archive/suppliers/SupplierFilterModal';
import { SupplierDetailModal } from '@/components/archive/suppliers/SupplierDetailModal';
import { SupplierModal } from '@/components/archive/suppliers/SupplierModal';

import { BrandTableHeader } from '@/components/archive/suppliers/BrandTableHeader';
import { BrandTableRow } from '@/components/archive/suppliers/BrandTableRow';
import { BrandFilterModal } from '@/components/archive/suppliers/BrandFilterModal';
import { BrandDetailModal } from '@/components/archive/suppliers/BrandDetailModal';
import { BrandModal } from '@/components/archive/suppliers/BrandModal';

import {
  useSupplierArchiveData,
  useBrandArchiveData,
  type EnrichedSupplier,
  type EnrichedBrand,
  type SupplierFilterState,
  type BrandFilterState,
  type SupplierSortField,
  type BrandSortField,
  type SupplierSortDirection,
} from '@/hooks/useSupplierArchiveData';

export const ARCHIVE_PANEL_CLASS = 'rounded-2xl border border-slate-200/90 bg-white shadow-xs';

export type SupplierArchiveTab = 'negozi' | 'brand';

const initialSupplierFilterState: SupplierFilterState = {
  keyword: '',
  status: 'all',
};

const initialBrandFilterState: BrandFilterState = {
  keyword: '',
};

export const SuppliersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SupplierArchiveTab>('negozi');

  const { suppliers, brands, config, suppliersLoading, brandsLoading } = useShoppingData();
  const mutations = useShoppingMutations();
  const { confirm } = useConfirm();

  // Caricamento di tutti i lotti d'inventario per arricchire negozi e brand con dati acquisti
  const { data: allBatches = [], isLoading: batchesLoading, isError } = useQuery<ItemBatchRecord[]>({
    queryKey: shoppingQueryKeys.allBatches(),
    queryFn: ({ signal }) => fetchAllInventoryBatches(signal),
    staleTime: 30_000,
  });

  const loading = (activeTab === 'negozi' ? suppliersLoading : brandsLoading) || batchesLoading;

  // 1. STATO FILTRI, ORDINAMENTO E PAGINAZIONE PER NEGOZI
  const [supplierFilters, setSupplierFilters] = useState<SupplierFilterState>(initialSupplierFilterState);
  const [supplierSortField, setSupplierSortField] = useState<SupplierSortField>('name');
  const [supplierSortDirection, setSupplierSortDirection] = useState<SupplierSortDirection>('asc');

  // 2. STATO FILTRI, ORDINAMENTO E PAGINAZIONE PER BRAND
  const [brandFilters, setBrandFilters] = useState<BrandFilterState>(initialBrandFilterState);
  const [brandSortField, setBrandSortField] = useState<BrandSortField>('name');
  const [brandSortDirection, setBrandSortDirection] = useState<SupplierSortDirection>('asc');

  const [currentPage, setCurrentPage] = useState<number>(1);

  // 3. MODALI
  const supplierFilterModal = useModal();
  const supplierDetailModal = useModal<EnrichedSupplier>();
  const supplierFormModal = useModal<ShoppingSupplierOption>();

  const brandFilterModal = useModal();
  const brandDetailModal = useModal<EnrichedBrand>();
  const brandFormModal = useModal<ShoppingSupplierOption>();

  // 4. CALCOLO DINAMICO DEL PAGE SIZE IN BASE ALL'ALTEZZA
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 48,
    defaultPageSize: 8,
    minItems: 3,
    maxItems: 30,
  });

  // 5. HOOK DATI ARCHIVIO NEGOZI
  const {
    filteredSuppliers,
    paginatedSuppliers,
    totalPages: totalSupplierPages,
  } = useSupplierArchiveData({
    suppliers,
    batches: allBatches,
    filters: supplierFilters,
    sortField: supplierSortField,
    sortDirection: supplierSortDirection,
    currentPage,
    pageSize,
  });

  // 6. HOOK DATI ARCHIVIO BRAND
  const {
    filteredBrands,
    paginatedBrands,
    totalPages: totalBrandPages,
  } = useBrandArchiveData({
    brands,
    batches: allBatches,
    filters: brandFilters,
    sortField: brandSortField,
    sortDirection: brandSortDirection,
    currentPage,
    pageSize,
  });

  // Conteggio filtri attivi
  const activeSupplierFiltersCount = useMemo(() => {
    let count = 0;
    if (supplierFilters.keyword.trim()) count++;
    if (supplierFilters.status !== 'all') count++;
    return count;
  }, [supplierFilters]);

  const activeBrandFiltersCount = useMemo(() => {
    let count = 0;
    if (brandFilters.keyword.trim()) count++;
    return count;
  }, [brandFilters]);

  const activeFiltersCount = activeTab === 'negozi' ? activeSupplierFiltersCount : activeBrandFiltersCount;
  const hasActiveFilters = activeFiltersCount > 0;
  const totalPages = activeTab === 'negozi' ? totalSupplierPages : totalBrandPages;

  // Configurazione SegmentedTabs
  const tabsConfig: TabItem<SupplierArchiveTab>[] = useMemo(
    () => [
      {
        id: 'negozi',
        label: 'Negozi',
        icon: <StoreIcon className="w-3.5 h-3.5" />,
        count: suppliers.length,
        badgeBg: 'bg-orange-50 text-orange-700 border-orange-200/60',
      },
      {
        id: 'brand',
        label: 'Marchi',
        icon: <TagIcon className="w-3.5 h-3.5" />,
        count: brands.length,
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
      },
    ],
    [suppliers.length, brands.length]
  );

  const handleResetFilters = () => {
    if (activeTab === 'negozi') {
      setSupplierFilters(initialSupplierFilterState);
    } else {
      setBrandFilters(initialBrandFilterState);
    }
    setCurrentPage(1);
  };

  const handleTabChange = (tab: SupplierArchiveTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSupplierSort = (field: SupplierSortField) => {
    if (supplierSortField === field) {
      setSupplierSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSupplierSortField(field);
      setSupplierSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleBrandSort = (field: BrandSortField) => {
    if (brandSortField === field) {
      setBrandSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setBrandSortField(field);
      setBrandSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleOpenNewSupplier = () => {
    supplierFormModal.open(null);
  };

  const handleOpenSearch = () => {
    if (activeTab === 'negozi') {
      supplierFilterModal.open();
    } else {
      brandFilterModal.open();
    }
  };

  const handleDeleteSupplier = (supplier: EnrichedSupplier) => {
    const sName = supplier.nameNormalized || supplier.name;
    confirm({
      title: 'Elimina Fornitore',
      message: `Sei sicuro di voler eliminare il fornitore "${sName}"? Se è associato anche come marchio, rimarrà come brand.`,
      confirmText: 'Elimina',
      isDestructive: true,
      onConfirm: async () => {
        await mutations.deleteSupplier(supplier.id, 1);
        supplierDetailModal.close();
      },
    });
  };

  const handleDeleteBrand = (brand: EnrichedBrand) => {
    const bName = brand.nameNormalized || brand.name;
    confirm({
      title: 'Elimina Brand',
      message: `Sei sicuro di voler eliminare il marchio "${bName}"? Se è associato anche come fornitore, rimarrà come negozio.`,
      confirmText: 'Elimina',
      isDestructive: true,
      onConfirm: async () => {
        await mutations.deleteSupplier(brand.id, 2);
        brandDetailModal.close();
      },
    });
  };

  return (
    <div className="h-full flex flex-col gap-3.5 max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER COMPATTO CON ICONA IN BOX NERO */}
      <SupplierStatsOverview panelClass={ARCHIVE_PANEL_CLASS} />

      {/* 2. RIGA AZIONI CON TASTO AGGIUNGI (SOLO NEGOZI), SLIDER TAB E LENTE DI RICERCA */}
      <ArchiveActionBar
        addLabel={activeTab === 'negozi' ? 'Nuovo Negozio' : undefined}
        onAdd={activeTab === 'negozi' ? handleOpenNewSupplier : undefined}
        centerContent={
          <SegmentedTabs<SupplierArchiveTab>
            tabs={tabsConfig}
            activeTab={activeTab}
            onChange={handleTabChange}
          />
        }
        onOpenSearch={handleOpenSearch}
        activeFiltersCount={activeFiltersCount}
        className={ARCHIVE_PANEL_CLASS}
      />

      {/* 3. TABELLA CORRISPONDENTE ALLA TAB ATTIVA */}
      {activeTab === 'negozi' ? (
        <ArchiveTableContainer
          header={
            <SupplierTableHeader
              sortField={supplierSortField}
              sortDirection={supplierSortDirection}
              onSort={handleSupplierSort}
            />
          }
          loading={loading}
          loadingMessage="Caricamento negozi e fornitori in corso..."
          isError={isError}
          errorMessage={ERROR_MESSAGES.archive}
          onRetry={() => queryClient.refetchQueries()}
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
              onSelect={(s) => supplierDetailModal.open(s)}
            />
          ))}
        </ArchiveTableContainer>
      ) : (
        <ArchiveTableContainer
          header={
            <BrandTableHeader
              sortField={brandSortField}
              sortDirection={brandSortDirection}
              onSort={handleBrandSort}
            />
          }
          loading={loading}
          loadingMessage="Caricamento marchi e brand in corso..."
          isError={isError}
          errorMessage={ERROR_MESSAGES.archive}
          onRetry={() => queryClient.refetchQueries()}
          isEmpty={filteredBrands.length === 0}
          emptyIcon={<TagIcon className="w-8 h-8 text-slate-400" />}
          emptyTitle="Nessun marchio o brand trovato"
          emptyDescription={
            hasActiveFilters
              ? 'Nessun marchio corrisponde ai filtri selezionati. Prova ad azzerarli.'
              : 'Non ci sono marchi o brand registrati in archivio.'
          }
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className={ARCHIVE_PANEL_CLASS}
          bodyRef={containerRef}
        >
          {paginatedBrands.map((brand) => (
            <BrandTableRow
              key={brand.id}
              brand={brand}
              onSelect={(b) => brandDetailModal.open(b)}
            />
          ))}
        </ArchiveTableContainer>
      )}

      {/* 4. MODALI NEGOZI */}
      <SupplierFilterModal
        isOpen={supplierFilterModal.isOpen}
        onClose={supplierFilterModal.close}
        filters={supplierFilters}
        onFilterChange={(newFilters) => {
          setSupplierFilters(newFilters);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <SupplierDetailModal
        isOpen={supplierDetailModal.isOpen}
        onClose={supplierDetailModal.close}
        supplier={supplierDetailModal.data}
        onEditClick={(supplier) => {
          supplierDetailModal.close();
          supplierFormModal.open(supplier);
        }}
        onDeleteClick={handleDeleteSupplier}
      />

      <SupplierModal
        isOpen={supplierFormModal.isOpen}
        onClose={supplierFormModal.close}
        supplierToEdit={supplierFormModal.data}
        config={config}
      />

      {/* 5. MODALI BRAND */}
      <BrandFilterModal
        isOpen={brandFilterModal.isOpen}
        onClose={brandFilterModal.close}
        filters={brandFilters}
        onFilterChange={(newFilters) => {
          setBrandFilters(newFilters);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <BrandDetailModal
        isOpen={brandDetailModal.isOpen}
        onClose={brandDetailModal.close}
        brand={brandDetailModal.data}
        onEditClick={(brand) => {
          brandDetailModal.close();
          brandFormModal.open(brand);
        }}
        onDeleteClick={handleDeleteBrand}
      />

      <BrandModal
        isOpen={brandFormModal.isOpen}
        onClose={brandFormModal.close}
        brandToEdit={brandFormModal.data}
      />
    </div>
  );
};

export default SuppliersPage;
