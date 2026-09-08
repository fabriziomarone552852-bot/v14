// src/mobile/components/MobileYearResolutionsColumn.tsx
import React, { useState, useRef, useEffect } from 'react';
import type { DbYearlyEntry } from '@/types/yearlyentries';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { TrashIcon } from '@/components/shared/utils/Icons';
import { AddButton } from '@/components/shared/utils/AddButton';
import { Sparkles } from 'lucide-react';

interface MobileYearResolutionsColumnProps {
  propositi: DbYearlyEntry[];
  onAdd: () => Promise<void>;
  onUpdate: (id: number, text: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const MobileYearResolutionsColumn: React.FC<MobileYearResolutionsColumnProps> = ({
  propositi,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const prevCountRef = useRef<number>(propositi.length);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Focus automatico della textarea in modifica
  useEffect(() => {
    if (editingId !== null && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingId]);

  // Rileva nuovo proposito ed attiva subito l'editing
  useEffect(() => {
    if (isAdding && propositi.length > prevCountRef.current) {
      const lastItem = propositi[propositi.length - 1];
      if (lastItem) {
        setEditingId(lastItem.id);
      }
      setIsAdding(false);
    }
    prevCountRef.current = propositi.length;
  }, [propositi, isAdding]);

  const handleAddClick = async () => {
    setIsAdding(true);
    await onAdd();
  };

  return (
    <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200/90 shadow-xs p-2.5 flex flex-col justify-between overflow-hidden select-none">
      {/* Header Sezione Standardizzato (allineato a Eventi, Tasks e Routine) */}
      <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 shrink-0 mb-1.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-50 text-amber-600 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Buoni Propositi
          </h3>
          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            {propositi.length}
          </span>
        </div>
      </div>

      {/* Lista Scorrevole Buoni Propositi */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1.5 pr-0.5">
        {propositi.length === 0 ? (
          <div className="h-full flex items-center justify-center py-4">
            <EmptyState message="Aggiungi il tuo primo buon proposito dell'anno!" />
          </div>
        ) : (
          propositi.map((p) => {
            const isEditing = editingId === p.id;
            const textVal = p.yearly_field ?? '';

            return (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 p-2 bg-gray-50/80 hover:bg-amber-50/30 border border-gray-200/70 hover:border-amber-300 rounded-xl transition-all shadow-2xs group shrink-0"
              >
                {isEditing ? (
                  <>
                    <textarea
                      ref={textareaRef}
                      rows={2}
                      defaultValue={textVal}
                      onBlur={async (e) => {
                        const val = e.target.value.trim();
                        if (val !== textVal) {
                          await onUpdate(p.id, val);
                        }
                        setEditingId(null);
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                        if (e.key === 'Escape') {
                          setEditingId(null);
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
                        setEditingId(null);
                        await onDelete(p.id);
                      }}
                      title="Elimina proposito"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all shrink-0 cursor-pointer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div
                    onClick={() => setEditingId(p.id)}
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
          })
        )}
      </div>

      {/* Tasto Aggiungi in Basso con Stile AddButton.tsx */}
      <div className="pt-1.5 border-t border-gray-100 mt-1.5 shrink-0 flex justify-center">
        <AddButton
          onClick={handleAddClick}
          label="Nuovo proposito"
          compact={true}
        />
      </div>
    </div>
  );
};

export default MobileYearResolutionsColumn;
