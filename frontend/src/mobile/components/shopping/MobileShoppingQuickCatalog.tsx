// src/mobile/components/shopping/MobileShoppingQuickCatalog.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  TagIcon,
  SearchIcon,
  CheckIcon,
  ShoppingIcon,
  CloseIcon,
} from '@/components/shared/utils/Icons';
import type {
  ShoppingProductOption,
  ShoppingListItem,
  ShoppingListSummary,
  ConfigOption,
} from '@/types/shopping';

interface MobileShoppingQuickCatalogProps {
  products: ShoppingProductOption[];
  items: ShoppingListItem[];
  activeList: ShoppingListSummary | null;
  unitOptions?: ConfigOption[];
  onToggleItem: (product: ShoppingProductOption, existingItem: ShoppingListItem | null) => void;
  onClose: () => void;
}

export const MobileShoppingQuickCatalog: React.FC<MobileShoppingQuickCatalogProps> = ({
  products,
  items,
  activeList,
  unitOptions: _unitOptions,
  onToggleItem,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mappa rapida degli item presenti nella lista corrente
  const itemsInListMap = useMemo(() => {
    const map = new Map<string, ShoppingListItem>();
    for (const it of items) {
      if (it.productId && it.productId > 0) {
        map.set(`id:${it.productId}`, it);
      }
      const norm = (it.nameNormalized || it.productName || '').trim().toLowerCase();
      if (norm) {
        map.set(`name:${norm}`, it);
      }
    }
    return map;
  }, [items]);

  // Helper per trovare se l'articolo è già presente
  const getExistingItem = useCallback(
    (product: ShoppingProductOption): ShoppingListItem | null => {
      if (product.id && itemsInListMap.has(`id:${product.id}`)) {
        return itemsInListMap.get(`id:${product.id}`)!;
      }
      const norm = (product.nameNormalized || product.displayName || '').trim().toLowerCase();
      if (norm && itemsInListMap.has(`name:${norm}`)) {
        return itemsInListMap.get(`name:${norm}`)!;
      }
      return null;
    },
    [itemsInListMap]
  );

  // Filtro e ordinamento alfabetico A-Z
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = products;

    if (q) {
      list = list.filter((p) => {
        const name = (p.displayName || p.nameNormalized || '').toLowerCase();
        const brand = (p.brandName || '').toLowerCase();
        return name.includes(q) || brand.includes(q);
      });
    }

    return [...list].sort((a, b) => {
      const nameA = (a.displayName || a.nameNormalized || '').trim();
      const nameB = (b.displayName || b.nameNormalized || '').trim();
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
  }, [products, searchQuery]);

  // Conteggio articoli presenti in lista
  const inListCount = useMemo(() => {
    let count = 0;
    for (const p of products) {
      if (getExistingItem(p)) {
        count++;
      }
    }
    return count;
  }, [products, getExistingItem]);

  return (
    <div className="flex-1 min-h-0 w-full bg-white border border-gray-200/90 rounded-2xl shadow-2xs p-2.5 flex flex-col justify-between overflow-hidden animate-fadeIn select-none">
      {/* 1. HEADER COMPATTO CON NOME LISTA E TASTO FATTO */}
      <div className="pb-2 border-b border-gray-200/80 shrink-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <ShoppingIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs font-bold text-gray-900 truncate">
                  Inserimento Rapido
                </h3>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-blue-100/80 text-blue-700 border border-blue-200/80 truncate max-w-[120px]">
                  {activeList?.name || 'Senza lista'}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 truncate">
                Tocca un articolo per inserirlo o toglierlo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 active:bg-blue-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 shrink-0 cursor-pointer"
          >
            <CheckIcon className="w-4 h-4" />
            <span>Fatto</span>
          </button>
        </div>

        {/* Barra di ricerca + Badge conteggio */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca articolo o marca..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-md"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-semibold text-slate-600 whitespace-nowrap shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>
              In lista: <strong className="text-gray-900">{inListCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. LISTA ARTICOLI CATALOGO A-Z */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pt-2 space-y-1.5">
        {filteredProducts.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-2">
              <TagIcon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-gray-700">Nessun articolo trovato</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {searchQuery
                ? `Nessun risultato per "${searchQuery}"`
                : 'Nessun articolo nel catalogo.'}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const existingItem = getExistingItem(product);
            const isChecked = Boolean(existingItem);
            const displayName = product.displayName || product.nameNormalized || 'Articolo';
            const unitName = product.defaultUnitCodeName || 'pz';
            const lastPrice =
              product.lastPurchasePrice != null && Number(product.lastPurchasePrice) > 0
                ? Number(product.lastPurchasePrice).toLocaleString('it-IT', {
                    style: 'currency',
                    currency: 'EUR',
                  })
                : null;

            return (
              <div
                key={product.id || product.nameNormalized}
                onClick={() => onToggleItem(product, existingItem)}
                className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-blue-50/80 border-blue-300 shadow-2xs'
                    : 'bg-white border-gray-200/80 hover:bg-slate-50 active:bg-slate-100'
                }`}
              >
                {/* Checkbox Touch Target */}
                <div
                  className="flex items-center justify-center shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleItem(product, existingItem)}
                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                  />
                </div>

                {/* Info Articolo (Nome + Dettagli Riga 2) */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p
                      className={`text-xs truncate ${
                        isChecked ? 'font-bold text-blue-950' : 'font-semibold text-gray-800'
                      }`}
                    >
                      {displayName}
                    </p>
                    {isChecked && (
                      <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 border border-blue-200">
                        In lista
                      </span>
                    )}
                  </div>

                  {/* Dettagli secondari (Marca • Unità • Ultimo Prezzo) */}
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5 truncate">
                    {product.brandName && (
                      <span className="truncate font-medium text-gray-600">
                        {product.brandName}
                      </span>
                    )}
                    {product.brandName && <span>•</span>}
                    <span className="px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                      {unitName}
                    </span>
                    {lastPrice && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-emerald-700">{lastPrice}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. MINI FOOTER */}
      <div className="pt-2 border-t border-gray-200/70 shrink-0 flex items-center justify-between text-[10px] text-gray-500 mt-1">
        <span>Articoli in catalogo: {products.length}</span>
        <button
          type="button"
          onClick={onClose}
          className="font-bold text-blue-600 hover:text-blue-700 py-0.5"
        >
          ✓ Torna alla lista
        </button>
      </div>
    </div>
  );
};

export default MobileShoppingQuickCatalog;
