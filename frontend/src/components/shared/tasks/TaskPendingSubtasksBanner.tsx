import React from 'react';
import { CopyIcon } from '@/components/shared/utils/Icons';

export interface TaskPendingSubtasksBannerProps {
  subtaskCount: number;
  onClear: () => void;
}

/**
 * Banner compatto condiviso tra Mobile e Desktop mostrato nel modale Nuova Task
 * quando una duplicazione include anche l'albero delle sottotask sottostanti.
 */
export const TaskPendingSubtasksBanner: React.FC<TaskPendingSubtasksBannerProps> = ({
  subtaskCount,
  onClear,
}) => {
  if (subtaskCount <= 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-2">
      <div className="flex items-start gap-2 min-w-0">
        <CopyIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-blue-900 leading-snug">
          Al salvataggio{' '}
          {subtaskCount === 1
            ? 'verrà copiata anche '
            : 'verranno copiate anche '}
          <strong>{subtaskCount} sottotask</strong>.
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="text-xs font-bold text-blue-700 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-white/70 transition-colors cursor-pointer shrink-0"
      >
        Escludi
      </button>
    </div>
  );
};

export default TaskPendingSubtasksBanner;
