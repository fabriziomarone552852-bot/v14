// src/mobile/components/MobileMoodEventColumn.tsx
import React from 'react';
import type { MoodEventType } from '@/types';
import { getGridClasses } from '@/utils/uiUtils';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { MobileMoodEventCard, type MoodEvent } from './MobileMoodEventCard';
import { useMobileMoodEventColumnLogic } from '@/mobile/hooks/useMobileMoodEventColumnLogic';
import { MobileMoodEventHeader } from './mood/MobileMoodEventHeader';
import { MobileMoodEventOverlayNew } from './mood/MobileMoodEventOverlayNew';
import { MobileMoodEventOverlayExpanded } from './mood/MobileMoodEventOverlayExpanded';
import { MobileMoodEventOverlayEditing } from './mood/MobileMoodEventOverlayEditing';

interface MobileMoodEventColumnProps {
  title: string;
  type: MoodEventType;
  events: MoodEvent[];
  themeColor: 'green' | 'red';
  periodLabel?: string;
  onAdd: (type: MoodEventType, title: string) => Promise<unknown> | void;
  onUpdate: (id: number, newTitle: string) => Promise<unknown> | void;
  onDelete: (id: number) => void;
}

export const MobileMoodEventColumn: React.FC<MobileMoodEventColumnProps> = ({
  title,
  type,
  events,
  themeColor,
  periodLabel = 'questa settimana',
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const {
    isAdding,
    setIsAdding,
    editingId,
    setEditingId,
    isSaving,
    limitedEvents,
    totalBlocks,
    primaParola,
    secondaParola,
    titleColor,
    borderTheme,
    emptyMessage,
    colors,
    expandedEvent,
    editingEvent,
    startExpandedLongPress,
    cancelExpandedLongPress,
    endExpandedLongPress,
    handleSaveNew,
    handleSaveEdit,
    handleDeleteEvent,
    handleCardTap,
    handleCardLongPress,
    handleHeaderAdd,
  } = useMobileMoodEventColumnLogic({
    title,
    type,
    events,
    themeColor,
    periodLabel,
    onAdd,
    onUpdate,
    onDelete,
  });

  return (
    <div className="relative flex flex-col w-full bg-white rounded-2xl shadow-xs border border-gray-200/90 flex-1 min-h-0 transition-all duration-300 z-10 overflow-hidden select-none">
      {/* 1. HEADER: Titolo a sinistra, Tasto '+' a destra */}
      <MobileMoodEventHeader
        title={title}
        primaParola={primaParola}
        secondaParola={secondaParola}
        titleColor={titleColor}
        borderTheme={borderTheme}
        onAddClick={handleHeaderAdd}
      />

      {/* 2. CORPO: Griglia 2D degli eventi */}
      <div
        className={`flex-1 min-h-0 p-2 grid gap-1.5 relative transition-all duration-500 ease-in-out ${getGridClasses(
          totalBlocks
        )}`}
      >
        {limitedEvents.map((ev, index) => (
          <MobileMoodEventCard
            key={ev.id}
            ev={ev}
            index={index}
            totalBlocks={totalBlocks}
            themeColor={themeColor}
            onTap={() => handleCardTap(ev.id)}
            onLongPress={() => handleCardLongPress(ev.id)}
          />
        ))}

        {limitedEvents.length === 0 && !isAdding && (
          <div className="col-span-full h-full flex flex-col items-center justify-center p-2 text-center pointer-events-none select-none">
            <EmptyState message={emptyMessage} />
          </div>
        )}

        {/* 3. OVERLAY AGGIUNTA NUOVO EVENTO */}
        {isAdding && (
          <MobileMoodEventOverlayNew
            themeColor={themeColor}
            editingBg={colors.editingBg}
            textColor={colors.text}
            isSaving={isSaving}
            onSave={handleSaveNew}
            onCancel={() => setIsAdding(false)}
          />
        )}

        {/* 4. OVERLAY EVENTO ESTESO */}
        {expandedEvent && !isAdding && editingId === null && (
          <MobileMoodEventOverlayExpanded
            expandedEvent={expandedEvent}
            bgIdle={colors.bgIdle}
            border={colors.border}
            text={colors.text}
            onStartLongPress={startExpandedLongPress}
            onEndLongPress={endExpandedLongPress}
            onCancelLongPress={cancelExpandedLongPress}
          />
        )}

        {/* 5. OVERLAY MODIFICA EVENTO */}
        {editingEvent && (
          <MobileMoodEventOverlayEditing
            editingEvent={editingEvent}
            themeColor={themeColor}
            editingBg={colors.editingBg}
            textColor={colors.text}
            trashBtnColor={colors.trashBtn}
            onSave={handleSaveEdit}
            onDelete={handleDeleteEvent}
            onCancel={() => setEditingId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MobileMoodEventColumn;
