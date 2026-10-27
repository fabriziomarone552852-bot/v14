import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  Movie,
  UserMovieLog,
  MovieQuote,
  MovieDetailTarget,
  FriendMovieLog,
} from '@/types/movies';
import type { UnifiedReviewData, ReviewComment } from '@/types/trackers';
import { useMovieMutations } from '@/hooks/mutations/useMovieMutations';
import { useFriendsMovieReviews } from '@/hooks/queries/useMovieQueries';
import { useTVPlatforms } from '@/hooks/queries/useTrackersQueries';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/AuthContext';
import { useCommentMentions } from '@/components/trackers/SeriesDetailModal/shared/useCommentMentions';
import { showTrackerToast } from '@/components/trackers/TrackerToast';

export type MovieReviewViewState =
  | 'main'
  | 'form'
  | 'friends_reviews'
  | 'friend_detail'
  | 'my_reviews'
  | 'review_detail';

interface UseMovieReviewTabLogicProps {
  movieTmdbId: number;
  movie: MovieDetailTarget;
  userMovie?: Movie;
  initialReviewLogId?: number;
  onAddTracking?: () => void;
}

export const useMovieReviewTabLogic = ({
  movieTmdbId,
  movie,
  userMovie,
  initialReviewLogId,
  onAddTracking,
}: UseMovieReviewTabLogicProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [view, setView] = useState<MovieReviewViewState>(
    initialReviewLogId ? 'review_detail' : 'main'
  );
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<UnifiedReviewData | null>(null);

  const {
    addMovieLogMutation,
    updateMovieLogMutation,
    deleteMovieLogMutation,
    addMovieQuoteMutation,
    updateMovieQuoteMutation,
    deleteMovieQuoteMutation,
  } = useMovieMutations();

  const { data: friendsLogsData = [] } = useFriendsMovieReviews(movieTmdbId, true);
  const { createInteraction } = useNotifications();

  const commentMentions = useCommentMentions();

  // Log personali dell'utente
  const logs: UserMovieLog[] = useMemo(() => {
    return userMovie?.logs || [];
  }, [userMovie?.logs]);

  // Citazioni del film con gestione ottimistica locale
  const [localQuotes, setLocalQuotes] = useState<MovieQuote[]>(userMovie?.quotes || []);
  useEffect(() => {
    if (userMovie?.quotes) {
      setLocalQuotes(userMovie?.quotes);
    }
  }, [userMovie?.quotes]);

  const [editingQuoteId, setEditingQuoteId] = useState<number | null>(null);

  // Se aperto con initialReviewLogId, seleziona la recensione
  useEffect(() => {
    if (initialReviewLogId && view === 'review_detail' && !selectedReview) {
      const myLog = logs.find((l) => l.id === initialReviewLogId);
      if (myLog) {
        setSelectedReview({
          id: myLog.id,
          author_id: String(user?.id || ''),
          author_name: 'Tu',
          rating: (myLog.rating || 0) / 2,
          notes: myLog.notes || '',
          updated_at: myLog.updated_at || myLog.watched_at || new Date().toISOString(),
          comments: myLog.comments || [],
          is_mine: true,
          review_visibility: myLog.review_visibility,
          viewing_platform_name: myLog.viewing_platform_name,
          original_log: myLog,
        });
        return;
      }

      const friendLog = friendsLogsData.find((l) => l.id === initialReviewLogId);
      if (friendLog) {
        setSelectedReview({
          id: friendLog.id,
          author_id: String(friendLog.friend_id),
          author_name: friendLog.friend_name,
          author_avatar: friendLog.friend_avatar || '',
          rating: (friendLog.rating || 0) / 2,
          notes: friendLog.notes || '',
          updated_at: friendLog.watched_at || new Date().toISOString(),
          comments: friendLog.comments || [],
          is_mine: false,
          review_visibility: friendLog.review_visibility,
          viewing_platform_name: friendLog.viewing_platform_name,
          original_log: friendLog,
        });
      }
    }
  }, [initialReviewLogId, logs, friendsLogsData, user, view, selectedReview]);

  // Sincronizza i commenti della recensione selezionata se cambiano nella cache
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

  // Resetta il draft del commento quando si esce dalla recensione o si passa a un'altra recensione
  const prevReviewIdRef = useRef<string | number | null>(null);
  useEffect(() => {
    if (view !== 'review_detail') {
      commentMentions.resetComment();
      prevReviewIdRef.current = null;
    } else if (selectedReview) {
      if (prevReviewIdRef.current !== null && prevReviewIdRef.current !== selectedReview.id) {
        commentMentions.resetComment();
      }
      prevReviewIdRef.current = selectedReview.id;
    }
  }, [view, selectedReview?.id, commentMentions]);

  // Form state per Nuova / Modifica recensione
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [visibility, setVisibility] = useState<string>('friends_only');
  const [platform, setPlatform] = useState<string>('');
  const [reviewDate, setReviewDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const { data: dbPlatforms = [] } = useTVPlatforms();
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
      'Cinema',
      'TV (In chiaro)',
    ];
    return Array.from(new Set([...defaultPlatforms, ...dbPlatforms.map((p) => p.name)]));
  }, [dbPlatforms]);

  // Dialog conferma cancellazione
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<number | null>(null);

  // Quote form state
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [newQuoteText, setNewQuoteText] = useState('');

  // Medie Voti (in scala 5 stelle per StarRating)
  const tmdbValue = useMemo(() => {
    const vote = ('vote_average' in movie && movie.vote_average) || userMovie?.vote_average;
    return vote ? Number((vote / 2).toFixed(1)) : null;
  }, [movie, userMovie]);

  const myAverage = useMemo(() => {
    const ratedLogs = logs.filter((l) => typeof l.rating === 'number' && l.rating! > 0);
    if (ratedLogs.length === 0) return null;
    const sum = ratedLogs.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return Number((sum / ratedLogs.length / 2).toFixed(1));
  }, [logs]);

  const friendsAverage = useMemo(() => {
    const rated = friendsLogsData.filter((l) => typeof l.rating === 'number' && l.rating! > 0);
    if (rated.length === 0) return null;
    const sum = rated.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return Number((sum / rated.length / 2).toFixed(1));
  }, [friendsLogsData]);

  // Azioni Form
  const openNewReview = () => {
    if (!userMovie && onAddTracking) {
      onAddTracking();
    }
    setEditingLogId(null);
    setRating(0);
    setReview('');
    setVisibility('friends_only');
    setPlatform('');
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setReviewDate(`${yyyy}-${mm}-${dd}`);
    setView('form');
  };

  const openEditReview = (log: UserMovieLog) => {
    setEditingLogId(log.id);
    setRating(log.rating ? log.rating / 2 : 0);
    setReview(log.notes || '');
    setVisibility(log.review_visibility || 'friends_only');
    setPlatform(log.viewing_platform_name || '');
    setReviewDate(
      log.watched_at ? log.watched_at.split('T')[0] : new Date().toISOString().split('T')[0]
    );
    setView('form');
  };

  const handleSave = () => {
    const payloadRating = rating > 0 ? Math.round(rating * 2) : null;
    if (editingLogId) {
      updateMovieLogMutation.mutate(
        {
          log_id: editingLogId,
          payload: {
            rating: payloadRating,
            notes: review,
            review_visibility: visibility,
            viewing_platform_name: platform.trim() || null,
            watched_at: reviewDate || null,
          },
        },
        {
          onSuccess: () => {
            showTrackerToast('Recensione aggiornata con successo', 'success');
            setView('my_reviews');
          },
        }
      );
    } else {
      addMovieLogMutation.mutate(
        {
          tmdb_id: movieTmdbId,
          payload: {
            rating: payloadRating,
            notes: review,
            review_visibility: visibility,
            viewing_platform_name: platform.trim() || null,
            watched_at: reviewDate || null,
          },
        },
        {
          onSuccess: () => {
            showTrackerToast('Recensione salvata nel diario', 'success');
            setView('my_reviews');
          },
        }
      );
    }
  };

  const confirmDeleteLog = (logId: number) => {
    setLogToDelete(logId);
    setIsDeleteDialogOpen(true);
  };

  const executeDeleteLog = () => {
    if (logToDelete) {
      deleteMovieLogMutation.mutate(
        { log_id: logToDelete },
        {
          onSuccess: () => {
            showTrackerToast('Recensione eliminata', 'info');
            setIsDeleteDialogOpen(false);
            setLogToDelete(null);
            setView('my_reviews');
          },
        }
      );
    }
  };

  const cancelDeleteLog = () => {
    setIsDeleteDialogOpen(false);
    setLogToDelete(null);
  };

  // Gestione Citazioni
  const handleOpenAddQuote = useCallback(() => {
    setEditingQuoteId(null);
    setNewQuoteText('');
    setIsAddingQuote(true);
  }, []);

  const handleEditQuote = useCallback((quote: MovieQuote) => {
    setEditingQuoteId(quote.id);
    setNewQuoteText(quote.quote_text);
    setIsAddingQuote(true);
  }, []);

  const handleCancelQuote = useCallback(() => {
    setEditingQuoteId(null);
    setNewQuoteText('');
    setIsAddingQuote(false);
  }, []);

  const handleSaveQuote = useCallback(() => {
    if (!newQuoteText.trim()) return;
    const text = newQuoteText.trim();

    if (editingQuoteId) {
      const qId = editingQuoteId;
      setLocalQuotes((prev) =>
        prev.map((q) => (q.id === qId ? { ...q, quote_text: text } : q))
      );
      updateMovieQuoteMutation.mutate(
        {
          quote_id: qId,
          quote_text: text,
        },
        {
          onSuccess: () => {
            showTrackerToast('Citazione modificata!', 'success');
          },
        }
      );
    } else {
      const tempQuote: MovieQuote = {
        id: Date.now(),
        user_id: user?.id || 0,
        movie_tmdb_id: movieTmdbId,
        quote_text: text,
        created_at: new Date().toISOString(),
      };
      setLocalQuotes((prev) => [tempQuote, ...prev]);
      addMovieQuoteMutation.mutate(
        {
          tmdb_id: movieTmdbId,
          quote_text: text,
        },
        {
          onSuccess: () => {
            showTrackerToast('Citazione aggiunta!', 'success');
          },
        }
      );
    }

    setNewQuoteText('');
    setEditingQuoteId(null);
    setIsAddingQuote(false);
  }, [newQuoteText, editingQuoteId, updateMovieQuoteMutation, user?.id, movieTmdbId, addMovieQuoteMutation]);

  const handleDeleteQuote = useCallback((quoteId: number) => {
    setLocalQuotes((prev) => prev.filter((q) => q.id !== quoteId));
    if (editingQuoteId === quoteId) {
      setEditingQuoteId(null);
      setNewQuoteText('');
      setIsAddingQuote(false);
    }
    deleteMovieQuoteMutation.mutate(quoteId, {
      onSuccess: () => {
        showTrackerToast('Citazione rimossa', 'info');
      },
    });
  }, [deleteMovieQuoteMutation, editingQuoteId]);

  // Invio Commento Recensione con Aggiornamento Ottimistico (0ms Latency)
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

    // 1. Resetta immediatamente il campo di input
    commentMentions.resetComment();

    // 2. Aggiornamento ottimistico istantaneo dello stato locale
    setSelectedReview((prev) =>
      prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : null
    );

    // 3. Aggiornamento ottimistico cache recensioni amici
    queryClient.setQueryData<FriendMovieLog[]>(
      ['trackers', 'movies', movieTmdbId, 'friends-reviews'],
      (old) => {
        if (!old) return old;
        return old.map((log) => {
          if (log.id === selectedReview.id) {
            return {
              ...log,
              comments: [...(log.comments || []), newComment],
            };
          }
          return log;
        });
      }
    );

    // 4. Aggiornamento ottimistico cache catalogo film personale
    queryClient.setQueryData<Movie[]>(
      ['trackers', 'movies'],
      (old) => {
        if (!old) return old;
        return old.map((m) => {
          if (m.tmdb_id === movieTmdbId) {
            return {
              ...m,
              logs: m.logs?.map((l) => {
                if (l.id === selectedReview.id) {
                  return {
                    ...l,
                    comments: [...(l.comments || []), newComment],
                  };
                }
                return l;
              }),
            };
          }
          return m;
        });
      }
    );

    // 5. Mutazione asincrona in background con rollback in onError
    createInteraction.mutate(
      {
        interaction_type: 'MOVIE_REVIEW_COMMENT',
        recipient_id: Number(selectedReview.author_id),
        reference_id: Number(selectedReview.id),
        content: textToSend,
      },
      {
        onError: () => {
          showTrackerToast('Impossibile inviare il commento. Riprova.', 'warning');
          // Rollback dallo stato locale
          setSelectedReview((prev) =>
            prev
              ? {
                  ...prev,
                  comments: (prev.comments || []).filter((c) => c.id !== tempId),
                }
              : null
          );
          queryClient.invalidateQueries({ queryKey: ['trackers', 'movies'] });
          queryClient.invalidateQueries({
            queryKey: ['trackers', 'movies', movieTmdbId, 'friends-reviews'],
          });
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ['trackers', 'movies'] });
          queryClient.invalidateQueries({
            queryKey: ['trackers', 'movies', movieTmdbId, 'friends-reviews'],
          });
        },
      }
    );
  }, [
    commentMentions,
    createInteraction,
    movieTmdbId,
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
    platform,
    setPlatform,
    allPlatforms,
    reviewDate,
    setReviewDate,
    isDeleteDialogOpen,
    confirmDeleteLog,
    executeDeleteLog,
    cancelDeleteLog,
    isAddingQuote,
    setIsAddingQuote,
    newQuoteText,
    setNewQuoteText,
    editingQuoteId,
    handleOpenAddQuote,
    handleEditQuote,
    handleCancelQuote,
    handleSaveQuote,
    handleDeleteQuote,
    tmdbValue,
    friendsAverage,
    myAverage,
    logs,
    quotes: localQuotes,
    friendsLogsData,
    openNewReview,
    openEditReview,
    handleSave,
    commentMentions,
    handleSendComment,
    user,
  };
};
