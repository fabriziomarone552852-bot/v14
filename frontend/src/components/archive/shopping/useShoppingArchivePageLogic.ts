// src/components/archive/shopping/useShoppingArchivePageLogic.ts
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useShoppingData } from '@/hooks/shopping/useShoppingData';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { fetchAllInventoryBatches, shoppingQueryKeys, type ItemBatchRecord } from '@/api/shoppingApi';
import { useModal } from '@/hooks/useModals';
import { useArchiveHeader } from '@/context/ArchiveHeaderContext';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';
import { makeEmptyForm, type ListFormState } from '@/components/shared/shopping/ShoppingListModal';
import type { ShoppingGroupFilterState } from '@/components/archive/shopping/ShoppingGroupFilterModal';
import type { ShoppingListFilterState } from '@/components/archive/shopping/ShoppingListFilterModal';
import type { ShoppingPriceFilterState } from '@/components/archive/shopping/ShoppingPriceFilterModal';

export type ShoppingArchiveTab = 'gruppi' | 'liste' | 'prezzi';

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

export const useShoppingArchivePageLogic = () => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ShoppingArchiveTab>('gruppi');
  const { createGroup, createList } = useShoppingMutations();

  // Caricamento Dati
  const {
    groups,
    lists,
    products,
    brands,
    suppliers,
    config,
    groupsLoading,
    listsLoading,
    isError: shoppingError,
  } = useShoppingData();

  const { data: allBatches = [], isLoading: batchesLoading, isError: batchesError } = useQuery<ItemBatchRecord[]>({
    queryKey: shoppingQueryKeys.allBatches(),
    queryFn: ({ signal }) => fetchAllInventoryBatches(signal),
    staleTime: 30_000,
  });

  const isOverallLoading = groupsLoading || listsLoading;
  const isError = Boolean(shoppingError || batchesError);

  // Modali Creazione
  const groupCreateModal = useModal<null>();
  const quickPriceModal = useModal<null>();
  const listCreateModal = useModal<null>();
  const [listForm, setListForm] = useState<ListFormState>(() => makeEmptyForm(''));

  // Stati dei Filtri per ciascuna Tab
  const [groupFilters, setGroupFilters] = useState<ShoppingGroupFilterState>(initialGroupFilters);
  const [isGroupFilterModalOpen, setIsGroupFilterModalOpen] = useState(false);

  const [listFilters, setListFilters] = useState<ShoppingListFilterState>(initialListFilters);
  const [isListFilterModalOpen, setIsListFilterModalOpen] = useState(false);

  const [priceFilters, setPriceFilters] = useState<ShoppingPriceFilterState>(initialPriceFilters);
  const [isPriceFilterModalOpen, setIsPriceFilterModalOpen] = useState(false);

  // Conteggio filtri attivi
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

  const handleOpenSearchModal = () => {
    if (activeTab === 'gruppi') setIsGroupFilterModalOpen(true);
    else if (activeTab === 'liste') setIsListFilterModalOpen(true);
    else if (activeTab === 'prezzi') setIsPriceFilterModalOpen(true);
  };

  const handlePrimaryAddAction = () => {
    if (activeTab === 'gruppi') {
      groupCreateModal.open(null);
    } else if (activeTab === 'liste') {
      setListForm(makeEmptyForm(''));
      listCreateModal.open(null);
    } else if (activeTab === 'prezzi') {
      quickPriceModal.open(null);
    }
  };

  const handleCreateListSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = listForm.name.trim();
    if (!trimmedName) return;

    const groupId = listForm.destinationValue ? Number(listForm.destinationValue) : undefined;
    const visibilityId = groupId ? 2 : 1; // 2 = group, 1 = private

    await createList({
      name: trimmedName,
      description: listForm.description.trim() || undefined,
      groupId,
      visibilityId,
    });

    listCreateModal.close();
  };

  const primaryAddLabel =
    activeTab === 'gruppi'
      ? 'Nuovo Gruppo'
      : activeTab === 'liste'
      ? 'Nuova Lista'
      : 'Aggiunta Rapida';

  // Registrazione header archivio mobile
  useArchiveHeader({
    title: 'Spesa & Liste',
    onOpenSearch: handleOpenSearchModal,
    onOpenNew: primaryAddLabel ? handlePrimaryAddAction : undefined,
    activeFiltersCount,
  });

  return {
    isMobile,
    queryClient,
    activeTab,
    setActiveTab,
    groups,
    lists,
    products,
    brands,
    suppliers,
    config,
    allBatches,
    batchesLoading,
    isOverallLoading,
    isError,
    activeFiltersCount,
    primaryAddLabel,
    groupCreateModal,
    quickPriceModal,
    listCreateModal,
    listForm,
    setListForm,
    groupFilters,
    setGroupFilters,
    isGroupFilterModalOpen,
    setIsGroupFilterModalOpen,
    listFilters,
    setListFilters,
    isListFilterModalOpen,
    setIsListFilterModalOpen,
    priceFilters,
    setPriceFilters,
    isPriceFilterModalOpen,
    setIsPriceFilterModalOpen,
    initialGroupFilters,
    initialListFilters,
    initialPriceFilters,
    handleOpenSearchModal,
    handlePrimaryAddAction,
    handleCreateListSubmit,
    createGroup,
  };
};
