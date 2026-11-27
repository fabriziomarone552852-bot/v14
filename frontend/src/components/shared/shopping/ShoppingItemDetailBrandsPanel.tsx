// src/components/shared/shopping/ShoppingItemDetailBrandsPanel.tsx
import React from 'react';
import type {
  CommunityPriceRecord,
  ItemBatchRecord,
  ShoppingListItem,
} from '@/types/shopping';
import { TagIcon } from '@/components/shared/utils/Icons';
import { useItemRelatedBrands, type RelatedBrandInfo } from './item/useItemRelatedBrands';
import { ShoppingItemBrandsList } from './ShoppingItemBrandsList';

export type { RelatedBrandInfo };

export interface ShoppingItemDetailBrandsPanelProps {
  item: ShoppingListItem;
  personalBatches?: ItemBatchRecord[];
  communityPrices?: CommunityPriceRecord[];
  className?: string;
}

export const ShoppingItemDetailBrandsPanel: React.FC<ShoppingItemDetailBrandsPanelProps> = ({
  item,
  personalBatches = [],
  communityPrices = [],
  className = '',
}) => {
  const {
    relatedBrands,
    editingBrandKey,
    draftSentiment,
    setDraftSentiment,
    draftComment,
    setDraftComment,
    handleOpenEditBrand,
    handleCancelEdit,
    handleSaveEdit,
  } = useItemRelatedBrands({
    item,
    personalBatches,
    communityPrices,
  });

  return (
    <div
      className={`pointer-events-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex flex-col space-y-3 ${className}`}
    >
      {/* Intestazione Finestra Brand */}
      <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <TagIcon className="w-4 h-4 text-blue-600 shrink-0" />
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider truncate">
            Marchi & Giudizi
          </h3>
        </div>
        {relatedBrands.length > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            {relatedBrands.length}
          </span>
        )}
      </div>

      {/* Elenco Brand Correlati */}
      <div className="flex-1 overflow-y-auto modal-scrollbar min-h-0">
        <ShoppingItemBrandsList
          relatedBrands={relatedBrands}
          editingBrandKey={editingBrandKey}
          draftSentiment={draftSentiment}
          setDraftSentiment={setDraftSentiment}
          draftComment={draftComment}
          setDraftComment={setDraftComment}
          onOpenEdit={handleOpenEditBrand}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
        />
      </div>
    </div>
  );
};

export default ShoppingItemDetailBrandsPanel;
