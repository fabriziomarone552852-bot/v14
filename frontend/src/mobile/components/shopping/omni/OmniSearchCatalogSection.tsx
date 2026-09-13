// src/mobile/components/shopping/omni/OmniSearchCatalogSection.tsx
import React from 'react';
import { TagIcon } from '@/components/shared/utils/Icons';
import type { ShoppingProductOption } from '@/types/shopping';

export interface OmniSearchCatalogSectionProps {
  products: ShoppingProductOption[];
  onQuickAddProduct?: (productName: string) => void;
  onClose: () => void;
}

export const OmniSearchCatalogSection: React.FC<OmniSearchCatalogSectionProps> = ({
  products,
  onQuickAddProduct,
  onClose,
}) => {
  if (products.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 mb-1.5 text-xs font-bold uppercase tracking-wider text-purple-700">
        <TagIcon className="w-3.5 h-3.5" />
        <span>Catalogo Prodotti ({products.length})</span>
      </div>
      <div className="space-y-1.5">
        {products.map((product) => (
          <div
            key={product.id}
            className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
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
                  + Aggiungi
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
