// frontend/src/utils/taskUtils.ts
import type { DbTask, TaskSummary, UITask } from '@/types';

// 2. MAPPATURA SINGOLA SICURA
export const mapTaskToSummary = (
  t: DbTask, 
  extraProps: Partial<TaskSummary> = {}
): TaskSummary => {
  const cleanScadenza = t.data_scadenza ? t.data_scadenza.substring(0, 10) : "";
  const cleanStart = t.data_start ? t.data_start.substring(0, 10) : "";

  return {
    id: t.id,
    title: t.titolo,
    deadline: cleanScadenza, 
    dateStr: cleanStart, 
    done: t.fatto,
    data_fatto: t.data_fatto,
    priority: t.priorita,
    // 🪄 MAGIA: Sostituiti tutti i || con ??
    category: t.category?.category_name ?? t.category_name ?? 'Generico',
    categoryColor: t.category?.colore ?? '#9ca3af',
    description: t.descrizione ?? "",
    location: t.luogo ?? "",
    parent_id: t.parent_id,
    hasActiveSubtasks: !!t.subtasks && t.subtasks.some(st => !st.fatto),
    ...extraProps
  };
};

export const mapTasksToSummaries = (tasks: DbTask[] | undefined): TaskSummary[] => {
  if (!tasks || !Array.isArray(tasks)) return [];
  return tasks.map(t => mapTaskToSummary(t));
};

// 3. WIDGET DASHBOARD
export const getUpcomingTasks = (tasks: DbTask[] | undefined, days: number = 30, limit: number = 6): TaskSummary[] => {
  if (!tasks || !Array.isArray(tasks)) return [];

  const now = Date.now();
  const timeLimit = days * 24 * 60 * 60 * 1000;
  
  return tasks
    .filter(t => !t.fatto && !!t.data_scadenza)
    .map(t => ({
      task: mapTaskToSummary(t),
      time: t.data_scadenza ? new Date(t.data_scadenza.substring(0, 10)).getTime() : 0
    }))
    .filter(item => {
      const diff = item.time - now;
      return diff >= 0 && diff <= timeLimit;
    })
    .sort((a, b) => a.time - b.time) 
    .slice(0, limit)
    .map(item => item.task);
};

const getCleanDate = (isoStr?: string | null): string => {
  if (!isoStr) return '';
  return isoStr.substring(0, 10);
};

// Helper per raggruppare i task in famiglie (Task radice + tutti i suoi discendenti)
const getFamilyTrees = (flatTasks: DbTask[]): DbTask[][] => {
  const dbMap = new Map<number, DbTask>();
  flatTasks.forEach((t) => dbMap.set(t.id, t));

  const childrenMap = new Map<number, DbTask[]>();
  const roots: DbTask[] = [];

  flatTasks.forEach((t) => {
    if (t.parent_id && dbMap.has(t.parent_id)) {
      const list = childrenMap.get(t.parent_id) || [];
      list.push(t);
      childrenMap.set(t.parent_id, list);
    } else {
      roots.push(t);
    }
  });

  const getDescendants = (task: DbTask): DbTask[] => {
    const result: DbTask[] = [task];
    const children = childrenMap.get(task.id) || [];
    children.forEach((child) => {
      result.push(...getDescendants(child));
    });
    return result;
  };

  return roots.map((root) => getDescendants(root));
};

// 4. ALBERO DEI TASK STANDARD
export const buildTaskTree = (flatTasks: DbTask[] | undefined): UITask[] => {
  if (!flatTasks || !Array.isArray(flatTasks) || flatTasks.length === 0) return [];

  const taskMap = new Map<number, UITask>();
  const roots: UITask[] = [];

  flatTasks.forEach((task) => {
    taskMap.set(task.id, { ...mapTaskToSummary(task), subtasks: [] });
  });

  flatTasks.forEach((task) => {
    const uiTask = taskMap.get(task.id);
    if (!uiTask) return;

    if (task.parent_id && taskMap.has(task.parent_id)) {
      const parent = taskMap.get(task.parent_id)!;
      parent.subtasks.push(uiTask);
      if (!uiTask.done) {
        parent.hasActiveSubtasks = true;
      }
    } else {
      roots.push(uiTask);
    }
  });

  return roots;
};

