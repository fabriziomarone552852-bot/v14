// src/mobile/components/modals/shopping/item/MobileShoppingItemDetailCard.tsx
import React from 'react';
import type { ShoppingListItem } from '@/types/shopping';
import { ShoppingItemNoteEditor } from '@/components/shared/shopping/ShoppingItemNoteEditor';

export interface MobileShoppingItemDetailCardProps {
  item: ShoppingListItem;
  formattedProductName: string;
  unitLabel: string;
  isEditingNote: boolean;
  setIsEditingNote: (editing: boolean) => void;
  noteText: string;
  setNoteText: (text: string) => void;
  isSavingNote: boolean;
  canEdit: boolean;
  onSaveNote: () => void;
  onCancelNote: () => void;
}

export const MobileShoppingItemDetailCard: React.FC<MobileShoppingItemDetailCardProps> = ({
  item,
  formattedProductName,
  unitLabel,
  isEditingNote,
  setIsEditingNote,
  noteText,
  setNoteText,
  isSavingNote,
  canEdit,
  onSaveNote,
  onCancelNote,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 leading-tight">
            {formattedProductName}
          </h2>
          {item.brandName && (
            <span className="text-xs font-semibold text-gray-500 block mt-0.5">
              {item.brandName}
            </span>
          )}
        </div>

        {item.quantity != null && (
          <div className="px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-100 text-right shrink-0">
            <span className="text-xs font-bold text-blue-700">
              {item.quantity} {unitLabel}
            </span>
          </div>
        )}
      </div>

      {/* Ultimo Prezzo Noto */}
      {item.lastPrice != null && (
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500">Ultimo prezzo registrato:</span>
          <span className="font-extrabold text-emerald-600">
            {item.lastPrice.toFixed(2)} {item.lastCurrencyCodeName || 'EUR'}
          </span>
        </div>
      )}

      {/* Note Editor Touch integrato */}
      <div className="pt-2 border-t border-gray-100">
        <ShoppingItemNoteEditor
          notes={item.notes}
          isEditing={isEditingNote}
          setIsEditing={setIsEditingNote}
          noteText={noteText}
          setNoteText={setNoteText}
          isSaving={isSavingNote}
          canEdit={canEdit}
          onSave={onSaveNote}
          onCancel={onCancelNote}
        />
      </div>
    </div>
  );
};
