// src/components/shared/shopping/ShoppingItemsList.tsx
import React from 'react';
import type { ShoppingListItem } from '@/types/shopping';
import ShoppingItemRow from './ShoppingItemRow';
import { EmptyState } from '@/components/shared/utils/EmptyState';

interface ShoppingItemsListProps {
  loading: boolean;
  items: ShoppingListItem[];
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onToggle: (item: ShoppingListItem) => void;
  onOpenDetail?: (item: ShoppingListItem) => void;
  userRole?: string;
}

const ShoppingItemsList: React.FC<ShoppingItemsListProps> = ({
  loading,
  items,
  containerRef,
  onToggle,
  onOpenDetail,
  userRole = 'owner',
}) => {
  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className="flex h-full min-h-0 flex-col overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
        {loading ? (
          <p
            className="py-6 text-center text-xs text-gray-400 animate-pulse"
            role="status"
            aria-live="polite"
          >
            Caricamento articoli...
          </p>
        ) : items.length === 0 ? (
          <div className="py-6">
            <EmptyState message="Nessun prodotto presente in questa lista" />
          </div>
        ) : (
          <ul className="space-y-1.5" role="list">
            {items.map((item) => (
              <li key={item.id}>
                <ShoppingItemRow
                  item={item}
                  onToggle={onToggle}
                  onOpenDetail={onOpenDetail}
                  userRole={userRole}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ShoppingItemsList;