// src/views/Archive/SuppliersPage.tsx
import React, { useMemo } from 'react';
import { StoreIcon, TagIcon } from '@/components/shared/utils/Icons';
import { ArchiveActionBar } from '@/components/shared/layout/ArchiveActionBar';
import { SegmentedTabs, type TabItem } from '@/components/shared/layout/SegmentedTabs';
import { SupplierStatsOverview } from '@/components/archive/suppliers/SupplierStatsOverview';
import { SuppliersTabTable } from '@/components/archive/suppliers/SuppliersTabTable';
import { BrandsTabTable } from '@/components/archive/suppliers/BrandsTabTable';
import { SuppliersPageModals } from '@/components/archive/suppliers/SuppliersPageModals';
import { useSuppliersPageLogic, type SupplierArchiveTab } from '@/components/archive/suppliers/useSuppliersPageLogic';

export const ARCHIVE_PANEL_CLASS = 'rounded-2xl border border-slate-200/90 bg-white shadow-xs';

export const SuppliersPage: React.FC = () => {
  const logic = useSuppliersPageLogic();

  // Configurazione SegmentedTabs
  const tabsConfig: TabItem<SupplierArchiveTab>[] = useMemo(
    () => [
      {
        id: 'negozi',
        label: 'Negozi',
        icon: <StoreIcon className="w-3.5 h-3.5" />,
        count: logic.suppliersCount,
        badgeBg: 'bg-orange-50 text-orange-700 border-orange-200/60',
      },
      {
        id: 'brand',
        label: 'Marchi',
        icon: <TagIcon className="w-3.5 h-3.5" />,
        count: logic.brandsCount,
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
      },
    ],
    [logic.suppliersCount, logic.brandsCount]
  );

  return (
    <div className="h-full flex flex-col gap-2 sm:gap-3.5 w-full max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER COMPATTO CON STATS OVERVIEW */}
      <SupplierStatsOverview panelClass={ARCHIVE_PANEL_CLASS} />

      {/* 2. RIGA AZIONI CON TASTO AGGIUNGI, SLIDER TAB E RICERCA */}
      <ArchiveActionBar
        addLabel={logic.activeTab === 'negozi' ? 'Nuovo Negozio' : undefined}
        onAdd={logic.activeTab === 'negozi' ? logic.handleOpenNewSupplier : undefined}
        centerContent={
          <SegmentedTabs<SupplierArchiveTab>
            tabs={tabsConfig}
            activeTab={logic.activeTab}
            onChange={logic.handleTabChange}
          />
        }
        onOpenSearch={logic.handleOpenSearch}
        activeFiltersCount={logic.activeFiltersCount}
        className={ARCHIVE_PANEL_CLASS}
      />

      {/* 3. TABELLA ATTIVA */}
      {logic.activeTab === 'negozi' ? (
        <SuppliersTabTable
          filteredSuppliers={logic.filteredSuppliers}
          paginatedSuppliers={logic.paginatedSuppliers}
          sortField={logic.supplierSortField}
          sortDirection={logic.supplierSortDirection}
          onSort={logic.handleSupplierSort}
          isSuperuser={logic.isSuperuser}
          loading={logic.loading}
          isError={Boolean(logic.isError)}
          hasActiveFilters={logic.hasActiveFilters}
          onResetFilters={logic.handleResetFilters}
          onRetry={() => logic.queryClient.refetchQueries()}
          currentPage={logic.currentPage}
          totalPages={logic.totalPages}
          onPageChange={logic.setCurrentPage}
          containerRef={logic.containerRef}
          onSelectSupplier={(s) => logic.supplierDetailModal.open(s)}
          panelClass={ARCHIVE_PANEL_CLASS}
        />
      ) : (
        <BrandsTabTable
          filteredBrands={logic.filteredBrands}
          paginatedBrands={logic.paginatedBrands}
          sortField={logic.brandSortField}
          sortDirection={logic.brandSortDirection}
          onSort={logic.handleBrandSort}
          loading={logic.loading}
          isError={Boolean(logic.isError)}
          hasActiveFilters={logic.hasActiveFilters}
          onResetFilters={logic.handleResetFilters}
          onRetry={() => logic.queryClient.refetchQueries()}
          currentPage={logic.currentPage}
          totalPages={logic.totalPages}
          onPageChange={logic.setCurrentPage}
          containerRef={logic.containerRef}
          onSelectBrand={(b) => logic.brandDetailModal.open(b)}
          panelClass={ARCHIVE_PANEL_CLASS}
        />
      )}

      {/* 4. MODALI NEGOZI E BRAND */}
      <SuppliersPageModals
        isMobile={logic.isMobile}
        isSuperuser={logic.isSuperuser}
        config={logic.config}
        supplierFilterModal={logic.supplierFilterModal}
        supplierDetailModal={logic.supplierDetailModal}
        supplierFormModal={logic.supplierFormModal}
        supplierFilters={logic.supplierFilters}
        setSupplierFilters={logic.setSupplierFilters}
        onResetFilters={logic.handleResetFilters}
        hasActiveFilters={logic.hasActiveFilters}
        onDeleteSupplier={logic.handleDeleteSupplier}
        onPageReset={() => logic.setCurrentPage(1)}
        brandFilterModal={logic.brandFilterModal}
        brandDetailModal={logic.brandDetailModal}
        brandFormModal={logic.brandFormModal}
        brandFilters={logic.brandFilters}
        setBrandFilters={logic.setBrandFilters}
        onDeleteBrand={logic.handleDeleteBrand}
      />
    </div>
  );
};

export default SuppliersPage;
