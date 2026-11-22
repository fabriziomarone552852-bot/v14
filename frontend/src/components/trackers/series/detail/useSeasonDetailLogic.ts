// src/components/trackers/series/detail/useSeasonDetailLogic.ts
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  TMDBSeries,
  TMDBEpisode,
  UserSeriesTracking,
  UserSeasonLog,
  SeriesSeasonInfo,
  UnifiedReviewData,
  ReviewComment,
} from '@/types/trackers';
import { useFriendsSeasonReviews } from '@/hooks/queries/useTrackersQueries';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useNotifications } from '@/hooks/useNotifications';
import { useConfirm } from '@/context/ConfirmContext';
import { useAuth } from '@/context/AuthContext';
import { useCommentMentions } from '@/components/trackers/shared/detail/useCommentMentions';
import { showTrackerToast } from '@/components/trackers/shared/TrackerToast';
import {
  getSeasonPersonalRating,
  roundRatingToHalfStar,
} from '@/utils/ratingUtils';
import {
  getTodayIsoDate,
  formatSeasonAirDateRange,
  computeSeasonEpisodesAverage,
  computeSeasonFriendsAverage,
  getSeasonPosterUrl,
  getSeasonDisplayTitle,
  toMySeasonUnifiedReview,
  toFriendSeasonUnifiedReview,
} from './seasonDetailUtils';

export type SeasonViewState =
  | 'main'
  | 'reviews'
  | 'form'
  | 'friends_reviews'
  | 'friend_detail'
  | 'review_detail';

interface UseSeasonDetailLogicProps {
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
  seasonNumber: number;
  seasonInfo?: SeriesSeasonInfo;
  episodes: TMDBEpisode[];
  initialView?: SeasonViewState;
  initialReviewLogId?: number;
}

