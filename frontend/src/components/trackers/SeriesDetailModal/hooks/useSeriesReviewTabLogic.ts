import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  TMDBSeries,
  UserSeriesTracking,
  TMDBEpisode,
  UserSeriesLog,
  UnifiedReviewData,
  SeriesQuote,
} from '@/types/trackers';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useFriendsSeriesReviews } from '@/hooks/queries/useTrackersQueries';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/AuthContext';
import { useCommentMentions } from '../shared/useCommentMentions';

export type SeriesReviewViewState =
  | 'main'
  | 'form'
  | 'friends_reviews'
  | 'friend_detail'
  | 'my_reviews'
  | 'review_detail';

interface UseSeriesReviewTabLogicProps {
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
  initialReviewLogId?: number;
}

export const useSeriesReviewTabLogic = ({
  tmdbSeries,
  userTracking,
  initialReviewLogId,
}: UseSeriesReviewTabLogicProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [view, setView] = useState<SeriesReviewViewState>(initialReviewLogId ? 'review_detail' : 'main');
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<UnifiedReviewData | null>(null);

  const { addSeriesLog, updateSeriesLog, deleteSeriesLog } = useTrackersMutations();
  const { data: friendsLogsData = [] } = useFriendsSeriesReviews(tmdbSeries.tmdb_id);
  const { createInteraction } = useNotifications();

  const commentMentions = useCommentMentions();

  const SERIES_QUOTES = useMemo(() => {
    if (!tmdbSeries.episodes) return [];

    return tmdbSeries.episodes.reduce((acc, ep) => {
      if (ep.quotes && ep.quotes.length > 0) {
        const epQuotes = ep.quotes.map((q: SeriesQuote) => ({
          id: String(q.id),
          text: q.quote_text,
          episodeStr: `S${ep.season_number}E${ep.episode_number}`,
          episodeData: ep,
        }));
        return [...acc, ...epQuotes];
      }
      return acc;
    }, [] as { id: string; text: string; episodeStr: string; episodeData: TMDBEpisode }[]);
  }, [tmdbSeries.episodes]);

  const logs: UserSeriesLog[] = useMemo(() => {
    if (userTracking && userTracking.logs && userTracking.logs.length > 0) {
      return userTracking.logs.map((log) => ({
        id: log.id,
        user_id: log.user_id,
        series_tmdb_id: log.series_tmdb_id,
        rating: (log.rating || 0) / 2,
        notes: log.notes || '',
        review_visibility: log.review_visibility || 'friends_only',
        watched_at: log.watched_at || new Date().toISOString(),
        updated_at: log.updated_at || new Date().toISOString(),
        comments: log.comments || [],
      }));
    }
    return [];
  }, [userTracking]);

  // Initial review navigation
  useEffect(() => {
    if (
      initialReviewLogId &&
      (logs.length > 0 || friendsLogsData.length > 0) &&
      !selectedReview
    ) {
      const myLog = logs.find((l) => l.id === initialReviewLogId);
      if (myLog) {
        setSelectedReview({
          id: myLog.id,
          author_id: String(user?.id || ''),
          author_name: 'Tu',
          rating: myLog.rating || 0,
          notes: myLog.notes || '',
          updated_at: myLog.updated_at || new Date().toISOString(),
          comments: myLog.comments || [],
          is_mine: true,
          review_visibility: myLog.review_visibility,
          original_log: myLog,
        });
        setView('review_detail');
        return;
      }

      const friendLog = friendsLogsData.find((l) => l.id === initialReviewLogId);
      if (friendLog) {
        setSelectedReview({
          id: friendLog.id,
          author_id: friendLog.friend_id,
          author_name: friendLog.friend_name,
          author_avatar: friendLog.friend_avatar,
          rating: (friendLog.rating || 0) / 2,
          notes: friendLog.notes || '',
          updated_at: friendLog.updated_at,
          comments: friendLog.comments || [],
          is_mine: false,
          review_visibility: friendLog.review_visibility,
          original_log: friendLog,
        });
        setView('review_detail');
      }
    }
  }, [initialReviewLogId, logs, friendsLogsData, user, view]);

  // Keep selected review updated with fresh comments
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

  // Form state
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [visibility, setVisibility] = useState<string>(
    userTracking?.review_visibility || 'friends_only'
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [reviewDate, setReviewDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Delete modal state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [logToDeleteId, setLogToDeleteId] = useState<number | null>(null);

  const tmdbValue =
    typeof tmdbSeries.vote_average === 'number' ? tmdbSeries.vote_average / 2 : null;

  const myAverage = useMemo(() => {
    const ratedLogs = logs.filter((l) => typeof l.rating === 'number');
    if (ratedLogs.length === 0) return null;
    const sum = ratedLogs.reduce((acc, l) => acc + (l.rating || 0), 0);
    return sum / ratedLogs.length;
  }, [logs]);

  const friendsAverage = useMemo(() => {
    const userMap: Record<string, number[]> = {};
    friendsLogsData.forEach((log) => {
      if (typeof log.rating === 'number') {
        if (!userMap[log.friend_id]) userMap[log.friend_id] = [];
        userMap[log.friend_id].push(log.rating / 2);
      }
    });
    const userAverages = Object.values(userMap).map(
      (ratings) => ratings.reduce((a, b) => a + b, 0) / ratings.length
    );
    if (userAverages.length === 0) return null;
    const totalAvg = userAverages.reduce((a, b) => a + b, 0) / userAverages.length;

    const fractional = totalAvg - Math.floor(totalAvg);
    let roundedAvg = Math.floor(totalAvg);
    if (fractional >= 0.25 && fractional <= 0.75) roundedAvg += 0.5;
    else if (fractional > 0.75) roundedAvg += 1.0;

    return roundedAvg;
  }, [friendsLogsData]);

  const openNewReview = useCallback(() => {
    setEditingLogId(null);
    setRating(0);
    setReview('');
    setVisibility('friends_only');
    const d = new Date();
    setReviewDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`
    );
    setView('form');
  }, []);

  const openEditReview = useCallback((log: UserSeriesLog) => {
    setEditingLogId(log.id);
    setRating(log.rating || 0);
    setReview(log.notes || '');
    setVisibility(log.review_visibility || 'friends_only');
    setReviewDate(log.updated_at ? log.updated_at.split('T')[0] : '');
    setView('form');
  }, []);

  const confirmDeleteLog = useCallback((id: number) => {
    setLogToDeleteId(id);
    setIsDeleteDialogOpen(true);
  }, []);

  const executeDeleteLog = useCallback(() => {
    if (logToDeleteId) {
      deleteSeriesLog(logToDeleteId);
    }
    setIsDeleteDialogOpen(false);
    setLogToDeleteId(null);
    setView('main');
  }, [deleteSeriesLog, logToDeleteId]);

  const cancelDeleteLog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setLogToDeleteId(null);
  }, []);

  const handleSave = useCallback(() => {
    if (editingLogId) {
      updateSeriesLog({
        log_id: editingLogId,
        payload: {
          rating: rating > 0 ? Math.round(rating * 2) : null,
          notes: review,
          review_visibility: visibility,
          watched_at: reviewDate,
        },
      });
    } else {
      addSeriesLog({
        tmdb_id: tmdbSeries.tmdb_id,
        payload: {
          rating: rating > 0 ? Math.round(rating * 2) : null,
          notes: review,
          review_visibility: visibility,
          watched_at: reviewDate,
        },
      });
    }
    setView('my_reviews');
  }, [
    editingLogId,
    updateSeriesLog,
    rating,
    review,
    visibility,
    reviewDate,
    addSeriesLog,
    tmdbSeries.tmdb_id,
  ]);

  const handleSendComment = useCallback(async () => {
    if (!commentMentions.commentText.trim() || !selectedReview) return;
    await createInteraction.mutateAsync({
      interaction_type: 'SERIES_REVIEW_COMMENT',
      recipient_id: Number(selectedReview.author_id),
      reference_id: Number(selectedReview.id),
      content: commentMentions.commentText.trim(),
    });
    commentMentions.resetComment();
    queryClient.invalidateQueries({ queryKey: ['trackers'] });
  }, [commentMentions, createInteraction, queryClient, selectedReview]);

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
    isDropdownOpen,
    setIsDropdownOpen,
    isDatePickerOpen,
    setIsDatePickerOpen,
    isDeleteDialogOpen,
    confirmDeleteLog,
    executeDeleteLog,
    cancelDeleteLog,
    SERIES_QUOTES,
    logs,
    friendsLogsData,
    tmdbValue,
    myAverage,
    friendsAverage,
    openNewReview,
    openEditReview,
    handleSave,
    commentMentions,
    handleSendComment,
    user,
  };
};
