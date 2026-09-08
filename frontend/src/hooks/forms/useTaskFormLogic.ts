// src/hooks/forms/useTaskFormLogic.ts
import { useState, useEffect } from 'react';
import type { DbTask, TaskSummary } from '@/types';
import { getLocalTodayStr } from '@/utils/dateUtils';
import { useCategories } from '@/hooks/useCategories';
import { useTaskMutations } from '@/hooks/mutations/useTaskMutations';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { useConfirm } from '@/context/ConfirmContext';
import { useAuth } from '@/context/AuthContext';

export interface TaskFormState {
  titolo: string;
  descrizione: string;
  data_start: string;
  data_scadenza: string;
  priorita: 'Alta' | 'Media' | 'Bassa';
  category: string;
  luogo: string;
  parent_id: string;
}

export interface UseTaskFormLogicProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: TaskSummary | null;
  initialParentId?: number | null;
  initialDate?: string | null;
  onTaskSaved?: (savedTask?: DbTask) => void;
}

export const useTaskFormLogic = ({
  isOpen,
  onClose,
  taskToEdit,
  initialParentId,
  initialDate,
  onTaskSaved,
}: UseTaskFormLogicProps) => {
  const { data: dbCategories = [] } = useCategories();
  const { saveTask } = useTaskMutations(['tasks']);
  const { confirm } = useConfirm();
  const { user } = useAuth();
  const maxDepth = user?.max_subtask_depth_user ?? 3;

  const [newTaskForm, setNewTaskForm] = useState<TaskFormState>({
    titolo: '',
    descrizione: '',
    data_start: getLocalTodayStr(),
    data_scadenza: '',
    priorita: 'Bassa',
    category: '',
    luogo: '',
    parent_id: '',
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isSubtaskPanelOpen, setIsSubtaskPanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: tasks = [] } = useQuery<DbTask[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const data = await api.get<DbTask[] | { items: DbTask[] }>('/tasks');
      return Array.isArray(data) ? data : (data?.items || []);
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        const rawTask = tasks.find((t) => t.id === taskToEdit.id);
        const isIsoDate = (d?: string) => d && /^\d{4}-\d{2}-\d{2}/.test(d);

        setNewTaskForm({
          titolo: taskToEdit.title || '',
          descrizione: taskToEdit.description || '',
          data_start:
            rawTask?.data_start ||
            (isIsoDate(taskToEdit.dateStr)
              ? taskToEdit.dateStr
              : getLocalTodayStr()),
          data_scadenza:
            rawTask?.data_scadenza ||
            (isIsoDate(taskToEdit.deadline) ? taskToEdit.deadline : ''),
          priorita: taskToEdit.priority || 'Bassa',
          category: taskToEdit.category || '',
          luogo: taskToEdit.location || '',
          parent_id: taskToEdit.parent_id ? String(taskToEdit.parent_id) : '',
        });
        setIsSubtaskPanelOpen(!!taskToEdit.parent_id);
      } else {
        const defaultDate = initialDate || getLocalTodayStr();
        setNewTaskForm({
          titolo: '',
          descrizione: '',
          data_start: defaultDate,
          data_scadenza: initialDate || '',
          priorita: 'Bassa',
          category: '',
          luogo: '',
          parent_id: initialParentId ? String(initialParentId) : '',
        });
        setIsSubtaskPanelOpen(!!initialParentId);
      }
    } else {
      setIsDatePickerOpen(false);
      setIsStartDatePickerOpen(false);
    }
  }, [isOpen, taskToEdit, initialParentId, initialDate, tasks]);

  const handleSalvaNuovaTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (newTaskForm.data_scadenza && newTaskForm.data_start) {
      const startDate = new Date(newTaskForm.data_start);
      const endDate = new Date(newTaskForm.data_scadenza);

      if (endDate < startDate) {
        setIsSaving(false);
        confirm({
          title: 'Data non valida',
          message:
            'La data di scadenza non può essere precedente alla data di inizio del task.',
          confirmText: 'Ho capito',
          isDestructive: false,
          onConfirm: () => {},
        });
        return;
      }
    }

    try {
      const categoriaScelta = dbCategories.find(
        (c) => c.category_name === newTaskForm.category
      );
      const categoryId = categoriaScelta ? Number(categoriaScelta.id) : undefined;

      const pacchettoPerIlServer: Partial<DbTask> = {
        titolo: newTaskForm.titolo,
        descrizione: newTaskForm.descrizione || null,
        data_start: newTaskForm.data_start,
        data_scadenza: newTaskForm.data_scadenza || null,
        priorita: newTaskForm.priorita,
        user_category_id: categoryId,
        luogo: newTaskForm.luogo || null,
        parent_id: newTaskForm.parent_id ? Number(newTaskForm.parent_id) : null,
      };

      let savedTask: DbTask | undefined;

      if (taskToEdit) {
        savedTask = await saveTask({
          ...pacchettoPerIlServer,
          id: taskToEdit?.id,
        });
      } else {
        savedTask = await saveTask(pacchettoPerIlServer);
      }

      if (onTaskSaved && savedTask) {
        onTaskSaved(savedTask);
      }

      onClose();
    } catch {
      confirm({
        title: 'Attenzione',
        message: 'Si è verificato un errore durante il salvataggio.',
        confirmText: 'Ho capito',
        isDestructive: false,
        onConfirm: () => {},
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    newTaskForm,
    setNewTaskForm,
    dbCategories,
    tasks,
    maxDepth,
    isDatePickerOpen,
    setIsDatePickerOpen,
    isStartDatePickerOpen,
    setIsStartDatePickerOpen,
    isSubtaskPanelOpen,
    setIsSubtaskPanelOpen,
    isSaving,
    handleSalvaNuovaTask,
    isConfirmDisabled: !newTaskForm.titolo.trim(),
    confirm,
  };
};

export default useTaskFormLogic;
