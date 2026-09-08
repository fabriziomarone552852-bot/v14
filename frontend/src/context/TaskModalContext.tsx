// src/context/TaskModalContext.tsx
import React, { createContext, useContext, type ReactNode } from 'react';
import { useModal } from '@/hooks/useModals';
import TaskDetailModal from '@/components/shared/tasks/TaskDetailModal';
import TaskNewModal from '@/components/shared/tasks/TaskNewModal';
import MobileTaskDetailModal from '@/mobile/components/modals/MobileTaskDetailModal';
import MobileTaskNewModal from '@/mobile/components/modals/MobileTaskNewModal';
import type { TaskSummary } from '@/types';
import { useTaskMutations } from '@/hooks/mutations/useTaskMutations';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';

interface TaskFormModalState {
  taskToEdit?: TaskSummary | null;
  initialParentId?: number | null;
  initialDate?: string | null;
}

interface TaskModalContextProps {
  openTaskDetail: (task: TaskSummary) => void;
  closeTaskDetail: () => void;
  openTaskForm: (
    taskToEdit?: TaskSummary | null, 
    initialParentIdOrDate?: number | string | null, 
    initialDate?: string | null
  ) => void;
  closeTaskForm: () => void;
}

const TaskModalContext = createContext<TaskModalContextProps | undefined>(undefined);

export const TaskModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const detailModal = useModal<TaskSummary>();
  const formModal = useModal<TaskFormModalState>();
  const isMobile = useIsMobile();
  
  const { toggleTask } = useTaskMutations(['tasks']);

  // Transizione per aggiungere sottotask
  const handleAddSubtaskTransition = (parentId: number) => {
    detailModal.close();
    formModal.open({ taskToEdit: null, initialParentId: parentId });
  };

  // Il toggle del dettaglio gestito centralmente
  const handleToggleTask = (id: number) => {
    const currentTask = detailModal.data;
    if (currentTask && currentTask.id === id) {
      const newDoneStatus = !currentTask.done;
      toggleTask({ id, isDone: newDoneStatus });
      detailModal.open({ ...currentTask, done: newDoneStatus });
    }
  };

  return (
    <TaskModalContext.Provider value={{
      openTaskDetail: (task) => detailModal.open(task),
      closeTaskDetail: detailModal.close,
      openTaskForm: (taskToEdit = null, initialParentIdOrDate = null, initialDate = null) => {
        let parentId: number | null = null;
        let dateVal: string | null = null;

        if (typeof initialParentIdOrDate === 'number') {
          parentId = initialParentIdOrDate;
        } else if (typeof initialParentIdOrDate === 'string' && initialParentIdOrDate.includes('-')) {
          dateVal = initialParentIdOrDate;
        } else if (typeof initialParentIdOrDate === 'string' && initialParentIdOrDate.trim() !== '' && !isNaN(Number(initialParentIdOrDate))) {
          parentId = Number(initialParentIdOrDate);
        }

        if (initialDate) {
          dateVal = initialDate;
        }

        formModal.open({ taskToEdit, initialParentId: parentId, initialDate: dateVal });
      },
      closeTaskForm: formModal.close,
    }}>
      {children}

      {isMobile ? (
        <>
          <MobileTaskDetailModal
            isOpen={detailModal.isOpen}
            onClose={detailModal.close}
            selectedTask={detailModal.data}
            onToggleTask={handleToggleTask}
            onSelectTask={(task) => detailModal.open(task)}
            tasks={[]}
            onEditClick={() => {
              formModal.open({ taskToEdit: detailModal.data, initialParentId: null });
              detailModal.close();
            }}
            onAddSubtask={handleAddSubtaskTransition}
          />

          <MobileTaskNewModal
            isOpen={formModal.isOpen}
            onClose={formModal.close}
            taskToEdit={formModal.data?.taskToEdit}
            initialParentId={formModal.data?.initialParentId}
            initialDate={formModal.data?.initialDate}
          />
        </>
      ) : (
        <>
          <TaskDetailModal
            isOpen={detailModal.isOpen}
            onClose={detailModal.close}
            selectedTask={detailModal.data}
            onToggleTask={handleToggleTask}
            onSelectTask={(task) => detailModal.open(task)}
            tasks={[]}
            onEditClick={() => {
              formModal.open({ taskToEdit: detailModal.data, initialParentId: null });
              detailModal.close();
            }}
            onAddSubtask={handleAddSubtaskTransition}
          />

          <TaskNewModal
            isOpen={formModal.isOpen}
            onClose={formModal.close}
            taskToEdit={formModal.data?.taskToEdit}
            initialParentId={formModal.data?.initialParentId}
            initialDate={formModal.data?.initialDate}
          />
        </>
      )}
    </TaskModalContext.Provider>
  );
};

export const useTaskModals = () => {
  const context = useContext(TaskModalContext);
  if (!context) throw new Error('useTaskModals deve essere usato dentro TaskModalProvider');
  return context;
};