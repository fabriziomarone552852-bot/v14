// src/hooks/forms/useTaskDetailLogic.ts
import { useMemo } from 'react';
import type { DbTask, TaskSummary, UITask } from '@/types';
import { useConfirm } from '@/context/ConfirmContext';
import { useTaskMutations } from '@/hooks/mutations/useTaskMutations';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { useAuth } from '@/context/AuthContext';
import { buildTaskTree } from '@/utils/taskUtils';

export interface UseTaskDetailLogicProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTask: TaskSummary | null;
  onToggleTask: (id: number) => void;
  onTaskDeleted?: () => void;
}

export const useTaskDetailLogic = ({
  isOpen,
  onClose,
  selectedTask,
  onToggleTask,
  onTaskDeleted,
}: UseTaskDetailLogicProps) => {
  const { toggleTask, deleteTask } = useTaskMutations(['tasks']);
  const { confirm } = useConfirm();
  const { user } = useAuth();

  const maxSubtaskDepth = user?.max_subtask_depth_user ?? 3;

  const { data: tasks = [] } = useQuery<DbTask[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const data = await api.get<DbTask[] | { items: DbTask[] }>('/tasks');
      return Array.isArray(data) ? data : data?.items || [];
    },
    enabled: isOpen,
  });

  const taskTree: UITask[] = useMemo(() => {
    return buildTaskTree(tasks);
  }, [tasks]);

  const getRootUITask = (taskId: number): UITask | undefined => {
    let current = tasks.find((t: DbTask) => t.id === taskId);
    while (current && current.parent_id != null) {
      const parent = tasks.find((t: DbTask) => t.id === current!.parent_id);
      if (parent) current = parent;
      else break;
    }
    if (!current) return undefined;

    return taskTree.find((t) => t.id === current!.id);
  };

  const rootUITask = selectedTask ? getRootUITask(selectedTask.id) : undefined;
  const liveTask = selectedTask
    ? tasks.find((t: DbTask) => t.id === selectedTask.id)
    : undefined;
  const isTaskDone = liveTask
    ? liveTask.fatto
    : selectedTask
    ? selectedTask.done
    : false;

  const taskCategoryName =
    liveTask?.category?.category_name ||
    liveTask?.category_name ||
    (typeof selectedTask?.category === 'string'
      ? selectedTask.category
      : undefined) ||
    'Generico';

  const taskCategoryColor =
    liveTask?.category?.colore || selectedTask?.categoryColor || '#9CA3AF';

  const taskPriority =
    liveTask?.priorita || selectedTask?.priority || 'Bassa';

  const handleTaskToggle = async (
    taskId: number,
    _isCurrentlyDone: boolean
  ) => {
    if (selectedTask && taskId === selectedTask.id) {
      onToggleTask(taskId);
    } else {
      toggleTask({ id: taskId, isDone: !_isCurrentlyDone });
    }
  };

  const handleDelete = () => {
    if (!selectedTask) return;
    confirm({
      title: 'Elimina Task',
      message:
        'Sei sicuro di voler eliminare definitivamente questa task e tutte le sue eventuali sottotask? L\'azione non è reversibile.',
      confirmText: 'Elimina',
      isDestructive: true,
      onConfirm: async () => {
        deleteTask(selectedTask.id);
        if (onTaskDeleted) {
          onTaskDeleted();
        }
        onClose();
      },
    });
  };

  return {
    tasks,
    taskTree,
    rootUITask,
    liveTask,
    isTaskDone,
    taskCategoryName,
    taskCategoryColor,
    taskPriority,
    maxSubtaskDepth,
    handleTaskToggle,
    handleDelete,
  };
};

export default useTaskDetailLogic;
