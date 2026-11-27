// src/utils/notificationUtils.ts
import type { NotificationResponse } from '@/types/notifications';

export type NotificationCategory = 'shopping' | 'media' | 'system';

export interface NotificationBadgeMeta {
  label: string;
  category: NotificationCategory;
  badgeClass: string;
  dotClass: string;
}

export interface NotificationNavigationTarget {
  route: string;
  loadingMessage: string;
}

export const getNotificationCategory = (interactionType: string): NotificationCategory => {
  if (
    interactionType === 'SHOPPING_GROUP_INVITE' ||
    interactionType === 'SHOPPING_GROUP_NEW_LIST'
  ) {
    return 'shopping';
  }

  if (
    interactionType.startsWith('SERIES_REVIEW_') ||
    interactionType.startsWith('SEASON_REVIEW_') ||
    interactionType.startsWith('EPISODE_REVIEW_') ||
    interactionType.startsWith('MOVIE_REVIEW_')
  ) {
    return 'media';
  }

  return 'system';
};

export const formatNotificationMessage = (notif: NotificationResponse): string => {
  const author = notif.author_name || 'Qualcuno';

  switch (notif.interaction_type) {
    case 'SERIES_REVIEW_COMMENT':
      return `${author} ha commentato la tua recensione di ${notif.context_title || 'una serie'}`;
    case 'SERIES_REVIEW_COMMENT_THREAD':
      return `${author} ha partecipato alla discussione sulla recensione di ${notif.context_title || 'una serie'}`;
    case 'SERIES_REVIEW_MENTION':
      return `${author} ti ha menzionato nella recensione di ${notif.context_title || 'una serie'}`;

    case 'SEASON_REVIEW_COMMENT':
      return `${author} ha commentato la tua recensione di ${notif.context_title || 'una stagione'}`;
    case 'SEASON_REVIEW_COMMENT_THREAD':
      return `${author} ha partecipato alla discussione sulla recensione di ${notif.context_title || 'una stagione'}`;
    case 'SEASON_REVIEW_MENTION':
      return `${author} ti ha menzionato nella recensione di ${notif.context_title || 'una stagione'}`;

    case 'EPISODE_REVIEW_COMMENT':
      return `${author} ha commentato la tua recensione dell'episodio ${notif.context_title || ''}`.trim();
    case 'EPISODE_REVIEW_COMMENT_THREAD':
      return `${author} ha partecipato alla discussione sulla recensione dell'episodio ${notif.context_title || ''}`.trim();
    case 'EPISODE_REVIEW_MENTION':
      return `${author} ti ha menzionato nella recensione dell'episodio ${notif.context_title || ''}`.trim();

    case 'MOVIE_REVIEW_COMMENT':
      return `${author} ha commentato la tua recensione di ${notif.context_title || 'un film'}`;
    case 'MOVIE_REVIEW_COMMENT_THREAD':
      return `${author} ha partecipato alla discussione sulla recensione di ${notif.context_title || 'un film'}`;
    case 'MOVIE_REVIEW_MENTION':
      return `${author} ti ha menzionato nella recensione di ${notif.context_title || 'un film'}`;

    default:
      return notif.content;
  }
};

