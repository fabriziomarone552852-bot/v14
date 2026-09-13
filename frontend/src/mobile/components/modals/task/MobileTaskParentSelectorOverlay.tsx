// src/mobile/components/modals/task/MobileTaskParentSelectorOverlay.tsx
import React from 'react';
import type { DbTask } from '@/types';
import TaskTreeSelector from '@/components/shared/utils/TaskTreeSelector';
import { CloseIcon } from '@/components/shared/utils/Icons';

interface MobileTaskParentSelectorOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: DbTask[];
  selectedParentId?: string;
  maxDepth: number;
  onSelectParent: (id: string | number) => void;
  onMaxDepthReached: () => void;
}

export const MobileTaskParentSelectorOverlay: React.FC<MobileTaskParentSelectorOverlayProps> = ({
  isOpen,
  onClose,
  tasks,
  selectedParentId,
  maxDepth,
  onSelectParent,
  onMaxDepthReached,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn pointer-events-auto select-none"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-full max-w-sm max-h-[80vh] flex flex-col animate-fadeIn pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 shrink-0">
          <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            Scegli Task Padre
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            aria-label="Chiudi selezione task padre"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar py-2">
          <TaskTreeSelector
            tasks={tasks}
            selectedParentId={selectedParentId || ''}
            maxDepth={maxDepth}
            onSelect={(id: string | number) => {
              onSelectParent(id);
              onClose();
            }}
            onMaxDepthReached={onMaxDepthReached}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileTaskParentSelectorOverlay;
