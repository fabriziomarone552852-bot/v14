// src/mobile/components/mood/MobileMoodEventOverlayNew.tsx
import React from 'react';
import { AutoExpandingTextarea } from '@/components/shared/utils/AutoExpandingTextarea';

interface MobileMoodEventOverlayNewProps {
  themeColor: 'green' | 'red';
  editingBg: string;
  textColor: string;
  isSaving: boolean;
  onSave: (val: string) => void;
  onCancel: () => void;
}

export const MobileMoodEventOverlayNew: React.FC<MobileMoodEventOverlayNewProps> = ({
  themeColor,
  editingBg,
  textColor,
  isSaving,
  onSave,
  onCancel,
}) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute inset-1.5 z-50 rounded-2xl border-2 shadow-2xl p-4 flex flex-col justify-center items-center text-center animate-fadeIn ${editingBg} ${textColor}`}
    >
      <div className="w-full flex-1 flex items-center justify-center">
        <AutoExpandingTextarea
          initialValue=""
          onBlur={(e) => onSave(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSave(e.currentTarget.value);
            }
            if (e.key === 'Escape' && !isSaving) onCancel();
          }}
          placeholder="Scrivi..."
          themeColor={themeColor}
          autoFocus
          disabled={isSaving}
        />
      </div>
    </div>
  );
};

export default MobileMoodEventOverlayNew;
