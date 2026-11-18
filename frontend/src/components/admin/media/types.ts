// src/components/admin/media/types.ts
import type {
  AdminViewingPlatformItem,
  AdminMediaListItem,
  AdminMediaQuoteItem,
} from '@/api/adminMediaApi';

export type MediaAdminSubTab = 'platforms' | 'lists' | 'quotes';

export interface EnrichedAdminViewingPlatformItem extends AdminViewingPlatformItem {
  draftName?: string;
}

export interface EnrichedAdminMediaListItem extends AdminMediaListItem {
  draftName?: string;
  draftDescription?: string | null;
  draftVisibility?: string;
}

export interface EnrichedAdminMediaQuoteItem extends AdminMediaQuoteItem {
  draftQuoteText?: string;
}

export interface MediaFeedbackMessage {
  type: 'success' | 'error';
  text: string;
}
