import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  TMDBEpisode,
  TMDBSeries,
  UserEpisodeLog,
  UnifiedReviewData,
  SeriesQuote,
} from '@/types/trackers';
import { useFriendsEpisodeReviews, useTVPlatforms } from '@/hooks/queries/useTrackersQueries';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useNotifications } from '@/hooks/useNotifications';
import { useConfirm } from '@/context/ConfirmContext';
import { useAuth } from '@/context/AuthContext';
import { useCommentMentions } from '../shared/useCommentMentions';
import { showTrackerToast } from '@/components/trackers/TrackerToast';

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
  const { data: dbPlatforms = [] } = useTVPlatforms();
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
      !selectedReview
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
          author_id: String(friendLog.friend_id),
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
  }, [initialReviewLogId, logs, friendsLogsData, user, selectedReview]);

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
  const [platform, setPlatform] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [reviewDate, setReviewDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const allPlatforms = useMemo(() => {
    const defaultPlatforms = [
      'Netflix',
      'Prime Video',
      'Disney+',
      'Apple TV+',
      'Sky / NOW',
      'Paramount+',
      'Pirati 🏴‍☠️',
      'DVD / Blu-Ray',
      'TV (In chiaro)',
    ];
    return Array.from(new Set([...defaultPlatforms, ...dbPlatforms.map((p) => p.name)]));
  }, [dbPlatforms]);

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
    setPlatform('');
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
    setPlatform(log.viewing_platform_name || '');
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
          viewing_platform_name: platform || null,
          watched_at: reviewDate || null,
        },
      });
    } else {
      addEpisodeLog({
        episode_id: episode.id,
        payload: {
          rating: Math.round(rating * 2),
          notes: review,
          review_visibility: visibility,
          viewing_platform_name: platform || null,
          watched_at: reviewDate || null,
        },
      });
    }
    setView('reviews');
  }, [editingLogId, updateEpisodeLog, rating, review, visibility, platform, reviewDate, addEpisodeLog, episode.id]);

  // Stato Ottimistico Locale per Watch Count e Citazioni (0ms di latenza visiva)
  const serverWatchCount = episode.watch_count ?? (logs.length > 0 ? logs.length : 0);
  const [optimisticWatchCount, setOptimisticWatchCount] = useState<number>(serverWatchCount);
  const [localQuotes, setLocalQuotes] = useState<SeriesQuote[]>(episode.quotes || []);

  useEffect(() => {
    const count = episode.watch_count ?? (logs.length > 0 ? logs.length : 0);
    setOptimisticWatchCount(count);
  }, [episode.watch_count, logs.length]);

  useEffect(() => {
    if (episode.quotes) {
      setLocalQuotes(episode.quotes);
    }
  }, [episode.quotes]);

  const handleToggleWatched = useCallback(() => {
    const isCurrentlyWatched = optimisticWatchCount > 0;
    const nextWatched = !isCurrentlyWatched;
    setOptimisticWatchCount(nextWatched ? Math.max(1, optimisticWatchCount + 1) : 0);
    toggleEpisodeWatched({ episode_id: episode.id, watched: nextWatched });
  }, [optimisticWatchCount, toggleEpisodeWatched, episode.id]);

  const handleSaveQuote = useCallback(
    (text: string, quoteId?: number | null) => {
      if (quoteId) {
        setLocalQuotes((prev) =>
          prev.map((q) => (q.id === quoteId ? { ...q, quote_text: text } : q))
        );
        updateQuote({ quote_id: quoteId, payload: { quote_text: text } });
        showTrackerToast('Citazione modificata con successo', 'success');
      } else {
        const tempQuote: SeriesQuote = {
          id: Date.now(),
          episode_id: episode.id,
          quote_text: text,
          created_at: new Date().toISOString(),
          series_title: tmdbSeries?.title || '',
          season_number: episode.season_number,
          episode_number: episode.episode_number,
          series_poster_path: tmdbSeries?.poster_path || null,
        };
        setLocalQuotes((prev) => [tempQuote, ...prev]);
        addQuote({ episode_id: episode.id, quote_text: text });
        showTrackerToast('Citazione salvata con successo', 'success');
      }
    },
    [addQuote, episode.id, updateQuote, user?.id]
  );

  const handleDeleteQuote = useCallback(
    (quoteId: number) => {
      setLocalQuotes((prev) => prev.filter((q) => q.id !== quoteId));
      deleteQuote(quoteId);
      showTrackerToast('Citazione eliminata', 'info');
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
    showTrackerToast('Commento inviato con successo', 'success');
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
    platform,
    setPlatform,
    allPlatforms,
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
    optimisticWatchCount,
    isWatched: optimisticWatchCount > 0,
    quotes: localQuotes,
    commentMentions,
    handleSendComment,
  };
};
