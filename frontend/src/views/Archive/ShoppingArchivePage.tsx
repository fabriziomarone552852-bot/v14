// src/views/Archive/ShoppingArchivePage.tsx
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  UsersIcon,
  TaskListIcon,
  TagIcon,
} from '@/components/shared/utils/Icons';
import { useShoppingData } from '@/hooks/shopping/useShoppingData';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { fetchAllInventoryBatches, shoppingQueryKeys, type ItemBatchRecord } from '@/api/shoppingApi';
import { useModal } from '@/hooks/useModals';
import { ArchiveActionBar } from '@/components/shared/layout/ArchiveActionBar';
import { SegmentedTabs, type TabItem } from '@/components/shared/layout/SegmentedTabs';
import { ShoppingStatsOverview } from '@/components/archive/shopping/ShoppingStatsOverview';
import { ShoppingArchiveGroupsTab } from '@/components/archive/shopping/ShoppingArchiveGroupsTab';
import { ShoppingArchiveListsTab } from '@/components/archive/shopping/ShoppingArchiveListsTab';
import { ShoppingArchivePricesTab } from '@/components/archive/shopping/ShoppingArchivePricesTab';
import type { ShoppingGroupFilterState } from '@/components/archive/shopping/ShoppingGroupFilterModal';
import type { ShoppingListFilterState } from '@/components/archive/shopping/ShoppingListFilterModal';
import type { ShoppingPriceFilterState } from '@/components/archive/shopping/ShoppingPriceFilterModal';
import ShoppingGroupCreateModal from '@/components/shared/shopping/ShoppingGroupCreateModal';

export type ShoppingArchiveTab = 'gruppi' | 'liste' | 'prezzi';

const PANEL_CLASS = 'rounded-2xl border border-slate-200/90 bg-white shadow-xs';

const initialGroupFilters: ShoppingGroupFilterState = {
  keyword: '',
  status: 'all',
  members: [],
};

const initialListFilters: ShoppingListFilterState = {
  keyword: '',
  status: 'all',
  products: [],
};

const initialPriceFilters: ShoppingPriceFilterState = {
  keyword: '',
  lookbackValue: 1,
  lookbackUnit: 'years',
};

