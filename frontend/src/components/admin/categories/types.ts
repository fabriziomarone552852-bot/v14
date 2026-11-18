// src/components/admin/categories/types.ts
import type { AdminCategoryItem, CategoryGenreCode } from '@/api/adminCategoriesApi';

export type AdminCategorySubTab = 'all' | 'categories' | 'tags' | 'mood';

export interface EnrichedAdminCategoryItem extends AdminCategoryItem {
  draftName?: string;
  draftColor?: string;
  draftGenre?: CategoryGenreCode;
}

export interface AdminCategoryFeedbackMessage {
  type: 'success' | 'error';
  text: string;
}

export const GENRE_LABELS: Record<CategoryGenreCode, { label: string; badgeClass: string }> = {
  1: { label: 'Attività', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  2: { label: 'Eventi', badgeClass: 'bg-violet-50 text-violet-800 border-violet-200' },
  3: { label: 'Comune', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' },
  4: { label: 'Umore', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  5: { label: 'Tag', badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
};
