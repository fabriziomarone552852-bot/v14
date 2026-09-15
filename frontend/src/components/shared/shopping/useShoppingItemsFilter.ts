// src/components/shared/shopping/useShoppingItemsFilter.ts
import { useState, useMemo, useEffect } from 'react';
import type { FiltroStato } from './ShoppingActiveListHeader';
import type { ShoppingListItem } from '@/types/shopping';

export interface UseShoppingItemsFilterProps {
  items: ShoppingListItem[];
  activeListId: number | null;
  searchQuery: string;
  initialFiltroStato?: FiltroStato;
}

export function useShoppingItemsFilter({
  items,
  activeListId,
  searchQuery,
  initialFiltroStato = 'aperti',
}: UseShoppingItemsFilterProps) {
  const [filtroStato, setFiltroStato] = useState<FiltroStato>(initialFiltroStato);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    setFiltroStato(initialFiltroStato);
  }, [activeListId, initialFiltroStato]);

  // Quick Add State
  const [quickName, setQuickName] = useState('');
  const [quickQuantity, setQuickQuantity] = useState('');
  const [quickUnitId, setQuickUnitId] = useState('');
  const [quickAdding, setQuickAdding] = useState(false);

  const resetQuickAdd = () => {
    setQuickName('');
    setQuickQuantity('');
    setQuickUnitId('');
  };

  const effectiveQuery = (searchQuery || filterQuery).toLowerCase().trim();

  const filteredItems = useMemo(() => {
    let result = items;
    if (filtroStato === 'aperti') result = result.filter((item) => !item.isPurchased);
    if (filtroStato === 'completati') result = result.filter((item) => item.isPurchased);
    if (effectiveQuery) {
      result = result.filter((item) => {
        const pMatch = item.productName.toLowerCase().includes(effectiveQuery);
        const bMatch = item.brandName ? item.brandName.toLowerCase().includes(effectiveQuery) : false;
        return pMatch || bMatch;
      });
    }
    return result;
  }, [items, filtroStato, effectiveQuery]);

  return {
    filtroStato,
    setFiltroStato,
    filterQuery,
    setFilterQuery,
    filteredItems,
    quickName,
    setQuickName,
    quickQuantity,
    setQuickQuantity,
    quickUnitId,
    setQuickUnitId,
    quickAdding,
    setQuickAdding,
    resetQuickAdd,
  };
}
