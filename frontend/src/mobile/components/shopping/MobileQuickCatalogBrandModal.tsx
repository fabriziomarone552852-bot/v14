// src/mobile/components/shopping/MobileQuickCatalogBrandModal.tsx
import React from 'react';
import {
  TagIcon,
  CloseIcon,
  CheckCircleIcon,
} from '@/components/shared/utils/Icons';
import type {
  ShoppingProductOption,
  ShoppingProductBrandLink,
  ShoppingListItem,
} from '@/types/shopping';
import { parseBrandPreference } from '@/utils/shoppingBrandPreference';

interface MobileQuickCatalogBrandModalProps {
  product: ShoppingProductOption | null;
  isOpen: boolean;
  onClose: () => void;
  getExistingItemForBrand: (
    product: ShoppingProductOption,
    brandId: number | null,
    brandName?: string | null
  ) => ShoppingListItem | null;
  onToggleItem: (
    product: ShoppingProductOption,
    existingItem: ShoppingListItem | null,
    targetBrand?: ShoppingProductBrandLink | null
  ) => void;
}

export const MobileQuickCatalogBrandModal: React.FC<MobileQuickCatalogBrandModalProps> = ({
  product,
  isOpen,
  onClose,
  getExistingItemForBrand,
  onToggleItem,
}) => {
  if (!isOpen || !product) return null;

  const displayName = product.displayName || product.nameNormalized || 'Articolo';
  const brands = product.productBrands || [];

  const handleSelectOption = (brandLink: ShoppingProductBrandLink | null) => {
    const existing = getExistingItemForBrand(
      product,
      brandLink ? brandLink.brandId : null,
      brandLink?.brand?.nameNormalized
    );
    onToggleItem(product, existing, brandLink);
    onClose();
  };

  const genericItem = getExistingItemForBrand(product, null);
  const isGenericChecked = Boolean(genericItem);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modale */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <TagIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {displayName}
              </h3>
              <p className="text-[11px] text-gray-500 truncate">
                Scegli la marca da inserire in lista
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Elenco Verticale Opzioni Touch */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {/* Opzione 1: Generico / Senza marca specifica */}
          <div
            onClick={() => handleSelectOption(null)}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
              isGenericChecked
                ? 'bg-blue-50/90 border-blue-500 shadow-2xs'
                : 'bg-white border-gray-200/90 hover:bg-slate-50 active:bg-slate-100'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-semibold ${isGenericChecked ? 'text-blue-950 font-bold' : 'text-gray-800'}`}>
                  Senza marca specifica
                </span>
                <span className="text-[10px] text-gray-400 font-normal">(Generico)</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Aggiunge l&apos;articolo senza vincolo di produttore
              </p>
              {product.lastPurchasePrice != null && Number(product.lastPurchasePrice) > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1 truncate">
                  <span className="font-bold text-emerald-700">
                    {Number(product.lastPurchasePrice).toLocaleString('it-IT', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                  {product.lastSupplierName && (
                    <>
                      <span>•</span>
                      <span className="text-gray-600 truncate">🏪 {product.lastSupplierName}</span>
                    </>
                  )}
                  {product.lastPurchaseDate && (
                    <>
                      <span>•</span>
                      <span className="text-slate-400 text-[9px]">
                        {new Date(product.lastPurchaseDate).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0 ml-2">
              {isGenericChecked ? (
                <div className="flex items-center gap-1 text-blue-600 font-bold text-xs">
                  <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                  <span>In lista</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400 font-medium">Seleziona</span>
              )}
            </div>
          </div>

          {/* Opzioni 2..N: Ciascun Brand Registrato */}
          {brands.map((pb) => {
            const brandItem = getExistingItemForBrand(product, pb.brandId, pb.brand?.nameNormalized);
            const isChecked = Boolean(brandItem);
            const brandName = pb.brand?.nameNormalized || 'Marca';
            const preference = parseBrandPreference(pb.notes);
            const lastPrice =
              pb.lastPrice != null && Number(pb.lastPrice) > 0
                ? Number(pb.lastPrice).toLocaleString('it-IT', {
                    style: 'currency',
                    currency: 'EUR',
                  })
                : null;
            const supplier = pb.lastSupplierName;
            const lastDate = pb.lastPurchaseDate
              ? new Date(pb.lastPurchaseDate).toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: 'short',
                })
              : null;

            return (
              <div
                key={pb.id || pb.brandId}
                onClick={() => handleSelectOption(pb)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-blue-50/90 border-blue-500 shadow-2xs'
                    : 'bg-white border-gray-200/90 hover:bg-slate-50 active:bg-slate-100'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs font-semibold ${isChecked ? 'text-blue-950 font-bold' : 'text-gray-900'}`}>
                      {brandName}
                    </span>

                    {preference?.sentiment === 'positive' && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        👍 {preference.comment ? preference.comment : 'Consigliato'}
                      </span>
                    )}

                    {preference?.sentiment === 'negative' && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        👎 {preference.comment ? preference.comment : 'Da evitare'}
                      </span>
                    )}
                  </div>

                  {/* Prezzo e Fornitore */}
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1 truncate">
                    {lastPrice ? (
                      <span className="font-bold text-emerald-700">{lastPrice}</span>
                    ) : (
                      <span className="text-gray-400">Nessun prezzo</span>
                    )}

                    {supplier && (
                      <>
                        <span>•</span>
                        <span className="text-gray-600 truncate">🏪 {supplier}</span>
                      </>
                    )}

                    {lastDate && (
                      <>
                        <span>•</span>
                        <span className="text-gray-400">{lastDate}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {isChecked ? (
                    <div className="flex items-center gap-1 text-blue-600 font-bold text-xs">
                      <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                      <span>In lista</span>
                    </div>
                  ) : (
                    <span className="text-xs text-blue-600 font-semibold">Scegli</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Modale */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 shrink-0 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-200/80 active:bg-slate-300 text-gray-700 text-xs font-semibold transition"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileQuickCatalogBrandModal;
