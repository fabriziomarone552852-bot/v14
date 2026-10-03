// src/components/shared/shopping/ShoppingQuickCatalogTable.tsx
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

interface ShoppingQuickCatalogTableProps {
  products: ShoppingProductOption[];
  items: ShoppingListItem[];
  activeList: ShoppingListSummary | null;
  unitOptions: ConfigOption[];
  onToggleItem: (product: ShoppingProductOption, existingItem: ShoppingListItem | null) => void;
  onClose: () => void;
}

export const ShoppingQuickCatalogTable: React.FC<ShoppingQuickCatalogTableProps> = ({
  products,
  items,
  activeList,
  unitOptions: _unitOptions,
  onToggleItem,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Mappa rapida degli item presenti nella lista corrente
  // Indicizzati per productId e per nameNormalized (case-insensitive)
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

  // Helper per verificare se un prodotto è già nella lista attiva
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

  // Filtro e ordinamento alfabetico dei prodotti
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
      const comp = nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
      return sortDirection === 'asc' ? comp : -comp;
    });
  }, [products, searchQuery, sortDirection]);

  // Conteggio articoli selezionati
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
    <div className="flex h-full min-h-0 flex-col justify-between select-none">
      {/* 1. HEADER DELLA VISTA INSERIMENTO RAPIDO */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <ShoppingIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-gray-800 truncate">
                  Inserimento Rapido Catalogo
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-700 border border-blue-200/80">
                  Lista: {activeList?.name || 'Senza lista'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                Spunta gli articoli per aggiungerli o rimuoverli istantaneamente dalla spesa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
            title="Termina e torna alla lista della spesa"
          >
            <CheckIcon className="w-4 h-4" />
            <span>Fatto</span>
          </button>
        </div>

        {/* Barra Ricerca + Contatore Badge */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per nome articolo o marca..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-md transition cursor-pointer"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-600 whitespace-nowrap shrink-0 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              In lista: <strong className="text-gray-900 font-bold">{inListCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. TABELLA ARTICOLI CATALOGO */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden mt-3 rounded-xl border border-slate-200/90 bg-white">
        {/* Intestazione Colonne Tabella */}
        <div className="grid grid-cols-[38px_1fr_120px_90px_110px] items-center gap-2 px-3 py-2 bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider shrink-0">
          <div className="text-center">#</div>
          <button
            type="button"
            onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="flex items-center gap-1 text-left hover:text-blue-600 transition cursor-pointer"
          >
            <span>Articolo</span>
            <span className={`text-[10px] font-mono transition-transform duration-200 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          <div>Marca</div>
          <div>Unità</div>
          <div className="text-right">Ultimo Prezzo</div>
        </div>

        {/* Corpo Scrollabile Tabella */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-2">
                <TagIcon className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-gray-700">Nessun articolo trovato</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {searchQuery
                  ? `Nessun risultato corrispondente a "${searchQuery}"`
                  : 'Nessun articolo registrato nel catalogo.'}
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
                  className={`grid grid-cols-[38px_1fr_120px_90px_110px] items-center gap-2 px-3 py-2 transition-colors cursor-pointer text-xs ${
                    isChecked
                      ? 'bg-blue-50/60 hover:bg-blue-50/90 font-medium'
                      : 'hover:bg-slate-50/80 text-gray-700'
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className="flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleItem(product, existingItem)}
                      className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition"
                    />
                  </div>

                  {/* Nome Articolo */}
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className={`truncate ${
                        isChecked ? 'font-bold text-blue-900' : 'text-gray-800'
                      }`}
                    >
                      {displayName}
                    </span>
                    {isChecked && (
                      <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 border border-blue-200">
                        In lista
                      </span>
                    )}
                  </div>

                  {/* Marca */}
                  <div className="truncate text-[11px] text-gray-500">
                    {product.brandName || '-'}
                  </div>

                  {/* Unità di misura */}
                  <div className="truncate text-[11px] text-gray-500">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/80 text-slate-600 text-[10px] font-medium">
                      {unitName}
                    </span>
                  </div>

                  {/* Ultimo Prezzo */}
                  <div className="text-right text-[11px] text-gray-600 truncate">
                    {lastPrice ? (
                      <span className="font-semibold text-emerald-700">{lastPrice}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. FOOTER FISSO CON PULSANTE DI RITORNO */}
      <div className="pt-3 border-t border-slate-200/80 shrink-0 flex items-center justify-between gap-3 mt-3">
        <span className="text-[11px] text-gray-500">
          Totale articoli catalogo: <strong className="text-gray-700">{products.length}</strong>
        </span>

        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <CheckIcon className="w-4 h-4" />
          <span>Fatto / Torna alla lista</span>
        </button>
      </div>
    </div>
  );
};

export default ShoppingQuickCatalogTable;
