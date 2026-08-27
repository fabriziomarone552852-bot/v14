// src/hooks/useBrandArchiveData.ts
import { useMemo } from 'react';
import type { ShoppingSupplierOption, ItemBatchRecord } from '@/types/shopping';
import { paginate } from '@/utils/paginationUtils';
import type { SupplierSortDirection } from './useSupplierArchiveData';

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
      let comparison: number;
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
    const { paginatedItems, totalPages } = paginate(sorted, currentPage, pageSize);

    return {
      enrichedBrands: enrichedList,
      filteredBrands: sorted,
      paginatedBrands: paginatedItems,
      totalBrands,
      totalPages,
    };
  }, [brands, batches, filters, sortField, sortDirection, currentPage, pageSize]);
};

export default useBrandArchiveData;
