// src/components/dashboard/TaskDetailModal.tsx
import React, { useState, useEffect } from 'react';
import type { TaskSummary } from '@/types';
import type { SubtaskTemplateNode } from '@/utils/taskDuplicateUtils';
import BaseModal from '@/components/shared/dialog/BaseModal'; 
import { Badge } from '@/components/shared/utils/Badges';
import { CopyIcon, TrashIcon, EditIcon } from '@/components/shared/utils/Icons';
import { TaskTreeNode } from '@/components/shared/utils/TaskTreeNode';
import { TaskCopySubtasksModal } from '@/components/shared/tasks/TaskCopySubtasksModal';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import { LocationPreview } from '@/components/shared/form';
import { useTaskDetailLogic } from '@/hooks/forms/useTaskDetailLogic';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTask: TaskSummary | null;
  onToggleTask: (id: number) => void;
  onSelectTask: (task: TaskSummary) => void;
  tasks: TaskSummary[]; 
  onEditClick: () => void;
  onDuplicateClick?: (task: TaskSummary, subtasks: SubtaskTemplateNode[]) => void;
  onAddSubtask?: (parentId: number) => void;
  onTaskDeleted?: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ 
  isOpen, onClose, selectedTask, onToggleTask, onSelectTask, onEditClick, onDuplicateClick, onAddSubtask, onTaskDeleted
}) => {
  const {
    rootUITask,
    descendantSubtree,
    descendantCount,
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

  const [isCopyChoiceOpen, setIsCopyChoiceOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsCopyChoiceOpen(false);
  }, [isOpen, selectedTask?.id]);

  if (!isOpen || !selectedTask) return null;

  const handleCopyClick = () => {
    if (!onDuplicateClick) return;
    if (descendantCount > 0) {
      setIsCopyChoiceOpen(true);
    } else {
      onDuplicateClick(selectedTask, []);
    }
  };

  // I COMPONENTI DA INIETTARE IN BASEMODAL
  const SidePanel = rootUITask ? (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
        <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">Albero Task</h4>
      </div>
      <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
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
  ) : undefined;

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
    <>
      {onDuplicateClick && (
        <button
          type="button"
          title="Copia"
          aria-label="Copia task"
          onClick={handleCopyClick}
          className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
        >
          <CopyIcon className="h-5 w-5" />
        </button>
      )}
      <button title="Modifica" onClick={onEditClick} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
        <EditIcon className="h-5 w-5" />
      </button>
      <button title="Elimina" onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
        <TrashIcon className="h-5 w-5" />
      </button>
    </>
  );
  
  const ModalFooter = (
    <button 
      onClick={() => handleTaskToggle(selectedTask.id, isTaskDone)} 
      className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer ${
        isTaskDone ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-green-500 text-white hover:bg-green-600'
      }`}
    >
      {isTaskDone ? 'Segna da fare' : 'Completata!'}
    </button>
  );

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={HeaderTags}
        headerActions={HeaderActions}
        sidePanel={SidePanel}
        footer={ModalFooter}
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <h2 className={`text-2xl font-extrabold text-gray-800 ${isTaskDone ? 'line-through text-gray-400' : ''}`}>
              {selectedTask.title}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-sm font-bold ${isTaskDone ? 'text-gray-400' : 'text-red-500'}`}>
                Scadenza: {selectedTask.deadline ? formatToItalianShortDate(selectedTask.deadline) : 'Nessuna'}
              </span>
            </div>
          </div>

          {selectedTask.location && (
            <LocationPreview location={selectedTask.location} />
          )}
          
          {selectedTask.description && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Descrizione</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedTask.description}</p>
            </div>
          )}
        </div>
      </BaseModal>

      <TaskCopySubtasksModal
        isOpen={isCopyChoiceOpen}
        subtaskCount={descendantCount}
        onCopyWithSubtasks={() => {
          setIsCopyChoiceOpen(false);
          onDuplicateClick?.(selectedTask, descendantSubtree);
        }}
        onCopySingleOnly={() => {
          setIsCopyChoiceOpen(false);
          onDuplicateClick?.(selectedTask, []);
        }}
        onClose={() => setIsCopyChoiceOpen(false)}
      />
    </>
  );
};

export default TaskDetailModal;