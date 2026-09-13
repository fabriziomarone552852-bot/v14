// src/mobile/components/modals/routine/MobileHabitDetailFooter.tsx
import React from 'react';
import { PauseIcon, PlayIcon } from '@/components/shared/utils/Icons';

interface MobileHabitDetailFooterProps {
  isAttiva: boolean;
  entityLabel?: string;
  onSuspendClick?: () => void;
  onResumeClick?: () => void;
}

export const MobileHabitDetailFooter: React.FC<MobileHabitDetailFooterProps> = ({
  isAttiva,
  entityLabel = 'Abitudine',
  onSuspendClick,
  onResumeClick,
}) => {
  return (
    <div className="w-full">
      {isAttiva ? (
        <button
          type="button"
          onClick={onSuspendClick}
          className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 hover:text-orange-600 active:scale-[0.99] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <PauseIcon className="h-4 w-4" />
          Sospendi {entityLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={onResumeClick}
          className="w-full py-3 bg-purple-600 border border-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 active:scale-[0.99] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlayIcon className="h-4 w-4" />
          Riattiva {entityLabel}
        </button>
      )}
    </div>
  );
};

export default MobileHabitDetailFooter;
