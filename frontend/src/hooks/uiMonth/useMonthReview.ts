// frontend/src/hooks/uiMonth/useMonthReview.ts
import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { useCategories } from '@/hooks/useCategories';
import { useMonthlyEntryMutations } from '@/hooks/mutations/useMonthlyEntryMutations';
import type { MonthCacheData } from '@/hooks/useAgendaMonth';
import type { DbMonthlyEntry, MonthlyType, TrackerItem } from '@/types/monthlyentries';
import type { DailyEntry } from '@/types/dailyentries';
import type { DbTask } from '@/types/tasks';
import type { Habit } from '@/types/habits';
import type { Category } from '@/types/categories';
import { MOOD_NAMES, SPHERE_NAMES, getNumericValue } from '@/types/monthlyentries';
import { getTrackerColor, TRACKER_CODES } from '@/utils/trackerUtils';

export type ReviewSidebarTab = 'events' | 'tasks' | 'habits';

/** Risposta dell'endpoint /sync/month-review */
interface MonthReviewApiResponse {
  year: number;
  month: number;
  habits: Habit[];
  weekly_positive_events: DailyEntry[];
  weekly_negative_events: DailyEntry[];
  tasks_completed: number;
  tasks_total: number;
}

/** Dati aggregati per il MonthReviewModal */
export interface MonthReviewData {
  monthlyEntries: DbMonthlyEntry[];
  monthlyPositive: DbMonthlyEntry[];
  monthlyNegative: DbMonthlyEntry[];
  weeklyPositive: DailyEntry[];
  weeklyNegative: DailyEntry[];
  completedTasks: DbTask[];
  tasksCompleted: number;
  tasksTotal: number;
  habits: Habit[];
  // Tag
  assignedTags: Category[];
  allTags: Category[];
  tagEntryMap: Record<number, number>;
  onAddTag: (categoryId: number) => void;
  onCreateAndAddTag: (tagName: string) => void;
  onRemoveTag: (monthlyEntryId: number) => void;
}

