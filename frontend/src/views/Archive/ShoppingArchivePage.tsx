// src/views/Archive/ShoppingArchivePage.tsx
import React, { useMemo } from 'react';
import {
  UsersIcon,
  TaskListIcon,
  TagIcon,
} from '@/components/shared/utils/Icons';
import { ArchiveActionBar } from '@/components/shared/layout/ArchiveActionBar';
import { SegmentedTabs, type TabItem } from '@/components/shared/layout/SegmentedTabs';
import { ShoppingStatsOverview } from '@/components/archive/shopping/ShoppingStatsOverview';
import { ShoppingArchiveGroupsTab } from '@/components/archive/shopping/ShoppingArchiveGroupsTab';
import { ShoppingArchiveListsTab } from '@/components/archive/shopping/ShoppingArchiveListsTab';
import { ShoppingArchivePricesTab } from '@/components/archive/shopping/ShoppingArchivePricesTab';
import { ShoppingArchivePageModals } from '@/components/archive/shopping/ShoppingArchivePageModals';
import { useShoppingArchivePageLogic, type ShoppingArchiveTab } from '@/components/archive/shopping/useShoppingArchivePageLogic';
import { ERROR_MESSAGES } from '@/data/loadingMessages';

const PANEL_CLASS = 'rounded-2xl border border-slate-200/90 bg-white shadow-xs';

export const ShoppingArchivePage: React.FC = () => {
  const logic = useShoppingArchivePageLogic();

  const productsWithPricesCount = useMemo(
    () => new Set(logic.allBatches.map((b) => b.productId ?? (b.productName || '').toLowerCase())).size,
    [logic.allBatches]
  );

  // Configurazione SegmentedTabs
  const tabsConfig: TabItem<ShoppingArchiveTab>[] = useMemo(
    () => [
      {
        id: 'gruppi',
        label: 'Gruppi',
        icon: <UsersIcon className="w-3.5 h-3.5" />,
        count: logic.groups.length,
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
      },
      {
        id: 'liste',
        label: 'Liste',
        icon: <TaskListIcon className="w-3.5 h-3.5" />,
        count: logic.lists.length,
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/60',
      },
      {
        id: 'prezzi',
        label: 'Storico',
        icon: <TagIcon className="w-3.5 h-3.5" />,
        count: productsWithPricesCount,
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      },
    ],
    [logic.groups.length, logic.lists.length, productsWithPricesCount]
  );

  return (
    <div className="h-full flex flex-col gap-2 sm:gap-3.5 w-full max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER COMPATTO CON STATS OVERVIEW */}
      <ShoppingStatsOverview panelClass={PANEL_CLASS} />

      {/* 2. RIGA AZIONI: ADDBUTTON, SEGMENTED TABS E LENTE RICERCA */}
      <ArchiveActionBar
        addLabel={logic.primaryAddLabel}
        onAdd={logic.handlePrimaryAddAction}
        centerContent={
          <SegmentedTabs
            tabs={tabsConfig}
            activeTab={logic.activeTab}
            onChange={logic.setActiveTab}
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
