// src/components/archive/suppliers/useSuppliersPageLogic.ts
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useShoppingData } from '@/hooks/shopping/useShoppingData';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useConfirm } from '@/context/ConfirmContext';
import { useModal } from '@/hooks/useModals';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { fetchAllInventoryBatches, shoppingQueryKeys } from '@/api/shoppingApi';
import type { ItemBatchRecord, ShoppingSupplierOption } from '@/types/shopping';
import { useArchiveHeader } from '@/context/ArchiveHeaderContext';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';
import {
  useSupplierArchiveData,
  type EnrichedSupplier,
  type SupplierFilterState,
  type SupplierSortField,
  type SupplierSortDirection,
} from '@/hooks/useSupplierArchiveData';
import {
  useBrandArchiveData,
  type EnrichedBrand,
  type BrandFilterState,
  type BrandSortField,
} from '@/hooks/useBrandArchiveData';

export type SupplierArchiveTab = 'negozi' | 'brand';

const initialSupplierFilterState: SupplierFilterState = {
  keyword: '',
  status: 'all',
};

const initialBrandFilterState: BrandFilterState = {
  keyword: '',
};

export const useSuppliersPageLogic = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const isSuperuser = Boolean(user?.is_superuser);
  const [activeTab, setActiveTab] = useState<SupplierArchiveTab>('negozi');

  const { suppliers, brands, config, suppliersLoading, brandsLoading } = useShoppingData();
  const mutations = useShoppingMutations();
  const { confirm } = useConfirm();

  // Caricamento lotti d'inventario
  const { data: allBatches = [], isLoading: batchesLoading, isError } = useQuery<ItemBatchRecord[]>({
    queryKey: shoppingQueryKeys.allBatches(),
    queryFn: ({ signal }) => fetchAllInventoryBatches(signal),
    staleTime: 30_000,
  });

  const loading = (activeTab === 'negozi' ? suppliersLoading : brandsLoading) || batchesLoading;

  // Filtri & Ordinamento
  const [supplierFilters, setSupplierFilters] = useState<SupplierFilterState>(initialSupplierFilterState);
  const [supplierSortField, setSupplierSortField] = useState<SupplierSortField>('name');
  const [supplierSortDirection, setSupplierSortDirection] = useState<SupplierSortDirection>('asc');

  const [brandFilters, setBrandFilters] = useState<BrandFilterState>(initialBrandFilterState);
  const [brandSortField, setBrandSortField] = useState<BrandSortField>('name');
  const [brandSortDirection, setBrandSortDirection] = useState<SupplierSortDirection>('asc');

  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modali
  const supplierFilterModal = useModal();
  const supplierDetailModal = useModal<EnrichedSupplier>();
  const supplierFormModal = useModal<ShoppingSupplierOption>();

  const brandFilterModal = useModal();
  const brandDetailModal = useModal<EnrichedBrand>();
  const brandFormModal = useModal<ShoppingSupplierOption>();

  // Calcolo dinamico page size
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 48,
    defaultPageSize: 8,
    minItems: 3,
    maxItems: 30,
  });

  // Hook dati archivio negozi
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

  // Hook dati archivio brand
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
      title: 'Elimina Negozio',
      message: `Sei sicuro di voler eliminare il negozio "${sName}"? Se è associato anche come marchio, rimarrà come brand.`,
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

  // Registrazione header archivio mobile
  useArchiveHeader({
    title: 'Negozi & Brand',
    onOpenSearch: handleOpenSearch,
    onOpenNew: activeTab === 'negozi' ? handleOpenNewSupplier : undefined,
    activeFiltersCount,
  });

  return {
    queryClient,
    isMobile,
    isSuperuser,
    activeTab,
    config,
    loading,
    isError,
    suppliersCount: suppliers.length,
    brandsCount: brands.length,
    supplierFilters,
    setSupplierFilters,
    supplierSortField,
    supplierSortDirection,
    brandFilters,
    setBrandFilters,
    brandSortField,
    brandSortDirection,
    currentPage,
    setCurrentPage,
    containerRef,
    filteredSuppliers,
    paginatedSuppliers,
    filteredBrands,
    paginatedBrands,
    activeFiltersCount,
    hasActiveFilters,
    totalPages,
    supplierFilterModal,
    supplierDetailModal,
    supplierFormModal,
    brandFilterModal,
    brandDetailModal,
    brandFormModal,
    handleResetFilters,
    handleTabChange,
    handleSupplierSort,
    handleBrandSort,
    handleOpenNewSupplier,
    handleOpenSearch,
    handleDeleteSupplier,
    handleDeleteBrand,
  };
};
