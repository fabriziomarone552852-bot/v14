// src/mobile/components/shopping/MobileShoppingOmniSearch.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import type {
  ShoppingGroupSummary,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingListItem,
} from '@/types/shopping';
import {
  SearchIcon,
  CloseIcon,
  TagIcon,
  BackIcon,
} from '@/components/shared/utils/Icons';
import {
  OmniSearchGroupsSection,
  OmniSearchListsSection,
  OmniSearchItemsInListsSection,
  OmniSearchCatalogSection,
  useMobileShoppingOmniSearchLogic,
} from './omni';

export interface MobileShoppingOmniSearchProps {
  isOpen: boolean;
  onClose: () => void;
  groups: ShoppingGroupSummary[];
  lists: ShoppingListSummary[];
  products: ShoppingProductOption[];
  currentItems?: ShoppingListItem[];
  activeListId: number | null;
  onSelectList: (listId: number) => void;
  onOpenGroupDetail?: (group: ShoppingGroupSummary) => void;
  onQuickAddProduct?: (productName: string) => void;
  onOpenQuickPrice?: (productName?: string) => void;
}

export const MobileShoppingOmniSearch: React.FC<MobileShoppingOmniSearchProps> = ({
  isOpen,
  onClose,
  groups,
  lists,
  products,
  currentItems = [],
  activeListId,
  onSelectList,
  onOpenGroupDetail,
  onQuickAddProduct,
  onOpenQuickPrice,
}) => {
  const {
    query,
    setQuery,
    inputRef,
    cleanQuery,
    matchedGroups,
    matchedLists,
    matchedItemsInLists,
    matchedProducts,
    totalResults,
  } = useMobileShoppingOmniSearchLogic({
    isOpen,
    onClose,
    groups,
    lists,
    products,
    currentItems,
    activeListId,
  });

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none">
      {/* 1. HEADER RICERCA A TUTTO SCHERMO */}
      <div className="px-3 py-3 border-b border-gray-200 bg-gray-50/95 flex items-center gap-2.5 shrink-0 pt-[max(env(safe-area-inset-top,0px),12px)]">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-200 active:scale-95 transition-all cursor-pointer shrink-0"
          title="Chiudi ricerca"
          aria-label="Chiudi ricerca"
        >
          <BackIcon className="w-5 h-5" />
        </button>

        <div className="relative flex-1 flex items-center">
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca prodotti, liste o gruppi..."
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-2xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none cursor-pointer"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. CORPO RISULTATI CON SCROLL FLUIDO */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-4">
        {!cleanQuery ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <SearchIcon className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-gray-700">
              Cerca nel tuo inventario della spesa
            </p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Digita per trovare rapidamente gruppi, liste o prodotti a catalogo.
            </p>
          </div>
        ) : totalResults === 0 ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center">
            <p className="text-sm font-bold text-gray-700">Nessun risultato per &quot;{query}&quot;</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Vuoi registrare un nuovo prezzo o aggiungerlo al catalogo?
            </p>
            {onOpenQuickPrice && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenQuickPrice(query);
                }}
                className="px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <TagIcon className="w-4 h-4" />
                <span>Aggiungi a Catalogo / Prezzo Rapido</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <OmniSearchGroupsSection
              groups={matchedGroups}
              lists={lists}
              onOpenGroupDetail={onOpenGroupDetail}
              onClose={onClose}
            />

            <OmniSearchListsSection
              lists={matchedLists}
              activeListId={activeListId}
              onSelectList={onSelectList}
              onClose={onClose}
            />

            <OmniSearchItemsInListsSection
              items={matchedItemsInLists}
              onSelectList={onSelectList}
              onClose={onClose}
            />

            <OmniSearchCatalogSection
              products={matchedProducts}
              onQuickAddProduct={onQuickAddProduct}
              onClose={onClose}
            />
          </>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileShoppingOmniSearch;
