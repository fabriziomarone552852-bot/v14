// src/mobile/components/modals/shopping/MobileShoppingItemInsightsTabs.tsx
import React, { useEffect, useState } from 'react';
import type {
  CommunityPriceRecord,
  ItemBatchRecord,
  ShoppingListItem,
} from '@/types/shopping';
import { ShoppingIcon, TagIcon } from '@/components/shared/utils/Icons';
import { ShoppingItemPriceHistoryPanel } from '@/components/shared/shopping/ShoppingItemPriceHistoryPanel';
import type { PriceStatsData } from '@/components/shared/shopping/ShoppingItemPriceAnalysisCard';
import { ShoppingItemBrandsList } from '@/components/shared/shopping/ShoppingItemBrandsList';
import { useItemRelatedBrands } from '@/components/shared/shopping/item/useItemRelatedBrands';

export type MobileItemInsightTab = 'prices' | 'brands';

export interface MobileShoppingItemInsightsTabsProps {
  item: ShoppingListItem;
  view: 'personal' | 'community';
  onViewChange: (view: 'personal' | 'community') => void;
  personalBatches: ItemBatchRecord[];
  communityPrices: CommunityPriceRecord[];
  isLoadingHistory: boolean;
  currentStats?: PriceStatsData | null;
}

export const MobileShoppingItemInsightsTabs: React.FC<MobileShoppingItemInsightsTabsProps> = ({
  item,
  view,
  onViewChange,
  personalBatches,
  communityPrices,
  isLoadingHistory,
  currentStats,
}) => {
  const [activeTab, setActiveTab] = useState<MobileItemInsightTab>('prices');

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

  useEffect(() => {
    setActiveTab('prices');
    handleCancelEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
      {/* Barra a due Tab: Storico & Analisi Prezzi | Marche */}
      <div className="flex items-center border-b border-gray-200 -mx-4 px-4 -mt-1">
        <button
          type="button"
          onClick={() => setActiveTab('prices')}
          className={`flex-1 flex items-center justify-center gap-1.5 pb-2.5 pt-1 text-xs font-bold border-b-2 transition-colors cursor-pointer min-w-0 ${
            activeTab === 'prices'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShoppingIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Storico &amp; Analisi Prezzi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('brands')}
          className={`flex-1 flex items-center justify-center gap-1.5 pb-2.5 pt-1 text-xs font-bold border-b-2 transition-colors cursor-pointer min-w-0 ${
            activeTab === 'brands'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <TagIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Marche</span>
          {relatedBrands.length > 0 && (
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ${
                activeTab === 'brands'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {relatedBrands.length}
            </span>
          )}
        </button>
      </div>

      {/* Contenuto Tab Attivo */}
      {activeTab === 'prices' ? (
        <ShoppingItemPriceHistoryPanel
          view={view}
          onViewChange={onViewChange}
          personalBatches={personalBatches}
          communityPrices={communityPrices}
          isLoading={isLoadingHistory}
          currentStats={currentStats}
          embedded={true}
        />
      ) : (
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
      )}
    </div>
  );
};

export default MobileShoppingItemInsightsTabs;
