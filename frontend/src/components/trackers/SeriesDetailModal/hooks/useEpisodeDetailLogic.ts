import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  TMDBEpisode,
  TMDBSeries,
  UserEpisodeLog,
  UnifiedReviewData,
} from '@/types/trackers';
import { useFriendsEpisodeReviews } from '@/hooks/queries/useTrackersQueries';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useNotifications } from '@/hooks/useNotifications';
import { useConfirm } from '@/context/ConfirmContext';
import { useAuth } from '@/context/AuthContext';
import { useCommentMentions } from '../shared/useCommentMentions';

export type EpisodeViewState =
  | 'main'
  | 'reviews'
  | 'form'
  | 'friends_reviews'
  | 'friend_detail'
  | 'quotes'
  | 'review_detail';

interface UseEpisodeDetailLogicProps {
  episode: TMDBEpisode;
  tmdbSeries?: TMDBSeries;
  logs: UserEpisodeLog[];
  initialView?: EpisodeViewState;
  initialReviewLogId?: number;
}

export const useEpisodeDetailLogic = ({
  episode,
  tmdbSeries,
  logs,
  initialView = 'main',
  initialReviewLogId,
}: UseEpisodeDetailLogicProps) => {
  const [view, setView] = useState<EpisodeViewState>(initialView);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<UnifiedReviewData | null>(null);

  const { user } = useAuth();
  const { data: friendsLogsData = [] } = useFriendsEpisodeReviews(episode.id);
  const { createInteraction } = useNotifications();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();

  const {
    toggleEpisodeWatched,
    addEpisodeLog,
    updateEpisodeLog,
    deleteEpisodeLog,
    addQuote,
    updateQuote,
    deleteQuote,
  } = useTrackersMutations();

  const commentMentions = useCommentMentions();

  // Initial review navigation
  useEffect(() => {
    if (
      initialReviewLogId &&
      (logs.length > 0 || friendsLogsData.length > 0) &&
      view !== 'review_detail'
    ) {
      const myLog = logs.find((l) => l.id === initialReviewLogId);
      if (myLog) {
        setSelectedReview({
          id: myLog.id,
          author_id: String(user?.id || ''),
          author_name: 'Tu',
          rating: (myLog.rating || 0) / 2,
          notes: myLog.notes || '',
          updated_at: myLog.watched_at,
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
          updated_at: friendLog.watched_at,
          comments: friendLog.comments || [],
          is_mine: false,
          review_visibility: friendLog.review_visibility,
          original_log: friendLog,
        });
        setView('review_detail');
      }
    }
  }, [initialReviewLogId, logs, friendsLogsData, user, view]);

  // Sync selected review with fresh comments
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

  // Form states
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [visibility, setVisibility] = useState<string>('friends_only');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [reviewDate, setReviewDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const myAverage = useMemo(() => {
    const ratedLogs = logs.filter((l) => typeof l.rating === 'number');
    if (ratedLogs.length === 0) return null;
    const sum = ratedLogs.reduce((acc, l) => acc + (l.rating || 0) / 2, 0);
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

  const tmdbValue =
    typeof episode.vote_average === 'number' ? episode.vote_average / 2 : null;

  const imagePlaceholder = useMemo(() => {
    if (episode.still_path) return `https://image.tmdb.org/t/p/w500${episode.still_path}`;
    if (tmdbSeries?.backdrop_path)
      return `https://image.tmdb.org/t/p/w1280${tmdbSeries.backdrop_path}`;
    if (tmdbSeries?.poster_path)
      return `https://image.tmdb.org/t/p/w500${tmdbSeries.poster_path}`;
    return `https://placehold.co/600x338/e2e8f0/64748b?text=S${episode.season_number}E${episode.episode_number}`;
  }, [episode, tmdbSeries]);

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

  const openEditReview = useCallback((log: UserEpisodeLog) => {
    setEditingLogId(log.id);
    setRating((log.rating || 0) / 2);
    setReview(log.notes || '');
    setVisibility(log.review_visibility || 'friends_only');
    setReviewDate(log.watched_at ? log.watched_at.split('T')[0] : '');
    setView('form');
  }, []);

  const handleDeleteLog = useCallback(
    (logId: number) => {
      confirm({
        title: 'Elimina recensione',
        message: 'Vuoi davvero eliminare questa recensione?',
        confirmText: 'Elimina',
        isDestructive: true,
        onConfirm: () => {
          deleteEpisodeLog(logId);
          setView('reviews');
          setSelectedReview(null);
        },
      });
    },
    [confirm, deleteEpisodeLog]
  );

  const handleSave = useCallback(() => {
    if (editingLogId) {
      updateEpisodeLog({
        log_id: editingLogId,
        payload: {
          rating: Math.round(rating * 2),
          notes: review,
          review_visibility: visibility,
          watched_at: reviewDate,
        },
      });
    } else {
      addEpisodeLog({
        episode_id: episode.id,
        payload: {
          rating: Math.round(rating * 2),
          notes: review,
          review_visibility: visibility,
          watched_at: reviewDate,
        },
      });
    }
    setView('reviews');
  }, [editingLogId, updateEpisodeLog, rating, review, visibility, reviewDate, addEpisodeLog, episode.id]);

  const handleToggleWatched = useCallback(() => {
    const isWatched = logs.length > 0;
    toggleEpisodeWatched({ episode_id: episode.id, watched: !isWatched });
  }, [logs.length, toggleEpisodeWatched, episode.id]);

  const handleSaveQuote = useCallback(
    (text: string, quoteId?: number | null) => {
      if (quoteId) {
        updateQuote({ quote_id: quoteId, payload: { quote_text: text } });
      } else {
        addQuote({ episode_id: episode.id, quote_text: text });
      }
    },
    [addQuote, episode.id, updateQuote]
  );

  const handleDeleteQuote = useCallback(
    (quoteId: number) => {
      deleteQuote(quoteId);
    },
    [deleteQuote]
  );

  const handleSendComment = useCallback(async () => {
    if (!commentMentions.commentText.trim() || !selectedReview) return;
    await createInteraction.mutateAsync({
      interaction_type: 'EPISODE_REVIEW_COMMENT',
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
    myAverage,
    friendsAverage,
    tmdbValue,
    imagePlaceholder,
    friendsLogsData,
    openNewReview,
    openEditReview,
    handleDeleteLog,
    handleSave,
    handleToggleWatched,
    handleSaveQuote,
    handleDeleteQuote,
    commentMentions,
    handleSendComment,
  };
};