export const ShoppingArchivePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ShoppingArchiveTab>('gruppi');
  const { createGroup } = useShoppingMutations();

  // Caricamento Dati
  const {
    groups,
    lists,
    products,
    groupsLoading,
    listsLoading,
  } = useShoppingData();

  const { data: allBatches = [], isLoading: batchesLoading } = useQuery<ItemBatchRecord[]>({
    queryKey: shoppingQueryKeys.allBatches(),
    queryFn: ({ signal }) => fetchAllInventoryBatches(signal),
    staleTime: 30_000,
  });

  const isOverallLoading = groupsLoading || listsLoading;

  // Modali Creazione
  const groupCreateModal = useModal<null>();

  // Stati dei Filtri per ciascuna Tab
  const [groupFilters, setGroupFilters] = useState<ShoppingGroupFilterState>(initialGroupFilters);
  const [isGroupFilterModalOpen, setIsGroupFilterModalOpen] = useState(false);

  const [listFilters, setListFilters] = useState<ShoppingListFilterState>(initialListFilters);
  const [isListFilterModalOpen, setIsListFilterModalOpen] = useState(false);

  const [priceFilters, setPriceFilters] = useState<ShoppingPriceFilterState>(initialPriceFilters);
  const [isPriceFilterModalOpen, setIsPriceFilterModalOpen] = useState(false);

  // Conteggio filtri attivi in base alla tab selezionata
  const activeFiltersCount = useMemo(() => {
    if (activeTab === 'gruppi') {
      let c = 0;
      if (groupFilters.keyword.trim()) c++;
      if (groupFilters.status !== 'all') c++;
      if (groupFilters.members.length > 0) c += groupFilters.members.length;
      return c;
    }
    if (activeTab === 'liste') {
      let c = 0;
      if (listFilters.keyword.trim()) c++;
      if (listFilters.status !== 'all') c++;
      if (listFilters.products.length > 0) c += listFilters.products.length;
      return c;
    }
    if (activeTab === 'prezzi') {
      let c = 0;
      if (priceFilters.keyword.trim()) c++;
      if (priceFilters.lookbackValue !== 1 || priceFilters.lookbackUnit !== 'years') c++;
      return c;
    }
    return 0;
  }, [activeTab, groupFilters, listFilters, priceFilters]);

  // Configurazione SegmentedTabs
  const tabsConfig: TabItem<ShoppingArchiveTab>[] = useMemo(
    () => [
      {
        id: 'gruppi',
        label: 'Gruppi',
        icon: <UsersIcon className="w-3.5 h-3.5" />,
        count: groups.length,
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
      },
      {
        id: 'liste',
        label: 'Liste',
        icon: <TaskListIcon className="w-3.5 h-3.5" />,
        count: lists.length,
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/60',
      },
      {
        id: 'prezzi',
        label: 'Storico Prezzi',
        icon: <TagIcon className="w-3.5 h-3.5" />,
        count: allBatches.length,
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      },
    ],
    [groups.length, lists.length, allBatches.length]
  );

  const handleOpenSearchModal = () => {
    if (activeTab === 'gruppi') setIsGroupFilterModalOpen(true);
    else if (activeTab === 'liste') setIsListFilterModalOpen(true);
    else if (activeTab === 'prezzi') setIsPriceFilterModalOpen(true);
  };

  const handlePrimaryAddAction = () => {
    if (activeTab === 'gruppi') {
      groupCreateModal.open(null);
    }
  };

  const primaryAddLabel = activeTab === 'gruppi' ? 'Nuovo Gruppo' : undefined;


  return (
    <div className="h-full flex flex-col gap-3.5 max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER COMPATTO */}
      <ShoppingStatsOverview panelClass={PANEL_CLASS} />


      {/* 2. RIGA AZIONI: ADDBUTTON, SEGMENTED TABS E LENTE RICERCA */}
      <ArchiveActionBar
        addLabel={primaryAddLabel}
        onAdd={handlePrimaryAddAction}
        centerContent={
          <SegmentedTabs
            tabs={tabsConfig}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        }
        onOpenSearch={handleOpenSearchModal}
        activeFiltersCount={activeFiltersCount}
        className={PANEL_CLASS}
      />

      {/* 3. CONTENUTO TABELLARE IN ARCHIVE CONTAINER */}
      {activeTab === 'gruppi' && (
        <ShoppingArchiveGroupsTab
          groups={groups}
          lists={lists}
          loading={isOverallLoading}
          isFilterModalOpen={isGroupFilterModalOpen}
          onCloseFilterModal={() => setIsGroupFilterModalOpen(false)}
          onOpenCreateModal={() => groupCreateModal.open(null)}
          activeFiltersCount={activeFiltersCount}
          filterState={groupFilters}
          onFilterChange={setGroupFilters}
          onResetFilters={() => setGroupFilters(initialGroupFilters)}
          className={PANEL_CLASS}
        />
      )}

      {activeTab === 'liste' && (
        <ShoppingArchiveListsTab
          lists={lists}
          products={products}
          loading={isOverallLoading}
          isFilterModalOpen={isListFilterModalOpen}
          onCloseFilterModal={() => setIsListFilterModalOpen(false)}
          filterState={listFilters}
          onFilterChange={setListFilters}
          onResetFilters={() => setListFilters(initialListFilters)}
          className={PANEL_CLASS}
        />
      )}

      {activeTab === 'prezzi' && (
        <ShoppingArchivePricesTab
          batches={allBatches}
          loading={batchesLoading}
          isFilterModalOpen={isPriceFilterModalOpen}
          onCloseFilterModal={() => setIsPriceFilterModalOpen(false)}
          filterState={priceFilters}
          onFilterChange={setPriceFilters}
          onResetFilters={() => setPriceFilters(initialPriceFilters)}
          className={PANEL_CLASS}
        />
      )}


      {/* Modal Creazione Gruppo */}
      {groupCreateModal.isOpen && (
        <ShoppingGroupCreateModal
          isOpen={true}
          onClose={groupCreateModal.close}
          onSubmit={async (data) => {
            await createGroup(data);
            groupCreateModal.close();
          }}
        />
      )}
    </div>
  );
};

export default ShoppingArchivePage;
