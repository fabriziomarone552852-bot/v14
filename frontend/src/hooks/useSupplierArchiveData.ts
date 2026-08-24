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