export const getNotificationTypeBadge = (interactionType: string): NotificationBadgeMeta => {
  const category = getNotificationCategory(interactionType);

  switch (interactionType) {
    case 'SHOPPING_GROUP_INVITE':
      return {
        label: 'Invito Gruppo Spesa',
        category,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'SHOPPING_GROUP_NEW_LIST':
      return {
        label: 'Nuova Lista Spesa',
        category,
        badgeClass: 'bg-lime-50 text-lime-700 border-lime-200',
        dotClass: 'bg-lime-500',
      };
    case 'SYSTEM_ALERT':
      return {
        label: 'Avviso di Sistema',
        category,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'SERIES_REVIEW_COMMENT':
    case 'SERIES_REVIEW_COMMENT_THREAD':
      return {
        label: 'Commento Serie TV',
        category,
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dotClass: 'bg-indigo-500',
      };
    case 'SERIES_REVIEW_MENTION':
      return {
        label: 'Menzione Serie TV',
        category,
        badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
        dotClass: 'bg-violet-500',
      };
    case 'SEASON_REVIEW_COMMENT':
    case 'SEASON_REVIEW_COMMENT_THREAD':
      return {
        label: 'Commento Stagione',
        category,
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dotClass: 'bg-indigo-500',
      };
    case 'SEASON_REVIEW_MENTION':
      return {
        label: 'Menzione Stagione',
        category,
        badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
        dotClass: 'bg-violet-500',
      };
    case 'EPISODE_REVIEW_COMMENT':
    case 'EPISODE_REVIEW_COMMENT_THREAD':
      return {
        label: 'Commento Episodio',
        category,
        badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
        dotClass: 'bg-sky-500',
      };
    case 'EPISODE_REVIEW_MENTION':
      return {
        label: 'Menzione Episodio',
        category,
        badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
        dotClass: 'bg-violet-500',
      };
    case 'MOVIE_REVIEW_COMMENT':
    case 'MOVIE_REVIEW_COMMENT_THREAD':
      return {
        label: 'Commento Film',
        category,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    case 'MOVIE_REVIEW_MENTION':
      return {
        label: 'Menzione Film',
        category,
        badgeClass: 'bg-pink-50 text-pink-700 border-pink-200',
        dotClass: 'bg-pink-500',
      };
    default:
      return {
        label: interactionType.replace(/_/g, ' '),
        category,
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        dotClass: 'bg-slate-400',
      };
  }
};

export const getNotificationNavigationTarget = (
  interaction: NotificationResponse
): NotificationNavigationTarget | null => {
  switch (interaction.interaction_type) {
    case 'SHOPPING_GROUP_INVITE':
      return {
        route: `/shopping?openGroup=${interaction.reference_id}`,
        loadingMessage: 'Apertura gruppo spesa...',
      };
    case 'SHOPPING_GROUP_NEW_LIST':
      return {
        route: `/shopping?listId=${interaction.reference_id}`,
        loadingMessage: 'Apertura lista della spesa...',
      };
    case 'SERIES_REVIEW_COMMENT':
    case 'SERIES_REVIEW_COMMENT_THREAD':
    case 'SERIES_REVIEW_MENTION':
      if (!interaction.series_tmdb_id) return null;
      return {
        route: `/trackers/serie-tv?tmdb_id=${interaction.series_tmdb_id}&open_review=true&open_review_log_id=${interaction.reference_id}`,
        loadingMessage: 'Apertura recensione...',
      };
    case 'EPISODE_REVIEW_COMMENT':
    case 'EPISODE_REVIEW_COMMENT_THREAD':
    case 'EPISODE_REVIEW_MENTION':
      if (!interaction.series_tmdb_id) return null;
      return {
        route: `/trackers/serie-tv?tmdb_id=${interaction.series_tmdb_id}&open_episode=${interaction.episode_id}&open_review_log_id=${interaction.reference_id}`,
        loadingMessage: 'Apertura recensione...',
      };
    case 'SEASON_REVIEW_COMMENT':
    case 'SEASON_REVIEW_COMMENT_THREAD':
    case 'SEASON_REVIEW_MENTION':
      if (!interaction.series_tmdb_id) return null;
      return {
        route: `/trackers/serie-tv?tmdb_id=${interaction.series_tmdb_id}&open_season=${interaction.season_number ?? 1}&open_review_log_id=${interaction.reference_id}`,
        loadingMessage: 'Apertura recensione...',
      };
    case 'MOVIE_REVIEW_COMMENT':
    case 'MOVIE_REVIEW_COMMENT_THREAD':
    case 'MOVIE_REVIEW_MENTION':
      if (!interaction.movie_tmdb_id) return null;
      return {
        route: `/trackers/film?tmdb_id=${interaction.movie_tmdb_id}&open_review=true&open_review_log_id=${interaction.reference_id}`,
        loadingMessage: 'Apertura recensione...',
      };
    default:
      return null;
  }
};
