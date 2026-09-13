// src/mobile/components/modals/task/MobileTaskSubtaskSection.tsx
import React from 'react';
import { CheckCircleIcon, ChevronRightIcon } from '@/components/shared/utils/Icons';

interface MobileTaskSubtaskSectionProps {
  isSubtaskPanelOpen: boolean;
  onToggleSubtask: (checked: boolean) => void;
  parentTaskTitle?: string;
  onOpenParentOverlay: () => void;
}

export const MobileTaskSubtaskSection: React.FC<MobileTaskSubtaskSectionProps> = ({
  isSubtaskPanelOpen,
  onToggleSubtask,
  parentTaskTitle,
  onOpenParentOverlay,
}) => {
  return (
    <div className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            id="mobileIsSubtaskToggle"
            checked={isSubtaskPanelOpen}
            onChange={(e) => onToggleSubtask(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
          <label
            htmlFor="mobileIsSubtaskToggle"
            className="text-sm font-bold text-gray-800 cursor-pointer select-none"
          >
            Questa è una Sottotask
          </label>
        </div>

        {isSubtaskPanelOpen && (
          <button
            type="button"
            onClick={onOpenParentOverlay}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            {parentTaskTitle ? 'Cambia' : 'Seleziona'}
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isSubtaskPanelOpen && (
        <div
          onClick={onOpenParentOverlay}
          className="mt-1 pt-2 border-t border-gray-200/70 flex items-center justify-between text-xs cursor-pointer hover:bg-gray-100/60 p-1.5 rounded-lg transition-colors"
        >
          {parentTaskTitle ? (
            <div className="flex items-center gap-1.5 text-blue-700 font-bold min-w-0">
              <CheckCircleIcon className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="truncate">Padre: {parentTaskTitle}</span>
            </div>
          ) : (
            <span className="text-amber-600 font-semibold italic">
              Nessun task genitore selezionato (tocca per scegliere)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileTaskSubtaskSection;