// 4.1. ALBERO DEI TASK PER HOMEPAGE
export const buildTaskTreeForHome = (
  flatTasks: DbTask[] | undefined,
  todayStr: string
): UITask[] => {
  if (!flatTasks || !Array.isArray(flatTasks) || flatTasks.length === 0) return [];

  // Regola HomePage:
  // Task completate: mostrate SOLO se completate OGGI
  const eligibleTasks = flatTasks.filter((t) => {
    if (t.fatto) {
      const dataFatto = getLocalDateStr(t.data_fatto);
      return dataFatto === todayStr;
    }
    return true;
  });

  const families = getFamilyTrees(eligibleTasks);
  const resultRoots: UITask[] = [];

  families.forEach((family) => {
    const activeWithDeadline = family.filter(
      (t) => !t.fatto && getCleanDate(t.data_scadenza) !== ''
    );

    if (activeWithDeadline.length > 0) {
      // 1. Trova la scadenza minima (più imminente) dell'intero albero di famiglia
      let minDeadline = getCleanDate(activeWithDeadline[0].data_scadenza);
      activeWithDeadline.forEach((t) => {
        const d = getCleanDate(t.data_scadenza);
        if (d < minDeadline) minDeadline = d;
      });

      // 2. Seleziona SOLO le task dell'albero che hanno quella precisa scadenza minima
      const earliestTasks = activeWithDeadline.filter(
        (t) => getCleanDate(t.data_scadenza) === minDeadline
      );

      // 3. Mostra le task imminenti. Se sono sottotask (parent_id != null), imposta isPromotedSubtask = true
      earliestTasks.forEach((task) => {
        const uiTask: UITask = {
          ...mapTaskToSummary(task),
          isPromotedSubtask: !!task.parent_id,
          subtasks: []
        };
        resultRoots.push(uiTask);
      });
    } else {
      // Nessuna task con data nell'albero -> usa la gerarchia standard dell'albero di famiglia
      const familyTree = buildTaskTree(family);
      resultRoots.push(...familyTree);
    }
  });

  return resultRoots;
};

// 4.2. ALBERO DEI TASK PER DAYPAGE
export const buildTaskTreeForDay = (
  flatTasks: DbTask[] | undefined,
  targetDateStr: string
): UITask[] => {
  if (!flatTasks || !Array.isArray(flatTasks) || flatTasks.length === 0) return [];

  const getLocalTodayStr = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().substring(0, 10);
  };

  const todayStr = getLocalTodayStr();
  const isPastDay = targetDateStr < todayStr;

  // Se è un giorno passato: mostra SOLO ed ESCLUSIVAMENTE le task completate in quel giorno
  if (isPastDay) {
    const completedOnPastDay = flatTasks.filter(
      (t) => t.fatto && getLocalDateStr(t.data_fatto) === targetDateStr
    );
    return buildTaskTree(completedOnPastDay);
  }

  // Per Oggi o Giorni Futuri:
  const eligibleTasks = flatTasks.filter((t) => {
    if (t.fatto) {
      const dataFatto = getLocalDateStr(t.data_fatto);
      return dataFatto === targetDateStr;
    }
    return true;
  });

  const families = getFamilyTrees(eligibleTasks);
  const resultRoots: UITask[] = [];

  families.forEach((family) => {
    const activeWithDeadline = family.filter(
      (t) => !t.fatto && getCleanDate(t.data_scadenza) !== ''
    );

    if (activeWithDeadline.length > 0) {
      // Trova la scadenza minima nell'albero di famiglia
      let minDeadline = getCleanDate(activeWithDeadline[0].data_scadenza);
      activeWithDeadline.forEach((t) => {
        const d = getCleanDate(t.data_scadenza);
        if (d < minDeadline) minDeadline = d;
      });

      // La task imminente viene mostrata solo se la sua data di scadenza è <= targetDateStr (oggi o scaduta)
      if (minDeadline <= targetDateStr) {
        const earliestTasks = activeWithDeadline.filter(
          (t) => getCleanDate(t.data_scadenza) === minDeadline
        );
        earliestTasks.forEach((task) => {
          const uiTask: UITask = {
            ...mapTaskToSummary(task),
            isPromotedSubtask: !!task.parent_id,
            subtasks: []
          };
          resultRoots.push(uiTask);
        });
      }
    } else {
      // Nessuna task con data nell'albero -> mostra l'albero di famiglia se le task non hanno scadenza
      const familyTree = buildTaskTree(family);
      resultRoots.push(...familyTree);
    }
  });

  return resultRoots;
};