export const useSeasonDetailLogic = ({
  tmdbSeries,
  userTracking,
  seasonNumber,
  seasonInfo,
  episodes,
  initialView = 'main',
  initialReviewLogId,
}: UseSeasonDetailLogicProps) => {
  const [view, setView] = useState<SeasonViewState>(initialView);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<UnifiedReviewData | null>(null);

  const { user } = useAuth();
  const { data: friendsLogsData = [] } = useFriendsSeasonReviews(tmdbSeries.tmdb_id, seasonNumber);
  const { createInteraction } = useNotifications();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();

  const { addSeasonLog, updateSeasonLog, deleteSeasonLog } = useTrackersMutations();
  const commentMentions = useCommentMentions();

  const logs: UserSeasonLog[] = useMemo(() => {
    const allLogs = tmdbSeries.season_logs || userTracking?.season_logs || [];
    return allLogs.filter((l) => l.season_number === seasonNumber);
  }, [tmdbSeries.season_logs, userTracking?.season_logs, seasonNumber]);

  // Reset view when changing season
  useEffect(() => {
    if (initialReviewLogId) {
      setView('review_detail');
    } else {
      setView(initialView);
      setSelectedReview(null);
      setSelectedFriendId(null);
    }
  }, [seasonNumber, initialView, initialReviewLogId]);

  // Deep-link navigation from Inbox notification
  useEffect(() => {
    if (
      initialReviewLogId &&
      (logs.length > 0 || friendsLogsData.length > 0) &&
      !selectedReview
    ) {
      const myLog = logs.find((l) => l.id === initialReviewLogId);
      if (myLog) {
        setSelectedReview(toMySeasonUnifiedReview(myLog, user?.id));
        setView('review_detail');
        return;
      }

      const friendLog = friendsLogsData.find((l) => l.id === initialReviewLogId);
      if (friendLog) {
        setSelectedReview(toFriendSeasonUnifiedReview(friendLog));
        setView('review_detail');
      }
    }
  }, [initialReviewLogId, logs, friendsLogsData, user, selectedReview]);

  // Keep open review comments in sync with React Query cache
  useEffect(() => {
    if (selectedReview && view === 'review_detail') {
      if (selectedReview.is_mine) {
        const updatedLog = logs.find((l) => l.id === selectedReview.id);
        if (updatedLog) {
          setSelectedReview((prev) =>
            prev ? { ...prev, comments: updatedLog.comments || [] } : null
          );
        }
      } else {
        const updatedLog = friendsLogsData.find((l) => l.id === selectedReview.id);
        if (updatedLog) {
          setSelectedReview((prev) =>
            prev ? { ...prev, comments: updatedLog.comments || [] } : null
          );
        }
      }
    }
  }, [friendsLogsData, logs, selectedReview, view]);

  // Reset comment draft when leaving or switching review
  const prevReviewIdRef = useRef<string | number | null>(null);
  const { resetComment } = commentMentions;
  useEffect(() => {
    if (view !== 'review_detail') {
      resetComment();
      prevReviewIdRef.current = null;
    } else if (selectedReview) {
      if (prevReviewIdRef.current !== null && prevReviewIdRef.current !== selectedReview.id) {
        resetComment();
      }
      prevReviewIdRef.current = selectedReview.id;
    }
  }, [view, selectedReview?.id, resetComment]);

  // Form states
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [visibility, setVisibility] = useState<string>('friends_only');
  const [reviewDate, setReviewDate] = useState<string>(getTodayIsoDate);

  const mySeasonRating = useMemo(
    () => getSeasonPersonalRating(logs, seasonNumber),
    [logs, seasonNumber]
  );

  const myEpisodesRating = useMemo(
    () => computeSeasonEpisodesAverage(episodes),
    [episodes]
  );

  const friendsAverage = useMemo(
    () => computeSeasonFriendsAverage(friendsLogsData),
    [friendsLogsData]
  );

  const tmdbSeasonValue = useMemo(() => {
    if (typeof seasonInfo?.vote_average === 'number' && seasonInfo.vote_average > 0) {
      return roundRatingToHalfStar(seasonInfo.vote_average / 2);
    }
    return null;
  }, [seasonInfo?.vote_average]);

  const seasonPosterUrl = useMemo(
    () => getSeasonPosterUrl(tmdbSeries, seasonNumber, seasonInfo),
    [tmdbSeries, seasonNumber, seasonInfo]
  );

  const seasonTitle = useMemo(
    () => getSeasonDisplayTitle(seasonNumber, seasonInfo),
    [seasonNumber, seasonInfo]
  );

  const seasonAirDateRange = useMemo(
    () => formatSeasonAirDateRange(episodes, seasonInfo?.air_date),
    [episodes, seasonInfo?.air_date]
  );

  const openNewReview = useCallback(() => {
    setEditingLogId(null);
    setRating(0);
    setReview('');
    setVisibility('friends_only');
    setReviewDate(getTodayIsoDate());
    setView('form');
  }, []);

  const openEditReview = useCallback((log: UserSeasonLog) => {
    setEditingLogId(log.id);
    setRating(log.rating ? log.rating / 2 : 0);
    setReview(log.notes || '');
    setVisibility(log.review_visibility || 'friends_only');
    setReviewDate(log.watched_at ? log.watched_at.split('T')[0] : '');
    setView('form');
  }, []);

  const handleDeleteLog = useCallback(
    (logId: number) => {
      confirm({
        title: 'Elimina recensione',
        message: 'Vuoi davvero eliminare questa recensione della stagione?',
        confirmText: 'Elimina',
        isDestructive: true,
        onConfirm: () => {
          deleteSeasonLog(logId);
          setView('reviews');
          setSelectedReview(null);
        },
      });
    },
    [confirm, deleteSeasonLog]
  );

  const handleSave = useCallback(() => {
    if (rating <= 0 && !review.trim()) {
      showTrackerToast('Inserisci almeno un voto o un commento prima di salvare', 'warning');
      return;
    }

    const payloadRating = rating > 0 ? Math.round(rating * 2) : null;
    if (editingLogId) {
      updateSeasonLog({
        log_id: editingLogId,
        payload: {
          rating: payloadRating,
          notes: review,
          review_visibility: visibility,
          watched_at: reviewDate || null,
        },
      });
    } else {
      addSeasonLog({
        tmdb_id: tmdbSeries.tmdb_id,
        season_number: seasonNumber,
        payload: {
          rating: payloadRating,
          notes: review,
          review_visibility: visibility,
          watched_at: reviewDate || null,
        },
      });
    }
    setView('reviews');
  }, [
    editingLogId,
    updateSeasonLog,
    addSeasonLog,
    tmdbSeries.tmdb_id,
    seasonNumber,
    rating,
    review,
    visibility,
    reviewDate,
  ]);

  const handleSendComment = useCallback(() => {
    const textToSend = commentMentions.commentText.trim();
    if (!textToSend || !selectedReview) return;

    const tempId = `temp-${Date.now()}`;
    const newComment: ReviewComment = {
      id: tempId,
      author_id: String(user?.id || ''),
      author_name: user?.username || 'Tu',
      author_avatar: user?.profile_picture_url || undefined,
      text: textToSend,
      created_at: new Date().toISOString(),
    };

    commentMentions.resetComment();
    setSelectedReview((prev) =>
      prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : null
    );

    createInteraction.mutate(
      {
        interaction_type: 'SEASON_REVIEW_COMMENT',
        recipient_id: Number(selectedReview.author_id),
        reference_id: Number(selectedReview.id),
        content: textToSend,
      },
      {
        onError: () => {
          showTrackerToast('Impossibile inviare il commento. Riprova.', 'warning');
          setSelectedReview((prev) =>
            prev
              ? {
                  ...prev,
                  comments: (prev.comments || []).filter((c) => c.id !== tempId),
                }
              : null
          );
          queryClient.invalidateQueries({ queryKey: ['trackers'] });
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ['trackers'] });
        },
      }
    );
  }, [
    commentMentions,
    createInteraction,
    queryClient,
    selectedReview,
    user?.id,
    user?.profile_picture_url,
    user?.username,
  ]);

  return {
    view,
    setView,
    selectedFriendId,
    setSelectedFriendId,
    selectedReview,
    setSelectedReview,
    editingLogId,
    rating,
    setRating,
    review,
    setReview,
    visibility,
    setVisibility,
    reviewDate,
    setReviewDate,
    logs,
    friendsLogsData,
    mySeasonAverage: mySeasonRating?.rating ?? null,
    mySeasonRatedCount: mySeasonRating?.count ?? 0,
    myEpisodesAverage: myEpisodesRating?.rating ?? null,
    myEpisodesRatedCount: myEpisodesRating?.count ?? 0,
    friendsAverage,
    tmdbSeasonValue,
    seasonPosterUrl,
    seasonTitle,
    seasonAirDateRange,
    openNewReview,
    openEditReview,
    handleDeleteLog,
    handleSave,
    commentMentions,
    handleSendComment,
    user,
  };
};
