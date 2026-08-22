// src/components/shared/shopping/ShoppingListAccordionItem.tsx
import React from 'react';
import type { ShoppingListSummary } from '@/types/shopping';
import { CheckCircleIcon } from '@/components/shared/utils/Icons';

export interface ShoppingListAccordionItemProps {
  list: ShoppingListSummary;
  isActive: boolean;
  onSelect: (id: number) => void;
}

export const ShoppingListAccordionItem: React.FC<ShoppingListAccordionItemProps> = ({
  list,
  isActive,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(list.id)}
      className={`w-full flex items-center justify-between border min-h-[52px] p-2.5 rounded-xl shadow-xs transition-all cursor-pointer gap-2 ${
        isActive
          ? 'bg-blue-50/80 border-blue-400 ring-1 ring-blue-400 shadow-sm'
          : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50/80'
      }`}
      title={list.name}
    >
      <div className="min-w-0 flex-1 text-left">
        <p className={`truncate text-sm font-semibold ${isActive ? 'text-blue-950' : 'text-gray-800'}`}>
          {list.name}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
          {list.isCompleted ? (
            <span className="inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
              <span>Completata</span>
            </span>
          ) : (
            <span className="font-semibold text-gray-500 px-1.5 py-0.5 rounded-md bg-gray-100 border border-gray-200">
              {list.openItemsCount ?? 0} da comprare
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