// 4.3. ALBERO DEI TASK PER MONTHPAGE
export const buildTaskTreeForMonth = (
  flatTasks: DbTask[] | undefined,
  firstDayStr: string,
  lastDayStr: string
): UITask[] => {
  if (!flatTasks || !Array.isArray(flatTasks) || flatTasks.length === 0) return [];

  const getLocalTodayStr = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().substring(0, 10);
  };

  const todayStr = getLocalTodayStr();
  const isPastMonth = lastDayStr < todayStr;

  // Se il mese osservato è nel PASSATO (< oggi): mostra SOLO ed ESCLUSIVAMENTE le task completate in quel mese!
  if (isPastMonth) {
    const completedInMonth = flatTasks.filter((t) => {
      if (!t.fatto) return false;
      const dataFatto = getLocalDateStr(t.data_fatto);
      return dataFatto >= firstDayStr && dataFatto <= lastDayStr;
    });
    return buildTaskTree(completedInMonth);
  }

  const isCurrentMonth = todayStr >= firstDayStr && todayStr <= lastDayStr;

  // Per Mese Corrente o Futuro:
  const eligibleTasks = flatTasks.filter((t) => {
    if (t.fatto) {
      const dataFatto = getLocalDateStr(t.data_fatto);
      if (isCurrentMonth) {
        // Mese corrente: mostra SOLO le task completate OGGI per non intasare la colonna
        return dataFatto === todayStr;
      }
      return dataFatto >= firstDayStr && dataFatto <= lastDayStr;
    }
    return true;
  });

  const families = getFamilyTrees(eligibleTasks);
  const resultRoots: UITask[] = [];

  families.forEach((family) => {
    const activeWithDeadline = family.filter(
      (t) => !t.fatto && getCleanDate(t.data_scadenza) !== ''
    );

    if (activeWithDeadline.length > 0) {
      // 1. Trova la scadenza minima (più imminente) dell'intero albero di famiglia
      let minDeadline = getCleanDate(activeWithDeadline[0].data_scadenza);
      activeWithDeadline.forEach((t) => {
        const d = getCleanDate(t.data_scadenza);
        if (d < minDeadline) minDeadline = d;
      });

      // 2. La task con la scadenza più imminente viene mostrata solo se la sua scadenza è <= lastDayStr (scade nel mese o prima)
      if (minDeadline <= lastDayStr) {
        const earliestTasks = activeWithDeadline.filter(
          (t) => getCleanDate(t.data_scadenza) === minDeadline
        );
        earliestTasks.forEach((task) => {
          const uiTask: UITask = {
            ...mapTaskToSummary(task),
            isPromotedSubtask: !!task.parent_id,
            subtasks: []
          };
          resultRoots.push(uiTask);
        });
      }
    } else {
      // Nessuna task con data nell'albero -> mostra l'albero di famiglia se le task non hanno scadenza
      const familyTree = buildTaskTree(family);
      resultRoots.push(...familyTree);
    }
  });

  return resultRoots;
};

