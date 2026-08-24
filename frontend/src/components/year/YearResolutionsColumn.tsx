// frontend/src/components/year/YearResolutionsColumn.tsx
import React, { useState, useRef, useEffect } from 'react';
import type { DbYearlyEntry } from '@/types/yearlyentries';
import { AddButton } from '@/components/shared/utils/AddButton';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { TrashIcon } from '@/components/shared/utils/Icons';
import { Pagination } from '@/components/shared/utils/Pagination';
import { useAutoFitPagination } from '@/hooks/useAutoFitPagination';

interface YearResolutionsColumnProps {
  propositi: DbYearlyEntry[];
  onAdd: () => Promise<void>;
  onUpdate: (id: number, text: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const ROW_HEIGHT = 56;
const GAP_PX = 8;

export const YearResolutionsColumn: React.FC<YearResolutionsColumnProps> = ({
  propositi,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const listContainerRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const prevCountRef = useRef<number>(propositi.length);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-Fit Pagination speculare a TaskColumn, EventsColumn e RoutineColumn
  const {
    visibleItems: visiblePropositi,
    currentPage,
    totalPages,
    setCurrentPage,
  } = useAutoFitPagination(propositi, listContainerRef, ROW_HEIGHT, GAP_PX);

  // Rileva nuovo proposito, va all'ultima pagina ed attiva la scrittura automatica
  useEffect(() => {
    if (isAdding && propositi.length > prevCountRef.current) {
      if (totalPages > 0) {
        setCurrentPage(totalPages);
      }
      const lastItem = propositi[propositi.length - 1];
      if (lastItem) {
        setEditingId(lastItem.id);
      }
      setIsAdding(false);
    }
    prevCountRef.current = propositi.length;
  }, [propositi, isAdding, totalPages, setCurrentPage]);

  // Focus automatico della textarea in modifica
  useEffect(() => {
    if (editingId !== null && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingId]);

  const handleAddClick = async () => {
    setIsAdding(true);
    await onAdd();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col h-full overflow-hidden">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2 mb-3 text-center shrink-0">
        🌠 Buoni Propositi
      </h3>

      <div ref={listContainerRef} className="flex-1 overflow-hidden min-h-0 mb-2">
        {propositi.length === 0 ? (
          <EmptyState message="Aggiungi il tuo primo buon proposito!" />
        ) : (
          <div className="flex flex-col gap-2">
            {visiblePropositi.map((p) => {
              const isEditing = editingId === p.id;
              const textVal = p.yearly_field ?? '';

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-100 rounded-lg hover:border-gray-200 hover:bg-gray-50/60 transition-all group relative min-h-[48px] h-[52px]"
                >
                  {isEditing ? (
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
                      className="w-full text-center text-sm font-medium text-gray-800 bg-white border border-blue-400 rounded-lg p-1.5 focus:ring-2 focus:ring-blue-300 focus:outline-none resize-none placeholder-gray-300 shadow-xs leading-tight"
                      placeholder="Scrivi il tuo proposito..."
                    />
                  ) : (
                    <div
                      onClick={() => setEditingId(p.id)}
                      className="flex-1 cursor-pointer text-center py-0.5 min-w-0 flex items-center justify-center h-full"
                      title={textVal.length > 50 ? textVal : undefined}
                    >
                      <p className="text-sm font-medium text-gray-700 leading-snug line-clamp-2 text-center break-words max-w-full">
                        {textVal || <span className="text-gray-300 italic">Scrivi qui...</span>}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(p.id);
                    }}
                    title="Elimina proposito"
                    className="text-gray-300 hover:text-red-500 transition-colors text-xs opacity-0 group-hover:opacity-100 p-1 shrink-0 absolute right-2 bg-white/80 rounded-full shadow-xs"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mb-2 shrink-0">
          <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
        </div>
      )}

      <div className="mt-auto shrink-0 flex justify-center pt-1">
        <AddButton onClick={handleAddClick} label="Nuovo proposito" />
      </div>
    </div>
  );
};

export default YearResolutionsColumn;