export const useMonthReview = (
  monthData: MonthCacheData | undefined,
  monthTargetDate: Date,
  queryKey: string[],
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ReviewSidebarTab | null>(null);

  const year = monthTargetDate.getFullYear();
  const month = monthTargetDate.getMonth() + 1;
  const firstDayStr = `${year}-${String(month).padStart(2, '0')}-01`;

  const { saveMonthlyEntry, deleteMonthlyEntry } = useMonthlyEntryMutations(queryKey);
  const { data: dbCategories = [] } = useCategories();
  const queryClient = useQueryClient();

  // Controlla se è un mese passato
  const now = new Date();
  const isPastMonth = new Date(year, month - 1, 1) < new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch dati review (solo quando il modale è aperto)
  const { data: reviewApiData } = useQuery({
    queryKey: ['monthReview', year, month],
    queryFn: async (): Promise<MonthReviewApiResponse> => {
      const data = await api.get<MonthReviewApiResponse>(`/sync/month-review?year=${year}&month=${month}`);
      if (!data) throw new Error('Impossibile caricare i dati di review');
      return data;
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Review status: 'filled' se almeno un Q1-Q6 ha contenuto
  const reviewStatus = useMemo((): 'none' | 'empty' | 'filled' => {
    if (!isPastMonth) return 'none';
    const entries = monthData?.monthly_entries || [];
    const hasAnswer = entries.some(
      e => ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'].includes(e.monthly_type) && e.monthly_field?.trim()
    );
    return hasAnswer ? 'filled' : 'empty';
  }, [isPastMonth, monthData?.monthly_entries]);

  // Mood e sfere per i grafici read-only — mese recensito + mese precedente
  const moodsUI = useMemo((): TrackerItem[] => {
    const entries = monthData?.monthly_entries || [];
    const prevEntries = monthData?.prev_monthly_entries || [];
    return MOOD_NAMES.map(nome => {
      const code = TRACKER_CODES[nome];
      const cur = entries.find(v => v.monthly_type === code);
      const prev = prevEntries.find(v => v.monthly_type === code);
      return {
        id: code, name: nome, category: 'MOOD' as const,
        colorHex: getTrackerColor(nome),
        currentValue: cur ? getNumericValue(cur) : 0,
        previousValue: prev ? getNumericValue(prev) : 0,
      };
    });
  }, [monthData?.monthly_entries, monthData?.prev_monthly_entries]);

  const spheresUI = useMemo((): TrackerItem[] => {
    const entries = monthData?.monthly_entries || [];
    const prevEntries = monthData?.prev_monthly_entries || [];
    return SPHERE_NAMES.map(nome => {
      const code = TRACKER_CODES[nome];
      const cur = entries.find(v => v.monthly_type === code);
      const prev = prevEntries.find(v => v.monthly_type === code);
      return {
        id: code, name: nome, category: 'SPHERE' as const,
        colorHex: getTrackerColor(nome),
        currentValue: cur ? getNumericValue(cur) : 0,
        previousValue: prev ? getNumericValue(prev) : 0,
      };
    });
  }, [monthData?.monthly_entries, monthData?.prev_monthly_entries]);


  // Tag: categorie con genre=5 (TAG)
  const allTags = useMemo(() => dbCategories.filter(c => c.genre === 5), [dbCategories]);

  const tagEntries = useMemo(
    () => (monthData?.monthly_entries || [])
      .filter(e => e.monthly_type === 'TG')
      .sort((a, b) => Math.abs(a.id) - Math.abs(b.id)),
    [monthData?.monthly_entries]
  );

  const assignedTags = useMemo(() => {
    return tagEntries
      .map(te => {
        const catId = parseInt(te.monthly_field ?? '', 10);
        // Cerca sia in allTags che con ID negativi (temporanei)
        return dbCategories.find(t => t.id === catId);
      })
      .filter((t): t is Category => !!t);
  }, [tagEntries, dbCategories]);

  const tagEntryMap = useMemo(() => {
    const map: Record<number, number> = {};
    tagEntries.forEach(te => {
      const catId = parseInt(te.monthly_field ?? '', 10);
      if (!isNaN(catId)) map[catId] = te.id;
    });
    return map;
  }, [tagEntries]);

  // Task completate nel mese (dal monthData già in cache)
  const completedTasks = useMemo((): DbTask[] => {
    const tasks = monthData?.tasks || [];
    return tasks.filter(t => {
      if (!t.fatto || !t.data_fatto) return false;
      const d = new Date(t.data_fatto);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }, [monthData?.tasks, year, month]);

  // Handler salvataggio Q1-Q6
  const handleSaveAnswer = useCallback((code: MonthlyType, text: string, existingId?: number) => {
    saveMonthlyEntry({
      monthly_type: code,
      monthly_field: text,
      dateStr: firstDayStr,
      existingEntryId: existingId,
    });
  }, [saveMonthlyEntry, firstDayStr]);

  // Handler tag — aggiunge un tag da una categoria GIÀ esistente
  const handleAddTag = useCallback((categoryId: number) => {
    saveMonthlyEntry({
      monthly_type: 'TG' as MonthlyType,
      monthly_field: String(categoryId),
      dateStr: firstDayStr,
    });
  }, [saveMonthlyEntry, firstDayStr]);

  // Handler crea nuovo tag — ottimistico: mostra subito, API in background
  const handleCreateAndAddTag = useCallback((tagName: string) => {
    // Se esiste già un tag (genre=5) con lo stesso nome, usalo
    const existing = allTags.find(
      t => t.category_name.toLowerCase() === tagName.toLowerCase()
    );
    if (existing) {
      handleAddTag(existing.id);
      return;
    }

    const tempCatId = -(Date.now());
    const tempEntryId = tempCatId - 1;

    // 1. Inietta categoria temporanea nella cache
    const tempCategory: Category = {
      id: tempCatId,
      category_name: tagName.trim().toLowerCase(),
      colore: '#6366f1',
      user_id: null,
      genre: 5,
    };
    queryClient.setQueryData<Category[]>(['categories'], (old) =>
      old ? [...old, tempCategory] : [tempCategory]
    );

    // 2. Inietta monthly entry TG temporaneo nella cache (SOLO cache, NO chiamata API)
    queryClient.setQueryData(queryKey, (old: Record<string, unknown> | undefined) => {
      if (!old) return old;
      const entries = (old.monthly_entries as DbMonthlyEntry[]) || [];
      const tempEntry: DbMonthlyEntry = {
        id: tempEntryId,
        user_id: 0,
        year,
        month,
        monthly_type: 'TG' as MonthlyType,
        monthly_field: String(tempCatId),
      };
      return { ...old, monthly_entries: [...entries, tempEntry] };
    });

    // 3. In background: crea categoria VERA → poi crea monthly entry VERO
    api.post<Category>('/categories', {
      category_name: tagName,
      colore: '#6366f1',
      genre: 5,
    }).then(newCat => {
      if (!newCat) throw new Error('Creazione categoria fallita');

      // Aggiorna categoria E monthly_field insieme → zero flash
      queryClient.setQueryData<Category[]>(['categories'], (old) =>
        (old || []).map(c => c.id === tempCatId ? newCat : c)
      );
      queryClient.setQueryData(queryKey, (old: Record<string, unknown> | undefined) => {
        if (!old) return old;
        const entries = (old.monthly_entries as DbMonthlyEntry[]) || [];
        return {
          ...old,
          monthly_entries: entries.map(e =>
            e.id === tempEntryId
              ? { ...e, monthly_field: String(newCat.id) }
              : e
          ),
        };
      });

      // Crea il monthly entry VERO con l'ID categoria reale
      return api.post<DbMonthlyEntry>('/monthly-entries', {
        year,
        month,
        monthly_type: 'TG',
        monthly_field: String(newCat.id),
      }).then(realEntry => {
        if (!realEntry) return;
        // Sostituisci l'entry temporaneo con quello reale
        queryClient.setQueryData(queryKey, (old: Record<string, unknown> | undefined) => {
          if (!old) return old;
          const entries = (old.monthly_entries as DbMonthlyEntry[]) || [];
          return {
            ...old,
            monthly_entries: entries.map(e => e.id === tempEntryId ? realEntry : e),
          };
        });
      });
    }).catch(err => {
      console.error('Errore creazione tag:', err);
      // Rollback: rimuovi temporanei
      queryClient.setQueryData<Category[]>(['categories'], (old) =>
        (old || []).filter(c => c.id !== tempCatId)
      );
      queryClient.setQueryData(queryKey, (old: Record<string, unknown> | undefined) => {
        if (!old) return old;
        const entries = (old.monthly_entries as DbMonthlyEntry[]) || [];
        return { ...old, monthly_entries: entries.filter(e => e.id !== tempEntryId) };
      });
    });
  }, [handleAddTag, allTags, queryClient, queryKey, year, month]);

  const handleRemoveTag = useCallback((monthlyEntryId: number) => {
    deleteMonthlyEntry(monthlyEntryId);
  }, [deleteMonthlyEntry]);

  // Dati aggregati per il modal
  const reviewData = useMemo((): MonthReviewData => {
    const entries = monthData?.monthly_entries || [];
    return {
      monthlyEntries: entries,
      monthlyPositive: entries.filter(e => e.monthly_type === 'EP'),
      monthlyNegative: entries.filter(e => e.monthly_type === 'EN'),
      weeklyPositive: reviewApiData?.weekly_positive_events || [],
      weeklyNegative: reviewApiData?.weekly_negative_events || [],
      completedTasks,
      tasksCompleted: reviewApiData?.tasks_completed ?? completedTasks.length,
      tasksTotal: reviewApiData?.tasks_total ?? (monthData?.tasks?.length || 0),
      habits: reviewApiData?.habits || [],
      assignedTags,
      allTags,
      tagEntryMap,
      onAddTag: handleAddTag,
      onCreateAndAddTag: handleCreateAndAddTag,
      onRemoveTag: handleRemoveTag,
    };
  }, [monthData, reviewApiData, completedTasks, assignedTags, allTags, tagEntryMap, handleAddTag, handleCreateAndAddTag, handleRemoveTag]);

  return {
    isOpen,
    openReview: useCallback(() => { setIsOpen(true); setActiveTab(null); }, []),
    closeReview: useCallback(() => setIsOpen(false), []),
    reviewStatus,
    activeTab,
    setActiveTab,
    reviewData,
    moodsUI,
    spheresUI,
    handleSaveAnswer,
  };
};
