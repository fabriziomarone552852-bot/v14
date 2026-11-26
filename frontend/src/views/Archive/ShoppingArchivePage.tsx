// src/views/Archive/ShoppingArchivePage.tsx
import React, { useMemo } from 'react';
import {
  UsersIcon,
  TaskListIcon,
  ShoppingIcon,
  TagIcon,
} from '@/components/shared/utils/Icons';
import { ArchiveActionBar } from '@/components/shared/layout/ArchiveActionBar';
import {
  ShoppingArchiveViewSelect,
  type ShoppingArchiveViewOption,
} from '@/components/archive/shopping/ShoppingArchiveViewSelect';
import { ShoppingStatsOverview } from '@/components/archive/shopping/ShoppingStatsOverview';
import { ShoppingArchiveGroupsTab } from '@/components/archive/shopping/ShoppingArchiveGroupsTab';
import { ShoppingArchiveListsTab } from '@/components/archive/shopping/ShoppingArchiveListsTab';
import { ShoppingArchiveProductsTab } from '@/components/archive/shopping/ShoppingArchiveProductsTab';
import { ShoppingArchivePricesTab } from '@/components/archive/shopping/ShoppingArchivePricesTab';
import { ShoppingArchivePageModals } from '@/components/archive/shopping/ShoppingArchivePageModals';
import { useShoppingArchivePageLogic } from '@/components/archive/shopping/useShoppingArchivePageLogic';
import { ERROR_MESSAGES } from '@/data/loadingMessages';

const PANEL_CLASS = 'rounded-2xl border border-slate-200/90 bg-white shadow-xs';

