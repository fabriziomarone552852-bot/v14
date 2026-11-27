// src/mobile/components/shopping/MobileShoppingQuickCatalog.tsx
import React from 'react';
import {
  TagIcon,
  SearchIcon,
  CheckIcon,
  ShoppingIcon,
  CloseIcon,
} from '@/components/shared/utils/Icons';
import type {
  ShoppingProductOption,
  ShoppingProductBrandLink,
  ShoppingListItem,
  ShoppingListSummary,
  ConfigOption,
} from '@/types/shopping';
import { useShoppingQuickCatalogLogic } from '@/components/shared/shopping/useShoppingQuickCatalogLogic';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';
import { MobileQuickCatalogBrandModal } from './MobileQuickCatalogBrandModal';

interface MobileShoppingQuickCatalogProps {
  products: ShoppingProductOption[];
  items: ShoppingListItem[];
  activeList: ShoppingListSummary | null;
  unitOptions?: ConfigOption[];
  onToggleItem: (
    product: ShoppingProductOption,
    existingItem: ShoppingListItem | null,
    targetBrand?: ShoppingProductBrandLink | null
  ) => void;
  onClose: () => void;
}

export const MobileShoppingQuickCatalog: React.FC<MobileShoppingQuickCatalogProps> = ({
  products,
  items,
  activeList,
  onToggleItem,
  onClose,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    clearSearch,
    getExistingItem,
    getExistingItemForBrand,
    mobileModalProduct,
    setMobileModalProduct,
    filteredProducts,
    inListCount,
  } = useShoppingQuickCatalogLogic({
    products,
    items,
  });

  const { isScrolling, handleScroll } = useFadeScrollbar();

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
                Tocca un articolo per inserirlo o confrontare i marchi
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
                onClick={clearSearch}
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
      <div
        onScroll={handleScroll}
        className={`flex-1 min-h-0 overflow-y-auto modal-scrollbar pt-2 space-y-1.5 ${
          isScrolling ? 'is-scrolling' : ''
        }`}
      >
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
            const brandsCount = product.productBrands?.length ?? 0;
            const hasMultipleBrands = brandsCount > 1;
            const singleBrand = brandsCount === 1 ? product.productBrands![0] : null;

            // Ultimo prezzo per brand singolo o prodotto
            const rawLastPrice = singleBrand?.lastPrice ?? product.lastPurchasePrice;
            const lastPrice =
              rawLastPrice != null && Number(rawLastPrice) > 0
                ? Number(rawLastPrice).toLocaleString('it-IT', {
                    style: 'currency',
                    currency: 'EUR',
                  })
                : null;

            // Prezzo indicativo minimo se ha più marchi
            const brandPrices = hasMultipleBrands
              ? product.productBrands!
                  .map((pb) => (pb.lastPrice != null ? Number(pb.lastPrice) : null))
                  .filter((p): p is number => p !== null && p > 0)
              : [];
            const minBrandPrice = brandPrices.length > 0 ? Math.min(...brandPrices) : null;
            const minPriceFormatted = minBrandPrice
              ? `da ${minBrandPrice.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}`
              : lastPrice;

            const handleRowClick = () => {
              if (hasMultipleBrands) {
                setMobileModalProduct(product);
              } else if (singleBrand) {
                onToggleItem(product, existingItem, singleBrand);
              } else {
                onToggleItem(product, existingItem, null);
              }
            };

            const handleCheckboxClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (existingItem) {
                onToggleItem(product, existingItem, null);
              } else if (hasMultipleBrands) {
                setMobileModalProduct(product);
              } else if (singleBrand) {
                onToggleItem(product, null, singleBrand);
              } else {
                onToggleItem(product, null, null);
              }
            };

            const detailItems: Array<{ key: string; node: React.ReactNode }> = [];

            if (hasMultipleBrands) {
              detailItems.push({
                key: 'brands',
                node: (
                  <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/80">
                    🏷️ {brandsCount} marche ▾
                  </span>
                ),
              });
            } else if (singleBrand?.brand?.nameNormalized) {
              detailItems.push({
                key: 'brand',
                node: (
                  <span className="truncate font-medium text-gray-600">
                    {singleBrand.brand.nameNormalized}
                  </span>
                ),
              });
            } else if (product.brandName) {
              detailItems.push({
                key: 'brand',
                node: (
                  <span className="truncate font-medium text-gray-600">
                    {product.brandName}
                  </span>
                ),
              });
            }

            const displayPrice = hasMultipleBrands ? minPriceFormatted : lastPrice;
            if (displayPrice) {
              detailItems.push({
                key: 'price',
                node: (
                  <span className="font-bold text-emerald-700">
                    {displayPrice}
                  </span>
                ),
              });
            }

            if (singleBrand?.lastSupplierName) {
              detailItems.push({
                key: 'supplier',
                node: (
                  <span className="truncate text-slate-500">
                    🏪 {singleBrand.lastSupplierName}
                  </span>
                ),
              });
            }

            return (
              <div
                key={product.id || product.nameNormalized}
                onClick={handleRowClick}
                className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-blue-50/80 border-blue-300 shadow-2xs'
                    : 'bg-white border-gray-200/80 hover:bg-slate-50 active:bg-slate-100'
                }`}
              >
                {/* Checkbox Touch Target */}
                <div
                  className="flex items-center justify-center shrink-0"
                  onClick={handleCheckboxClick}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
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

                  {/* Dettagli secondari (Marca / Badge Opzioni • Ultimo Prezzo • Fornitore) */}
                  {detailItems.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5 truncate">
                      {detailItems.map((detail, idx) => (
                        <React.Fragment key={detail.key}>
                          {idx > 0 && <span>•</span>}
                          {detail.node}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
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
          className="font-bold text-blue-600 hover:text-blue-700 py-0.5 cursor-pointer"
        >
          ✓ Torna alla lista
        </button>
      </div>

      {/* 4. MODALE SELEZIONE MARCHIO TOUCH-FRIENDLY */}
      <MobileQuickCatalogBrandModal
        product={mobileModalProduct}
        isOpen={Boolean(mobileModalProduct)}
        onClose={() => setMobileModalProduct(null)}
        getExistingItemForBrand={getExistingItemForBrand}
        onToggleItem={onToggleItem}
      />
    </div>
  );
};

export default MobileShoppingQuickCatalog;
