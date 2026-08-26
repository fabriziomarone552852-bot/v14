// src/hooks/useSupplierArchiveData.ts
import { useMemo } from 'react';
import type { ShoppingSupplierOption, ItemBatchRecord } from '@/types/shopping';

export interface EnrichedSupplier extends ShoppingSupplierOption {
  purchaseCount: number;
  lastPurchaseDate: string | null;
  batches: ItemBatchRecord[];
  statusLabel: string;
}

export type SupplierSortField = 'name' | 'status' | 'purchases' | 'lastPurchase';
export type SupplierSortDirection = 'asc' | 'desc';

export interface SupplierFilterState {
  keyword: string;
  status: 'all' | 'active' | 'inactive';
}

interface UseSupplierArchiveDataOptions {
  suppliers: ShoppingSupplierOption[];
  batches: ItemBatchRecord[];
  filters: SupplierFilterState;
  sortField: SupplierSortField;
  sortDirection: SupplierSortDirection;
  currentPage: number;
  pageSize?: number;
}

export interface SupplierArchiveDataResult {
  enrichedSuppliers: EnrichedSupplier[];
  filteredSuppliers: EnrichedSupplier[];
  paginatedSuppliers: EnrichedSupplier[];
  totalSuppliers: number;
  activeSuppliersCount: number;
  totalPages: number;
}

export const useSupplierArchiveData = ({
  suppliers,
  batches,
  filters,
  sortField,
  sortDirection,
  currentPage,
  pageSize = 8,
}: UseSupplierArchiveDataOptions): SupplierArchiveDataResult => {
  return useMemo(() => {
    // Mappatura batch per fornitore
    const batchesBySupplierId = new Map<number, ItemBatchRecord[]>();
    for (const b of batches) {
      if (b.supplierId != null) {
        if (!batchesBySupplierId.has(b.supplierId)) {
          batchesBySupplierId.set(b.supplierId, []);
        }
        batchesBySupplierId.get(b.supplierId)!.push(b);
      }
    }

    // 1. Arricchimento dei fornitori con statistiche acquisti
    const enrichedList: EnrichedSupplier[] = suppliers.map((s) => {
      const sBatches = batchesBySupplierId.get(s.id) || [];
      const purchaseCount = sBatches.length;

      let lastPurchaseDate: string | null = null;
      if (sBatches.length > 0) {
        const sortedBatches = [...sBatches].sort((a, b) => {
          const tA = new Date(a.purchaseDate).getTime();
          const tB = new Date(b.purchaseDate).getTime();
          return tB - tA;
        });
        lastPurchaseDate = sortedBatches[0].purchaseDate || null;
      }

      const isActive = s.isActive ?? (s.statusId == null || s.statusId === 1 || s.statusCodeName?.toLowerCase() === 'active');
      const statusLabel = isActive ? 'Attivo' : 'Inattivo';

      return {
        ...s,
        isActive,
        statusLabel,
        purchaseCount,
        lastPurchaseDate,
        batches: sBatches,
      };
    });

    const totalSuppliers = enrichedList.length;
    const activeSuppliersCount = enrichedList.filter((s) => s.isActive).length;

    // 2. Filtraggio
    const filtered = enrichedList.filter((s) => {
      if (filters.status === 'active' && !s.isActive) return false;
      if (filters.status === 'inactive' && s.isActive) return false;

      if (filters.keyword.trim()) {
        const q = filters.keyword.toLowerCase().trim();
        const matchName = s.name.toLowerCase().includes(q);
        if (!matchName) return false;
      }

      return true;
    });

    // 3. Ordinamento
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = Number(a.isActive) - Number(b.isActive);
          break;
        case 'purchases':
          comparison = a.purchaseCount - b.purchaseCount;
          break;
        case 'lastPurchase': {
          const tA = a.lastPurchaseDate ? new Date(a.lastPurchaseDate).getTime() : 0;
          const tB = b.lastPurchaseDate ? new Date(b.lastPurchaseDate).getTime() : 0;
          comparison = tA - tB;
          break;
        }
        default:
          comparison = a.id - b.id;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    // 4. Paginazione
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (safePage - 1) * pageSize;
    const paginated = sorted.slice(start, start + pageSize);

    return {
      enrichedSuppliers: enrichedList,
      filteredSuppliers: sorted,
      paginatedSuppliers: paginated,
      totalSuppliers,
      activeSuppliersCount,
      totalPages,
    };
  }, [suppliers, batches, filters, sortField, sortDirection, currentPage, pageSize]);
};

