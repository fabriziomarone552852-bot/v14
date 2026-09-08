// src/mobile/components/shopping/MobileShoppingOmniSearch.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type {
  ShoppingGroupSummary,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingListItem,
} from '@/types/shopping';
import {
  SearchIcon,
  CloseIcon,
  ShoppingIcon,
  UsersIcon,
  TagIcon,
  CheckCircleIcon,
} from '@/components/shared/utils/Icons';

interface MobileShoppingOmniSearchProps {
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
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const cleanQuery = query.toLowerCase().trim();

  // Filtraggio Gruppi
  const matchedGroups = useMemo(() => {
    if (!cleanQuery) return [];
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(cleanQuery) ||
        (g.description && g.description.toLowerCase().includes(cleanQuery))
    ).slice(0, 5);
  }, [groups, cleanQuery]);

  // Filtraggio Liste
  const matchedLists = useMemo(() => {
    if (!cleanQuery) return [];
    return lists.filter(
      (l) =>
        l.name.toLowerCase().includes(cleanQuery) ||
        (l.groupName && l.groupName.toLowerCase().includes(cleanQuery)) ||
        (l.description && l.description.toLowerCase().includes(cleanQuery))
    ).slice(0, 6);
  }, [lists, cleanQuery]);

  // Raccogli tutti gli articoli noti (dalle liste o dalla lista corrente)
  const allKnownItems = useMemo(() => {
    const fromLists = lists.flatMap((l) =>
      (l.items || []).map((it) => ({
        ...it,
        shoppingListId: it.shoppingListId || l.id,
        listName: it.listName || l.name,
      }))
    );
    if (fromLists.length > 0) return fromLists;
    return currentItems.map((it) => ({
      ...it,
      shoppingListId: it.shoppingListId || (activeListId ?? 0),
    }));
  }, [lists, currentItems, activeListId]);

  // Filtraggio Articoli nelle Liste
  const matchedItemsInLists = useMemo(() => {
    if (!cleanQuery) return [];
    return allKnownItems.filter(
      (item) =>
        item.productName.toLowerCase().includes(cleanQuery) ||
        (item.brandName && item.brandName.toLowerCase().includes(cleanQuery))
    ).slice(0, 8);
  }, [allKnownItems, cleanQuery]);

  // Filtraggio Prodotti Catalogo
  const matchedProducts = useMemo(() => {
    if (!cleanQuery) return [];
    return products.filter(
      (p) =>
        p.displayName.toLowerCase().includes(cleanQuery) ||
        p.nameNormalized.toLowerCase().includes(cleanQuery) ||
        (p.brandName && p.brandName.toLowerCase().includes(cleanQuery))
    ).slice(0, 10);
  }, [products, cleanQuery]);

  if (!isOpen) return null;

  const totalResults =
    matchedGroups.length +
    matchedLists.length +
    matchedProducts.length +
    matchedItemsInLists.length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900/60 backdrop-blur-xs animate-fadeIn">
      {/* Contenitore Search Modal */}
      <div className="w-full max-w-lg mx-auto bg-white h-full sm:h-auto sm:max-h-[85vh] sm:mt-10 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Search Header Bar (con lente cliccabile per chiudere) */}
        <div className="p-3 bg-white border-b border-gray-200 flex items-center gap-2 shrink-0">
          <div className="relative flex-1 flex items-center">
            <button
              type="button"
              onClick={onClose}
              className="absolute left-2.5 p-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 active:scale-95 transition-all cursor-pointer"
              title="Chiudi ricerca"
              aria-label="Chiudi ricerca"
            >
              <SearchIcon className="w-5 h-5" />
            </button>
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca prodotti, liste o gruppi..."
              className="w-full pl-11 pr-9 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 focus:outline-none cursor-pointer"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Body Content */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-4">
          {!cleanQuery ? (
            <div className="py-12 text-center text-gray-400 flex flex-col items-center justify-center">
              <SearchIcon className="w-12 h-12 text-gray-300 mb-2 stroke-1" />
              <p className="text-sm font-medium text-gray-500">
                Digita per cercare tra gruppi, liste o catalogo prodotti
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Esempio: "Latte", "Famiglia", "Spesa Settimanale"
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-gray-400 flex flex-col items-center justify-center">
              <p className="text-sm font-semibold text-gray-600">Nessun risultato per "{query}"</p>
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
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <TagIcon className="w-4 h-4" />
                  <span>Aggiungi a Catalogo / Prezzo Rapido</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* 1. SEZIONE GRUPPI SPESA (Clic apre il dettaglio del gruppo) */}
              {matchedGroups.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-1 mb-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                    <UsersIcon className="w-3.5 h-3.5" />
                    <span>Gruppi Spesa ({matchedGroups.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedGroups.map((group) => {
                      const groupLists = lists.filter((l) => l.groupId === group.id);
                      return (
                        <div
                          key={group.id}
                          onClick={() => {
                            onOpenGroupDetail?.(group);
                            onClose();
                          }}
                          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all shadow-2xs cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xl">{group.icon || '👥'}</span>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-gray-800 truncate">{group.name}</h4>
                              <span className="text-xs text-gray-400">
                                {groupLists.length} {groupLists.length === 1 ? 'lista' : 'liste'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. SEZIONE LISTE SPESA */}
              {matchedLists.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-1 mb-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    <ShoppingIcon className="w-3.5 h-3.5" />
                    <span>Liste Spesa ({matchedLists.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedLists.map((list) => {
                      const isCurrent = list.id === activeListId;
                      return (
                        <button
                          key={list.id}
                          type="button"
                          onClick={() => {
                            onSelectList(list.id);
                            onClose();
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                              : 'bg-white border-gray-200 hover:border-emerald-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs shrink-0">
                              📋
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-sm font-bold text-gray-800 truncate">{list.name}</h4>
                                {list.groupName && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 shrink-0">
                                    {list.groupName}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">
                                {list.openItemsCount} da comprare • {list.purchasedItemsCount} presi
                              </span>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="text-xs font-bold text-emerald-600 px-2 py-0.5 bg-emerald-100 rounded-md shrink-0 ml-2">
                              Attiva
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. SEZIONE ARTICOLI NELLE LISTE (Clic apre la lista corrispondente) */}
              {matchedItemsInLists.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-1 mb-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    <span>Articoli nelle Liste ({matchedItemsInLists.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedItemsInLists.map((item) => (
                      <div
                        key={`${item.shoppingListId}-${item.id}`}
                        onClick={() => {
                          if (item.shoppingListId) {
                            onSelectList(item.shoppingListId);
                          }
                          onClose();
                        }}
                        className="p-2.5 bg-white border border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 rounded-xl flex items-center justify-between transition-all shadow-2xs cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-800 truncate">{item.productName}</h4>
                            {item.isPurchased && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 shrink-0">
                                Acquistato
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 block truncate mt-0.5">
                            {item.quantity ? `Q.tà: ${item.quantity} ${item.unitCodeName || ''} ` : ''}
                            {item.brandName ? `• ${item.brandName} ` : ''}
                            {item.listName ? `• Lista: ${item.listName}` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. SEZIONE CATALOGO PRODOTTI MASTER (+ Aggiungi alla lista attiva) */}
              {matchedProducts.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-1 mb-1.5 text-xs font-bold uppercase tracking-wider text-purple-700">
                    <TagIcon className="w-3.5 h-3.5" />
                    <span>Catalogo Prodotti ({matchedProducts.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-gray-800 truncate">
                            {product.displayName}
                          </h4>
                          <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                            {product.brandName && <span>{product.brandName}</span>}
                            {product.lastPurchasePrice != null && (
                              <span className="text-emerald-600 font-semibold">
                                Ultimo: {product.lastPurchasePrice.toFixed(2)} €
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center shrink-0">
                          {onQuickAddProduct && (
                            <button
                              type="button"
                              onClick={() => {
                                onQuickAddProduct(product.displayName);
                                onClose();
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-xl border border-blue-200 transition-all cursor-pointer shrink-0"
                              title="Aggiungi alla lista attiva"
                            >
                              + Aggiungi alla lista attiva
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileShoppingOmniSearch;
