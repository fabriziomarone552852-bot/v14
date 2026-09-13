// src/mobile/components/MobileYearResolutionsColumn.tsx
import React, { useState, useRef, useEffect } from 'react';
import type { DbYearlyEntry } from '@/types/yearlyentries';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { AddButton } from '@/components/shared/utils/AddButton';
import { Sparkles } from 'lucide-react';
import { MobileResolutionItem } from './resolutions/MobileResolutionItem';

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
      {/* Header Sezione Standardizzato */}
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
          propositi.map((p) => (
            <MobileResolutionItem
              key={p.id}
              proposito={p}
              isEditing={editingId === p.id}
              onStartEditing={() => setEditingId(p.id)}
              onStopEditing={() => setEditingId(null)}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {/* Tasto Aggiungi in Basso con Stile AddButton */}
      <div className="pt-1.5 border-t border-gray-100 mt-1.5 shrink-0 flex justify-center">
        <AddButton onClick={handleAddClick} label="Nuovo proposito" compact={true} />
      </div>
    </div>
  );
};

export default MobileYearResolutionsColumn;
