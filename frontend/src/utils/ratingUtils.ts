// src/utils/ratingUtils.ts
import type { TVSeries } from '@/types/trackers';

/**
 * Calcola il rating medio di una serie TV partendo dai suoi log.
 * Se non ci sono log validi, utilizza il rating base della serie.
 * Converte i voti in scala 1-5 se sono su scala 1-10.
 */
export const calculateSeriesRating = (s: TVSeries): number => {
  const validLogs = s.logs ? s.logs.filter((l) => l.rating !== null && l.rating !== undefined && Number(l.rating) > 0) : [];
  
  if (validLogs.length > 0) {
    const sum = validLogs.reduce((acc, l) => acc + (Number(l.rating) / 2), 0);
    return sum / validLogs.length;
  }
  
  if (s.rating !== undefined && s.rating !== null) {
    const r = Number(s.rating);
    return r > 5 ? r / 2 : r;
  }
  
  return 0;
};

export interface BaseFriendReviewInput {
  friend_id: string | number;
  friend_name: string;
  friend_avatar?: string | null;
  rating?: number | null;
}

export interface AggregatedFriendReviewer {
  id: string | number;
  name: string;
  avatar?: string | null;
  ratings: number[];
  average: number | null;
}

/**
 * Raggruppa i log delle recensioni degli amici per friend_id, calcola
 * la media in scala 1-5 e applica l'arrotondamento ai quarti/mezzi di stella (DRY).
 * Utilizzato uniformemente da SeriesReviewTab e EpisodeDetailView.
 */
export const aggregateFriendsReviews = <T extends BaseFriendReviewInput>(
  logs: T[]
): AggregatedFriendReviewer[] => {
  const userMap: Record<
    string,
    { id: string | number; name: string; avatar?: string | null; ratings: number[] }
  > = {};

  logs.forEach((log) => {
    const fId = String(log.friend_id);
    if (!userMap[fId]) {
      userMap[fId] = {
        id: log.friend_id,
        name: log.friend_name,
        avatar: log.friend_avatar,
        ratings: [],
      };
    }
    if (typeof log.rating === 'number') {
      userMap[fId].ratings.push(log.rating / 2);
    }
  });

  return Object.values(userMap)
    .map((u) => {
      const avg = u.ratings.length > 0 ? u.ratings.reduce((a, b) => a + b, 0) / u.ratings.length : null;
      let roundedAvg = avg;
      if (avg !== null) {
        const fractional = avg - Math.floor(avg);
        roundedAvg = Math.floor(avg);
        if (fractional >= 0.25 && fractional <= 0.75) roundedAvg += 0.5;
        else if (fractional > 0.75) roundedAvg += 1.0;
      }
      return { ...u, average: roundedAvg };
    })
    .filter((u) => u.average !== null);
};