const getLocalDateStr = (isoString?: string | null): string => {
  if (!isoString) return '';
  const d = new Date(isoString);
  // Se per caso la data non è valida, facciamo un fallback sicuro
  if (isNaN(d.getTime())) return isoString.substring(0, 10); 
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().substring(0, 10);
};

// 4.3. FILTRAGGIO PER MODALITÀ "CON DATA" VS "SENZA DATA"
export const filterTreeByDeadlineMode = (
  tasks: UITask[] | undefined,
  showWithDeadline: boolean
): UITask[] => {
  if (!tasks) return [];

  return tasks.reduce<UITask[]>((acc, task) => {
    const filteredSubtasks = filterTreeByDeadlineMode(task.subtasks, showWithDeadline);
    const matchesMode = showWithDeadline ? !!task.deadline : !task.deadline;

    if (matchesMode || filteredSubtasks.length > 0) {
      acc.push({
        ...task,
        subtasks: filteredSubtasks
      });
    }

    return acc;
  }, []);
};

// 5. FILTRAGGIO ED ORDINAMENTO ALBERO
export const filterAndSortTree = (
  tasks: UITask[] | undefined, 
  hideCompleted: boolean,
  sortMode: 'chrono' | 'priority',
  referenceDateStr?: string
): UITask[] => {
  if (!tasks) return [];
  
  const priorityWeights: Record<string, number> = { Alta: 3, Media: 2, Bassa: 1 };

  // 🪄 Calcoliamo la data di oggi in formato YYYY-MM-DD locale per il confronto
  const getLocalTodayStr = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().substring(0, 10);
  };
  
  const todayStr = getLocalTodayStr();
  const isPastDay = referenceDateStr ? referenceDateStr < todayStr : false;

  return tasks.reduce<UITask[]>((acc, task) => {
    // Calcoliamo prima le sottotask in modo ricorsivo
    const filteredSubtasks = filterAndSortTree(task.subtasks, hideCompleted, sortMode, referenceDateStr);

    // 🪄 Usiamo il nostro Helper per leggere sempre e solo la vera data italiana!
    const dataFattoStr = getLocalDateStr(task.data_fatto);

    // --- 🕰️ LOGICA ARCHIVIO (Giorni Passati) ---
    if (isPastDay) {
      const completedOnThisDay = task.done && dataFattoStr === referenceDateStr;

      // Includiamo la task SOLO se è stata completata in questo giorno, 
      // OPPURE se ha delle sottotask che sono state completate in questo giorno!
      if (completedOnThisDay || filteredSubtasks.length > 0) {
        acc.push({ ...task, subtasks: filteredSubtasks });
      }
      return acc;
    }

    // --- 📅 LOGICA NORMALE (Oggi o Futuro) ---
    if (hideCompleted && task.done) return acc;

    if (task.done && task.data_fatto && referenceDateStr) {
      // Nascondiamo le task completate nei giorni precedenti
      if (dataFattoStr < referenceDateStr) {
        return acc;
      }
    }

    acc.push({ ...task, subtasks: filteredSubtasks });
    return acc;
  }, [])

  .sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;

    const getTaskTime = (t: UITask) => {
      const dStr = t.deadline || t.dateStr;
      return dStr ? new Date(dStr).getTime() : Infinity;
    };

    if (sortMode === 'priority') {
      const weightA = priorityWeights[a.priority] ?? 0;
      const weightB = priorityWeights[b.priority] ?? 0;
      const diff = weightB - weightA;
      if (diff !== 0) return diff;

      // Fallback a data (dalla più vicina alla più remota)
      return getTaskTime(a) - getTaskTime(b);
    } else {
      // sortMode === 'chrono': dalla più vicina alla più remota
      const timeA = getTaskTime(a);
      const timeB = getTaskTime(b);
      const diff = timeA - timeB;
      if (diff !== 0) return diff;

      // Fallback a priorità se stessa data
      const weightA = priorityWeights[a.priority] ?? 0;
      const weightB = priorityWeights[b.priority] ?? 0;
      return weightB - weightA;
    }
  });
};