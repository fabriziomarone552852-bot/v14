import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { updateAllSyncCaches, invalidateAllViews } from '@/utils/queryCacheUtils';
import type { DbTask } from '@/types';
import type { SubtaskTemplateNode } from '@/utils/taskDuplicateUtils';
import { logger } from '@/utils/logger';

// 🪄 1. Definiamo i contratti in modo rigoroso, zero unknown.
export interface CacheWithTasks {
  tasks?: DbTask[];
}

// Uniamo i due casi possibili per la cache
type TaskCacheData = DbTask[] | CacheWithTasks;

// 🪄 2. Funzione generica protetta
const updateCacheSafely = <T extends TaskCacheData>(
  oldData: T | undefined, 
  updaterFn: (tasks: DbTask[]) => DbTask[]
): T | undefined => {
  if (!oldData) return oldData;
  
  // CASO 1: È direttamente un array
  if (Array.isArray(oldData)) {
    return updaterFn(oldData) as T;
  }

  // CASO 2: È un oggetto che contiene la proprietà 'tasks'
  if (typeof oldData === 'object' && oldData !== null && 'tasks' in oldData) {
    return {
      ...oldData,
      tasks: updaterFn(oldData.tasks || [])
    } as T;
  }

  return oldData;
};

/** Il parametro queryKey è accettato per compatibilità ma non influisce sul comportamento:
 *  tutti gli aggiornamenti usano updateAllSyncCaches() con chiavi fisse. */
export function useTaskMutations(_queryKey?: unknown) {
  const queryClient = useQueryClient();

  // --- 1. TOGGLE TASK ---
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, isDone }: { id: number; isDone: boolean }) => {
      const result = await api.patch<DbTask>(`/tasks/${id}`, { fatto: isDone });
      if (!result) throw new Error("Errore durante il toggle: risposta vuota");
      return result;
    },
    
    onMutate: async ({ id, isDone }) => {
      const toggleUpdater = (tasks: DbTask[]) => tasks.map(t => 
        t.id === id ? { 
          ...t, 
          fatto: isDone, 
          completato: isDone, 
          data_fatto: isDone ? new Date().toISOString() : null 
        } : t
      );

      // 🪄 3. Diciamo a setQueriesData l'esatto tipo in ingresso: <TaskCacheData>
      updateAllSyncCaches<TaskCacheData>(queryClient, (old) => updateCacheSafely(old, toggleUpdater), ['tasks']);

      return { id };
    },
    
    onError: (err) => {
      logger.error("Errore durante il toggle del task:", err);
      invalidateAllViews(queryClient);
    },
    
    onSettled: () => {
      invalidateAllViews(queryClient);
    }
  });

  // --- 2. SALVA TASK (CREA O AGGIORNA) ---
  const saveTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<DbTask> & { id?: number }) => {
      const { id, subtasks, ...payload } = taskData;
      
      if (payload.data_scadenza !== undefined) {
        if (!payload.data_scadenza || payload.data_scadenza.trim() === "") {
          payload.data_scadenza = null; 
        } else {
          payload.data_scadenza = payload.data_scadenza.substring(0, 10);
        }
      }

      const result = id 
        ? await api.patch<DbTask>(`/tasks/${id}`, payload)
        : await api.post<DbTask>('/tasks', payload);
        
      if (!result) throw new Error("Errore: impossibile salvare il task");
      return result;
    },
    
    onMutate: async (newTask) => {
      const tempId = newTask.id || Date.now();
      const isUpdate = !!newTask.id;

      const saveUpdater = (currentTasks: DbTask[]) => {
        const existingTask = isUpdate ? currentTasks.find(t => t.id === newTask.id) : undefined;
        
        const fakeTask: DbTask = {
          ...existingTask,
          ...newTask,
          id: tempId,
          titolo: newTask.titolo || "Nuovo Task",
          completato: newTask.fatto ?? existingTask?.fatto ?? false,
          fatto: newTask.fatto ?? existingTask?.fatto ?? false,
        } as DbTask;

        return isUpdate
          ? currentTasks.map(t => (t.id === newTask.id ? fakeTask : t))
          : [...currentTasks, fakeTask];
      };

      updateAllSyncCaches<TaskCacheData>(queryClient, (old) => updateCacheSafely(old, saveUpdater), ['tasks']);

      return { tempId };
    },

    onSuccess: (savedTaskFromDB, newTask, context) => {
      if (!newTask.id && context?.tempId && savedTaskFromDB) {
        const swapIdUpdater = (currentTasks: DbTask[]) => currentTasks.map(t => 
          t.id === context.tempId ? savedTaskFromDB : t
        );
        
        updateAllSyncCaches<TaskCacheData>(queryClient, (old) => updateCacheSafely(old, swapIdUpdater), ['tasks']);
      }
    },

    onSettled: () => {
      invalidateAllViews(queryClient);
    }
  });

  // --- 3. ELIMINA TASK ---
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tasks/${id}`);
      return { id };
    },
    
    onMutate: async (taskId) => {
      const deleteUpdater = (currentTasks: DbTask[]) => 
        currentTasks.filter(t => t.id !== taskId && t.parent_id !== taskId);

      updateAllSyncCaches<TaskCacheData>(queryClient, (old) => updateCacheSafely(old, deleteUpdater), ['tasks']);

      return { taskId };
    },
    
    onError: (err) => {
      logger.error("Errore eliminazione task:", err);
      invalidateAllViews(queryClient);
    },
    
    onSettled: () => {
      invalidateAllViews(queryClient);
    }
  });

  // --- 4. CLONA ALBERO SOTTOTASK RICORSIVAMENTE (PER LIVELLI) ---
  const cloneSubtasksTree = async (
    rootTaskId: number,
    nodes: SubtaskTemplateNode[],
    startDateStr: string
  ): Promise<DbTask[]> => {
    if (nodes.length === 0) return [];
    const createdAll: DbTask[] = [];

    const createLevel = async (
      parentId: number,
      levelNodes: SubtaskTemplateNode[]
    ): Promise<void> => {
      if (levelNodes.length === 0) return;

      const createdSiblings = await Promise.all(
        levelNodes.map(async (node) => {
          const created = await api.post<DbTask>('/tasks', {
            titolo: node.titolo,
            descrizione: node.descrizione,
            data_start: startDateStr,
            data_scadenza: null,
            priorita: node.priorita,
            user_category_id: node.user_category_id ?? undefined,
            luogo: node.luogo,
            parent_id: parentId,
          });
          if (!created) {
            throw new Error(`Impossibile clonare la sottotask "${node.titolo}"`);
          }
          return { created, children: node.children };
        })
      );

      for (const { created } of createdSiblings) {
        createdAll.push(created);
      }

      await Promise.all(
        createdSiblings
          .filter(({ children }) => children.length > 0)
          .map(({ created, children }) => createLevel(created.id, children))
      );
    };

    try {
      await createLevel(rootTaskId, nodes);
    } finally {
      if (createdAll.length > 0) {
        updateAllSyncCaches<TaskCacheData>(
          queryClient,
          (old) =>
            updateCacheSafely(old, (currentTasks) => {
              const existingIds = new Set(currentTasks.map((t) => t.id));
              const toAppend = createdAll.filter((t) => !existingIds.has(t.id));
              return [...currentTasks, ...toAppend];
            }),
          ['tasks']
        );
        invalidateAllViews(queryClient);
      }
    }

    return createdAll;
  };

  return {
    toggleTask: toggleTaskMutation.mutate,
    saveTask: saveTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutate,
    cloneSubtasksTree,
  };
}