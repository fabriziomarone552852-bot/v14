// src/components/trackers/series/detail/seasonDetailUtils.ts
import type {
  TMDBSeries,
  TMDBEpisode,
  UserSeasonLog,
  FriendSeasonLog,
  SeriesSeasonInfo,
  UnifiedReviewData,
} from '@/types/trackers';
import { getEpisodeAverageRating, roundRatingToHalfStar } from '@/utils/ratingUtils';

export const getTodayIsoDate = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatShortItalianDate = (isoDate: string): string => {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatSeasonAirDateRange = (
  episodes: TMDBEpisode[],
  fallbackAirDate?: string | null
): string | null => {
  const validDates = episodes
    .map((ep) => ep.air_date)
    .filter((d): d is string => Boolean(d && /^\d{4}-\d{2}-\d{2}$/.test(d)))
    .sort();

  if (validDates.length === 0) {
    return fallbackAirDate && /^\d{4}-\d{2}-\d{2}$/.test(fallbackAirDate)
      ? formatShortItalianDate(fallbackAirDate)
      : null;
  }

  const first = validDates[0];
  const last = validDates[validDates.length - 1];
  if (first === last) {
    return formatShortItalianDate(first);
  }

  if (first.slice(0, 4) === last.slice(0, 4)) {
    const startWithoutYear = new Date(`${first}T00:00:00`).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
    });
    return `${startWithoutYear} - ${formatShortItalianDate(last)}`;
  }

  return `${formatShortItalianDate(first)} - ${formatShortItalianDate(last)}`;
};

export const computeSeasonEpisodesAverage = (
  episodes: TMDBEpisode[]
): { rating: number; count: number } | null => {
  let sum = 0;
  let count = 0;
  episodes.forEach((ep) => {
    const avg = getEpisodeAverageRating(ep);
    if (avg !== null) {
      sum += avg;
      count++;
    }
  });
  if (count === 0) return null;
  return {
    rating: roundRatingToHalfStar(sum / count),
    count,
  };
};

export const computeSeasonFriendsAverage = (
  friendsLogsData: FriendSeasonLog[]
): number | null => {
  const userMap: Record<string, number[]> = {};
  friendsLogsData.forEach((log) => {
    if (typeof log.rating === 'number' && log.rating > 0) {
      if (!userMap[log.friend_id]) userMap[log.friend_id] = [];
      userMap[log.friend_id].push(log.rating / 2);
    }
  });
  const userAverages = Object.values(userMap).map(
    (ratings) => ratings.reduce((a, b) => a + b, 0) / ratings.length
  );
  if (userAverages.length === 0) return null;
  const totalAvg = userAverages.reduce((a, b) => a + b, 0) / userAverages.length;
  return roundRatingToHalfStar(totalAvg);
};

export const getSeasonPosterUrl = (
  tmdbSeries: TMDBSeries,
  seasonNumber: number,
  seasonInfo?: SeriesSeasonInfo
): string => {
  if (seasonInfo?.poster_path) {
    return `https://image.tmdb.org/t/p/w500${seasonInfo.poster_path}`;
  }
  if (tmdbSeries.poster_path) {
    return `https://image.tmdb.org/t/p/w500${tmdbSeries.poster_path}`;
  }
  return `https://placehold.co/500x750/e2e8f0/64748b?text=S${seasonNumber}`;
};

export const getSeasonDisplayTitle = (
  seasonNumber: number,
  seasonInfo?: SeriesSeasonInfo
): string => {
  if (seasonNumber === 0) return 'Episodi Speciali';
  return seasonInfo?.name || `Stagione ${seasonNumber}`;
};

export const toMySeasonUnifiedReview = (
  log: UserSeasonLog,
  currentUserId?: number
): UnifiedReviewData => ({
  id: log.id,
  author_id: String(currentUserId || log.user_id || ''),
  author_name: 'Tu',
  rating: log.rating ? log.rating / 2 : 0,
  notes: log.notes || '',
  updated_at: log.watched_at || log.updated_at,
  comments: log.comments || [],
  is_mine: true,
  review_visibility: log.review_visibility,
  original_log: log,
});

export const toFriendSeasonUnifiedReview = (
  log: FriendSeasonLog
): UnifiedReviewData => ({
  id: log.id,
  author_id: String(log.friend_id),
  author_name: log.friend_name,
  author_avatar: log.friend_avatar || '',
  rating: log.rating ? log.rating / 2 : 0,
  notes: log.notes || '',
  updated_at: log.watched_at || log.updated_at,
  comments: log.comments || [],
  is_mine: false,
  review_visibility: log.review_visibility,
  original_log: log,
});
