// src/mobile/components/modals/MobileTaskDetailModal.tsx
import React from 'react';
import type { TaskSummary } from '@/types';
import MobileBaseModal from './MobileBaseModal'; 
import { Badge } from '@/components/shared/utils/Badges';
import { TrashIcon, EditIcon } from '@/components/shared/utils/Icons';
import { TaskTreeNode } from '@/components/shared/utils/TaskTreeNode';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import { LocationPreview } from '@/components/shared/form';
import { useTaskDetailLogic } from '@/hooks/forms/useTaskDetailLogic';

interface MobileTaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTask: TaskSummary | null;
  onToggleTask: (id: number) => void;
  onSelectTask: (task: TaskSummary) => void;
  tasks: TaskSummary[]; 
  onEditClick: () => void; 
  onAddSubtask?: (parentId: number) => void;
  onTaskDeleted?: () => void;
}

export const MobileTaskDetailModal: React.FC<MobileTaskDetailModalProps> = ({ 
  isOpen, onClose, selectedTask, onToggleTask, onSelectTask, onEditClick, onAddSubtask, onTaskDeleted
}) => {
  const {
    rootUITask,
    isTaskDone,
    taskCategoryName,
    taskCategoryColor,
    taskPriority,
    maxSubtaskDepth,
    handleTaskToggle,
    handleDelete,
  } = useTaskDetailLogic({
    isOpen,
    onClose,
    selectedTask,
    onToggleTask,
    onTaskDeleted,
  });

  if (!isOpen || !selectedTask) return null;

  const HeaderTags = (
    <div className="flex items-center gap-2">
      <Badge variant="category" colorHex={taskCategoryColor}>
        {taskCategoryName}
      </Badge>
      <Badge variant="priority" priorityLevel={taskPriority}>
        {taskPriority}
      </Badge>
    </div>
  );

  const HeaderActions = (
    <div className="flex items-center gap-1">
      <button 
        type="button"
        title="Modifica" 
        onClick={onEditClick} 
        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
      >
        <EditIcon className="h-5 w-5" />
      </button>
      <button 
        type="button"
        title="Elimina" 
        onClick={handleDelete} 
        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
  
  const ModalFooter = (
    <button 
      type="button"
      onClick={() => handleTaskToggle(selectedTask.id, isTaskDone)} 
      className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-xs active:scale-[0.99] cursor-pointer ${
        isTaskDone ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/20'
      }`}
    >
      {isTaskDone ? 'Segna da fare' : 'Completata!'}
    </button>
  );

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={HeaderTags}
      headerActions={HeaderActions}
      footer={ModalFooter}
    >
      <div className="space-y-4 animate-fadeIn">
        {/* Titolo e Scadenza */}
        <div>
          <h2 className={`text-2xl font-extrabold text-gray-900 leading-snug ${isTaskDone ? 'line-through text-gray-400' : ''}`}>
            {selectedTask.title}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-sm font-bold ${isTaskDone ? 'text-gray-400' : 'text-red-500'}`}>
              Scadenza: {selectedTask.deadline ? formatToItalianShortDate(selectedTask.deadline) : 'Nessuna'}
            </span>
          </div>
        </div>

        {/* Luogo (se presente) */}
        {selectedTask.location && (
          <LocationPreview location={selectedTask.location} />
        )}
        
        {/* Descrizione (se presente) */}
        {selectedTask.description && (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
              Descrizione
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {selectedTask.description}
            </p>
          </div>
        )}

        {/* Albero Sottotask (se presente) */}
        {rootUITask && (
          <div className="w-full pt-2 border-t border-gray-200">
            <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
              Albero Sottotask
            </h4>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <TaskTreeNode 
                task={rootUITask}
                depth={0}
                selectedTaskId={selectedTask.id}
                maxSubtaskDepth={maxSubtaskDepth}
                onToggleTask={handleTaskToggle}
                onSelectTask={onSelectTask}
                onAddSubtask={onAddSubtask}
              />
            </div>
          </div>
        )}
      </div>
    </MobileBaseModal>
  );
};

export default MobileTaskDetailModal;
