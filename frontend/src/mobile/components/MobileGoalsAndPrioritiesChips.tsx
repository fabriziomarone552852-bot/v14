// src/mobile/components/MobileGoalsAndPrioritiesChips.tsx
import React from 'react';
import { PlusIcon } from '@/components/shared/utils/Icons';
import {
  useMobileGoalsAndPrioritiesLogic,
  type PriorityLikeEntry,
} from '@/mobile/hooks/useMobileGoalsAndPrioritiesLogic';
import { MobileGoalChipInput } from './chips/MobileGoalChipInput';
import { MobilePriorityChipItem } from './chips/MobilePriorityChipItem';
import { MobilePriorityNewSlot } from './chips/MobilePriorityNewSlot';

export type { PriorityLikeEntry };

interface MobileGoalsAndPrioritiesChipsProps {
  goalText?: string | null;
  priorities?: (PriorityLikeEntry | null)[] | null;
  onSaveGoal: (text: string) => void;
  onSavePriority: (id: number | undefined, text: string, index?: number) => void;
  goalPlaceholder?: string;
}

export const MobileGoalsAndPrioritiesChips: React.FC<MobileGoalsAndPrioritiesChipsProps> = ({
  goalText,
  priorities,
  onSaveGoal,
  onSavePriority,
  goalPlaceholder = 'Qual è il tuo obiettivo per oggi?',
}) => {
  const {
    containerRef,
    localGoal,
    setLocalGoal,
    handleGoalBlur,
    filledPriorities,
    editingPriority,
    setEditingPriority,
    expandedPriorityIndex,
    startLongPress,
    cancelLongPress,
    endLongPress,
    handleAddNewPriority,
    handleSavePriorityEdit,
    handleDeletePriority,
    canAddMore,
  } = useMobileGoalsAndPrioritiesLogic({
    goalText,
    priorities,
    onSaveGoal,
    onSavePriority,
  });

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-2 flex flex-col gap-1.5 shrink-0 select-none transition-all"
    >
      {/* 1. OBIETTIVO (Senza prefisso, centralizzato, inline edit) */}
      <MobileGoalChipInput
        value={localGoal}
        onChange={setLocalGoal}
        onBlur={handleGoalBlur}
        placeholder={goalPlaceholder}
      />

      {/* 2. PRIORITÀ: RIGO SINGOLO CON ALLARGAMENTO INLINE AL PRIMO CLIC & MODIFICA AL SECONDO CLIC / LONG PRESS */}
      <div className="flex items-center justify-center gap-1.5 w-full flex-nowrap overflow-hidden py-0.5 min-h-[2rem]">
        {/* Priorità già esistenti */}
        {filledPriorities.map((item) => (
          <MobilePriorityChipItem
            key={item.index}
            item={item}
            isCurrentlyEditing={editingPriority?.index === item.index}
            isExpanded={expandedPriorityIndex === item.index}
            hasAnyExpanded={expandedPriorityIndex !== null}
            editingText={editingPriority?.index === item.index ? editingPriority.text : ''}
            onEditingTextChange={(text) =>
              setEditingPriority((prev) => (prev ? { ...prev, text } : null))
            }
            onSaveEdit={handleSavePriorityEdit}
            onCancelEdit={() => setEditingPriority(null)}
            onStartLongPress={startLongPress}
            onEndLongPress={endLongPress}
            onCancelLongPress={cancelLongPress}
            onDelete={handleDeletePriority}
          />
        ))}

        {/* Slot di Nuova Priorità in fase di digitazione */}
        {editingPriority && !filledPriorities.some((p) => p.index === editingPriority.index) && (
          <MobilePriorityNewSlot
            slotNumber={filledPriorities.length + 1}
            editingText={editingPriority.text}
            onEditingTextChange={(text) =>
              setEditingPriority((prev) => (prev ? { ...prev, text } : null))
            }
            onSave={(text) =>
              handleSavePriorityEdit(editingPriority.index, editingPriority.id, text)
            }
            onCancel={() => setEditingPriority(null)}
          />
        )}

        {/* TASTO '+' AGGIUNGI PRIORITÀ */}
        {canAddMore && (
          <button
            type="button"
            onClick={handleAddNewPriority}
            title="Aggiungi Priorità"
            className="w-7 h-7 shrink-0 border-2 border-dashed border-gray-300 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50/60 active:scale-95 text-gray-400 rounded-xl transition-all flex justify-center items-center cursor-pointer focus:outline-none"
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileGoalsAndPrioritiesChips;
