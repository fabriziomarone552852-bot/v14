// frontend/src/utils/taskUtils.ts
import type { DbTask, TaskSummary, UITask } from '@/types';
import { getLocalTodayStr, formatDateString } from '@/utils/dateUtils';
import { getPriorityWeight } from '@/utils/calendarLayoutUtils';

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

  const todayStr = getLocalTodayStr();
  const nowMs = Date.now();
  const timeLimitMs = days * 24 * 60 * 60 * 1000;
  
  return tasks
    .filter(t => !t.fatto && !!t.data_scadenza)
    .map(t => {
      const cleanDate = t.data_scadenza ? t.data_scadenza.substring(0, 10) : "";
      return {
        task: mapTaskToSummary(t),
        cleanDate,
        time: t.data_scadenza ? new Date(cleanDate).getTime() : 0
      };
    })
    .filter(item => {
      if (item.cleanDate < todayStr) return false;
      const diff = item.time - nowMs;
      return item.cleanDate === todayStr || (diff >= 0 && diff <= timeLimitMs);
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

// --- UNIFIED BUILDER OPTIONS ---
export interface BuildTreeOptions {
  mode: 'home' | 'day' | 'month';
  todayStr: string;
  targetDateStr?: string; // Per 'day'
  firstDayStr?: string;   // Per 'month'
  lastDayStr?: string;    // Per 'month'
}

// 4.1 UNIFIED TASK TREE BUILDER
export const buildModeTaskTree = (
  flatTasks: DbTask[] | undefined,
  options: BuildTreeOptions
): UITask[] => {
  if (!flatTasks || !Array.isArray(flatTasks) || flatTasks.length === 0) return [];

  const { mode, todayStr, targetDateStr, firstDayStr, lastDayStr } = options;

  let isPast = false;
  if (mode === 'day' && targetDateStr) {
    isPast = targetDateStr < todayStr;
  } else if (mode === 'month' && lastDayStr) {
    isPast = lastDayStr < todayStr;
  }

  // --- 1. GESTIONE PASSATO ---
  if (isPast) {
    if (mode === 'day' && targetDateStr) {
      const completedOnPastDay = flatTasks.filter(
        (t) => t.fatto && getLocalDateStr(t.data_fatto) === targetDateStr
      );
      return buildTaskTree(completedOnPastDay);
    } else if (mode === 'month' && firstDayStr && lastDayStr) {
      const completedInMonth = flatTasks.filter((t) => {
        if (!t.fatto) return false;
        const dataFatto = getLocalDateStr(t.data_fatto);
        return dataFatto >= firstDayStr && dataFatto <= lastDayStr;
      });
      return buildTaskTree(completedInMonth);
    }
  }

  // --- 2. FILTRAGGIO TASK IDONEE (OGGI / FUTURO) ---
  const eligibleTasks = flatTasks.filter((t) => {
    if (t.fatto) {
      const dataFatto = getLocalDateStr(t.data_fatto);
      if (mode === 'home') {
        return dataFatto === todayStr;
      } else if (mode === 'day' && targetDateStr) {
        return dataFatto === targetDateStr;
      } else if (mode === 'month' && firstDayStr && lastDayStr) {
        const isCurrentMonth = todayStr >= firstDayStr && todayStr <= lastDayStr;
        if (isCurrentMonth) {
          return dataFatto === todayStr;
        }
        return dataFatto >= firstDayStr && dataFatto <= lastDayStr;
      }
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
      let minDeadline = getCleanDate(activeWithDeadline[0].data_scadenza);
      activeWithDeadline.forEach((t) => {
        const d = getCleanDate(t.data_scadenza);
        if (d < minDeadline) minDeadline = d;
      });

      let showImminent = false;
      if (mode === 'home') {
        showImminent = true;
      } else if (mode === 'day' && targetDateStr) {
        showImminent = minDeadline <= targetDateStr;
      } else if (mode === 'month' && lastDayStr) {
        showImminent = minDeadline <= lastDayStr;
      }

      if (showImminent) {
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
      const familyTree = buildTaskTree(family);
      resultRoots.push(...familyTree);
    }
  });

  return resultRoots;
};

// 4.2 WRAPPERS PER COMPATIBILITÀ ALL'INDIETRO
export const buildTaskTreeForHome = (
  flatTasks: DbTask[] | undefined,
  todayStr: string
): UITask[] => {
  return buildModeTaskTree(flatTasks, { mode: 'home', todayStr });
};

export const buildTaskTreeForDay = (
  flatTasks: DbTask[] | undefined,
  targetDateStr: string
): UITask[] => {
  const todayStr = getLocalTodayStr();
  return buildModeTaskTree(flatTasks, { mode: 'day', todayStr, targetDateStr });
};

export const buildTaskTreeForMonth = (
  flatTasks: DbTask[] | undefined,
  firstDayStr: string,
  lastDayStr: string
): UITask[] => {
  const todayStr = getLocalTodayStr();
  return buildModeTaskTree(flatTasks, { mode: 'month', todayStr, firstDayStr, lastDayStr });
};

const getLocalDateStr = (isoString?: string | null): string => {
  if (!isoString) return '';
  const d = new Date(isoString);
  // Se per caso la data non è valida, facciamo un fallback sicuro
  if (isNaN(d.getTime())) return isoString.substring(0, 10); 
  return formatDateString(d);
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
      const weightA = getPriorityWeight(a.priority);
      const weightB = getPriorityWeight(b.priority);
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
      const weightA = getPriorityWeight(a.priority);
      const weightB = getPriorityWeight(b.priority);
      return weightB - weightA;
    }
  });
};