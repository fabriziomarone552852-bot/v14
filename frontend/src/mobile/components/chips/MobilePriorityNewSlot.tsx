// src/mobile/components/chips/MobilePriorityNewSlot.tsx
import React from 'react';

interface MobilePriorityNewSlotProps {
  slotNumber: number;
  editingText: string;
  onEditingTextChange: (text: string) => void;
  onSave: (text: string) => void;
  onCancel: () => void;
}

export const MobilePriorityNewSlot: React.FC<MobilePriorityNewSlotProps> = ({
  slotNumber,
  editingText,
  onEditingTextChange,
  onSave,
  onCancel,
}) => {
  return (
    <div className="flex-1 min-w-0 flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-100/90 border border-amber-300 shadow-2xs animate-fadeIn">
      <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
        {slotNumber}
      </span>
      <input
        type="text"
        autoFocus
        value={editingText}
        onChange={(e) => onEditingTextChange(e.target.value)}
        onBlur={() => onSave(editingText)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSave(editingText);
          } else if (e.key === 'Escape') {
            onCancel();
          }
        }}
        className="bg-transparent border-none p-0 text-xs font-bold text-gray-900 focus:ring-0 focus:outline-none flex-1 min-w-0"
        placeholder={`Priorità ${slotNumber}...`}
      />
    </div>
  );
};

export default MobilePriorityNewSlot;