export const ShoppingArchivePage: React.FC = () => {
  const logic = useShoppingArchivePageLogic();

  const productsWithPricesCount = useMemo(
    () => new Set(logic.allBatches.map((b) => b.productId ?? (b.productName || '').toLowerCase())).size,
    [logic.allBatches]
  );

  // Configurazione Selettore Viste
  const viewOptions: ShoppingArchiveViewOption[] = useMemo(
    () => [
      {
        id: 'gruppi',
        label: 'Gruppi',
        description: 'Gruppi spesa condivisi e membri',
        icon: <UsersIcon className="w-4 h-4" />,
        count: logic.groups.length,
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
      },
      {
        id: 'liste',
        label: 'Liste',
        description: 'Liste attive, completate e archiviate',
        icon: <TaskListIcon className="w-4 h-4" />,
        count: logic.lists.length,
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/60',
      },
      {
        id: 'prodotti',
        label: 'Prodotti',
        description: 'Catalogo articoli, marche e giudizi',
        icon: <ShoppingIcon className="w-4 h-4" />,
        count: logic.products.length,
        badgeBg: 'bg-lime-50 text-lime-700 border-lime-200/60',
      },
      {
        id: 'prezzi',
        label: 'Storico',
        description: 'Andamento prezzi e rilevazioni',
        icon: <TagIcon className="w-4 h-4" />,
        count: productsWithPricesCount,
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      },
    ],
    [logic.groups.length, logic.lists.length, logic.products.length, productsWithPricesCount]
  );

  return (
    <div className="h-full flex flex-col gap-2 sm:gap-3.5 w-full max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER COMPATTO CON STATS OVERVIEW */}
      <ShoppingStatsOverview panelClass={PANEL_CLASS} />

      {/* 2. RIGA AZIONI: ADDBUTTON, SELETTORE VISTA E LENTE RICERCA */}
      <ArchiveActionBar
        addLabel={logic.primaryAddLabel}
        onAdd={logic.handlePrimaryAddAction}
        centerContent={
          <ShoppingArchiveViewSelect
            options={viewOptions}
            activeTab={logic.activeTab}
            onChange={logic.setActiveTab}
            isMobile={logic.isMobile}
          />
        }
        onOpenSearch={logic.handleOpenSearchModal}
        activeFiltersCount={logic.activeFiltersCount}
        className={PANEL_CLASS}
      />

      {/* 3. CONTENUTO TABELLARE IN BASE ALLA TAB ATTIVA */}
      {logic.isError ? (
        <div className={`${PANEL_CLASS} flex flex-col flex-1 items-center justify-center py-20 text-slate-400`}>
          <div className="text-3xl mb-3">⚠️</div>
          <p className="text-sm font-bold text-rose-700">{ERROR_MESSAGES.archive}</p>
          <div className="mt-4 p-1.5 bg-rose-50 border border-rose-200 rounded-2xl">
            <button
              type="button"
              onClick={() => logic.queryClient.refetchQueries()}
              className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-rose-100 rounded-xl transition cursor-pointer"
            >
              🔄 Riprova
            </button>
          </div>
        </div>
      ) : logic.activeTab === 'gruppi' ? (
        <ShoppingArchiveGroupsTab
          groups={logic.groups}
          lists={logic.lists}
          loading={logic.isOverallLoading}
          isFilterModalOpen={logic.isGroupFilterModalOpen}
          onCloseFilterModal={() => logic.setIsGroupFilterModalOpen(false)}
          onOpenCreateModal={() => logic.groupCreateModal.open(null)}
          activeFiltersCount={logic.activeFiltersCount}
          filterState={logic.groupFilters}
          onFilterChange={logic.setGroupFilters}
          onResetFilters={() => logic.setGroupFilters(logic.initialGroupFilters)}
          className={PANEL_CLASS}
        />
      ) : logic.activeTab === 'liste' ? (
        <ShoppingArchiveListsTab
          lists={logic.lists}
          products={logic.products}
          loading={logic.isOverallLoading}
          isFilterModalOpen={logic.isListFilterModalOpen}
          onCloseFilterModal={() => logic.setIsListFilterModalOpen(false)}
          filterState={logic.listFilters}
          onFilterChange={logic.setListFilters}
          onResetFilters={() => logic.setListFilters(logic.initialListFilters)}
          className={PANEL_CLASS}
        />
      ) : logic.activeTab === 'prodotti' ? (
        <ShoppingArchiveProductsTab
          products={logic.products}
          batches={logic.allBatches}
          loading={logic.productsLoading}
          isFilterModalOpen={logic.isProductFilterModalOpen}
          onCloseFilterModal={() => logic.setIsProductFilterModalOpen(false)}
          filterState={logic.productFilters}
          onFilterChange={logic.setProductFilters}
          onResetFilters={() => logic.setProductFilters(logic.initialProductFilters)}
          className={PANEL_CLASS}
        />
      ) : (
        <ShoppingArchivePricesTab
          batches={logic.allBatches}
          products={logic.products}
          loading={logic.batchesLoading}
          isFilterModalOpen={logic.isPriceFilterModalOpen}
          onCloseFilterModal={() => logic.setIsPriceFilterModalOpen(false)}
          filterState={logic.priceFilters}
          onFilterChange={logic.setPriceFilters}
          onResetFilters={() => logic.setPriceFilters(logic.initialPriceFilters)}
          className={PANEL_CLASS}
        />
      )}

      {/* 4. MODALI DI CREAZIONE */}
      <ShoppingArchivePageModals
        isMobile={logic.isMobile}
        groupCreateModal={logic.groupCreateModal}
        listCreateModal={logic.listCreateModal}
        productCreateModal={logic.productCreateModal}
        quickPriceModal={logic.quickPriceModal}
        groups={logic.groups}
        lists={logic.lists}
        products={logic.products}
        brands={logic.brands}
        suppliers={logic.suppliers}
        config={logic.config}
        listForm={logic.listForm}
        setListForm={logic.setListForm}
        onCreateGroup={logic.createGroup}
        onCreateListSubmit={logic.handleCreateListSubmit}
      />
    </div>
  );
};

export default ShoppingArchivePage;