export default useSupplierArchiveData;

// ============================================================================
// BRAND / MARCHI ARCHIVE DATA HOOK & TYPES
// ============================================================================

export interface EnrichedBrand extends ShoppingSupplierOption {
  purchaseCount: number;
  lastPurchaseDate: string | null;
  batches: ItemBatchRecord[];
}

export type BrandSortField = 'name' | 'purchases' | 'lastPurchase';

export interface BrandFilterState {
  keyword: string;
}

interface UseBrandArchiveDataOptions {
  brands: ShoppingSupplierOption[];
  batches: ItemBatchRecord[];
  filters: BrandFilterState;
  sortField: BrandSortField;
  sortDirection: SupplierSortDirection;
  currentPage: number;
  pageSize?: number;
}

export interface BrandArchiveDataResult {
  enrichedBrands: EnrichedBrand[];
  filteredBrands: EnrichedBrand[];
  paginatedBrands: EnrichedBrand[];
  totalBrands: number;
  totalPages: number;
}

export const useBrandArchiveData = ({
  brands,
  batches,
  filters,
  sortField,
  sortDirection,
  currentPage,
  pageSize = 8,
}: UseBrandArchiveDataOptions): BrandArchiveDataResult => {
  return useMemo(() => {
    // Mappatura batch per brand (sia per brandId che per brandName)
    const batchesByBrandId = new Map<number, ItemBatchRecord[]>();
    const batchesByBrandName = new Map<string, ItemBatchRecord[]>();

    for (const b of batches) {
      if (b.brandId != null) {
        if (!batchesByBrandId.has(b.brandId)) {
          batchesByBrandId.set(b.brandId, []);
        }
        batchesByBrandId.get(b.brandId)!.push(b);
      }
      if (b.brandName) {
        const norm = b.brandName.trim().toLowerCase();
        if (!batchesByBrandName.has(norm)) {
          batchesByBrandName.set(norm, []);
        }
        batchesByBrandName.get(norm)!.push(b);
      }
    }

    // 1. Arricchimento dei brand con statistiche acquisti
    const enrichedList: EnrichedBrand[] = brands.map((br) => {
      const byId = batchesByBrandId.get(br.id) || [];
      const byName = batchesByBrandName.get(br.name.trim().toLowerCase()) || [];

      const seenBatchIds = new Set<number>();
      const combinedBatches: ItemBatchRecord[] = [];
      for (const b of [...byId, ...byName]) {
        if (!seenBatchIds.has(b.id)) {
          seenBatchIds.add(b.id);
          combinedBatches.push(b);
        }
      }

      const purchaseCount = combinedBatches.length;
      let lastPurchaseDate: string | null = null;
      if (combinedBatches.length > 0) {
        const sortedBatches = [...combinedBatches].sort((a, b) => {
          const tA = new Date(a.purchaseDate).getTime();
          const tB = new Date(b.purchaseDate).getTime();
          return tB - tA;
        });
        lastPurchaseDate = sortedBatches[0].purchaseDate || null;
      }

      return {
        ...br,
        purchaseCount,
        lastPurchaseDate,
        batches: combinedBatches,
      };
    });

    const totalBrands = enrichedList.length;

    // 2. Filtraggio
    const filtered = enrichedList.filter((br) => {
      if (filters.keyword.trim()) {
        const q = filters.keyword.toLowerCase().trim();
        if (!br.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    // 3. Ordinamento
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'purchases':
          comparison = a.purchaseCount - b.purchaseCount;
          break;
        case 'lastPurchase': {
          const tA = a.lastPurchaseDate ? new Date(a.lastPurchaseDate).getTime() : 0;
          const tB = b.lastPurchaseDate ? new Date(b.lastPurchaseDate).getTime() : 0;
          comparison = tA - tB;
          break;
        }
        default:
          comparison = a.id - b.id;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    // 4. Paginazione
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (safePage - 1) * pageSize;
    const paginated = sorted.slice(start, start + pageSize);

    return {
      enrichedBrands: enrichedList,
      filteredBrands: sorted,
      paginatedBrands: paginated,
      totalBrands,
      totalPages,
    };
  }, [brands, batches, filters, sortField, sortDirection, currentPage, pageSize]);
};

