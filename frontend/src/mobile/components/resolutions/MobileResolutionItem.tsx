// src/mobile/components/resolutions/MobileResolutionItem.tsx
import React, { useRef, useEffect } from 'react';
import type { DbYearlyEntry } from '@/types/yearlyentries';
import { TrashIcon } from '@/components/shared/utils/Icons';

interface MobileResolutionItemProps {
  proposito: DbYearlyEntry;
  isEditing: boolean;
  onStartEditing: () => void;
  onStopEditing: () => void;
  onUpdate: (id: number, text: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const MobileResolutionItem: React.FC<MobileResolutionItemProps> = ({
  proposito,
  isEditing,
  onStartEditing,
  onStopEditing,
  onUpdate,
  onDelete,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const textVal = proposito.yearly_field ?? '';

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  return (
    <div className="flex items-center justify-between gap-2 p-2 bg-gray-50/80 hover:bg-amber-50/30 border border-gray-200/70 hover:border-amber-300 rounded-xl transition-all shadow-2xs group shrink-0">
      {isEditing ? (
        <>
          <textarea
            ref={textareaRef}
            rows={2}
            defaultValue={textVal}
            onBlur={async (e) => {
              const val = e.target.value.trim();
              if (val !== textVal) {
                await onUpdate(proposito.id, val);
              }
              onStopEditing();
            }}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.blur();
              }
              if (e.key === 'Escape') {
                onStopEditing();
              }
            }}
            className="flex-1 min-w-0 text-xs font-medium text-gray-900 bg-white border border-amber-400 rounded-lg p-1.5 focus:ring-2 focus:ring-amber-300 focus:outline-none resize-none placeholder-gray-300 shadow-xs leading-relaxed"
            placeholder="Scrivi il tuo proposito..."
          />

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={async (e) => {
              e.stopPropagation();
              onStopEditing();
              await onDelete(proposito.id);
            }}
            title="Elimina proposito"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all shrink-0 cursor-pointer"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </>
      ) : (
        <div
          onClick={onStartEditing}
          className="flex-1 cursor-pointer py-0.5 min-w-0 flex items-center min-h-[28px]"
          title="Tocca per modificare"
        >
          <p className="text-xs font-medium text-gray-800 leading-snug break-words max-w-full">
            {textVal || (
              <span className="text-gray-400 italic">
                Tocca per scrivere il proposito...
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default MobileResolutionItem;
