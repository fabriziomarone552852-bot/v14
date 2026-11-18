// src/components/admin/habits_goals/types.ts
import type { AdminHabitItem, AdminCountdownItem } from '@/api/adminHabitsGoalsApi';

export type HabitsGoalsSubTab = 'habits' | 'routines' | 'countdowns';

export interface EnrichedAdminHabitItem extends AdminHabitItem {
  draftTitle?: string;
  draftTipo?: 'A' | 'R';
  draftTarget?: number;
  draftRrule?: string;
}

export interface EnrichedAdminCountdownItem extends AdminCountdownItem {
  draftTitle?: string;
  draftTargetDate?: string;
  draftStatus?: 'active' | 'closed';
}

export interface HabitsGoalsFeedbackMessage {
  type: 'success' | 'error';
  text: string;
}
