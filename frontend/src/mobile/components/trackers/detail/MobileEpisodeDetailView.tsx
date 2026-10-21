import React, { useState } from 'react';
import { Check, Quote } from 'lucide-react';
import type {
  TMDBEpisode,
  TMDBSeries,
  UserEpisodeLog,
  UserSeriesTracking,
} from '@/types/trackers';
import { StarRating } from '@/components/trackers/SeriesDetailModal/StarRating';
import { MobileEpisodeQuotesSection } from './MobileEpisodeQuotesSection';
import { MobileEpisodeReviewForm } from './MobileEpisodeReviewForm';
import { MobileEpisodeMyReviewsList } from './MobileEpisodeMyReviewsList';
import { MobileReviewDetailView } from './MobileReviewDetailView';
import { aggregateFriendsReviews } from '@/utils/ratingUtils';
import { FriendsReviewsListView } from '@/components/trackers/SeriesDetailModal/shared/FriendsReviewsListView';
import { FriendDetailReviewsView } from '@/components/trackers/SeriesDetailModal/shared/FriendDetailReviewsView';
import {
  useEpisodeDetailLogic,
  type EpisodeViewState,
} from '@/components/trackers/SeriesDetailModal/hooks/useEpisodeDetailLogic';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import {
  MobileWatchActionDrawer,
  type MobileWatchActionTarget,
} from './MobileWatchActionDrawer';
import { showTrackerToast } from '@/components/trackers/TrackerToast';

export interface MobileEpisodeDetailViewProps {
  episode: TMDBEpisode;
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
  logs: UserEpisodeLog[];
  initialView?: EpisodeViewState;
  initialReviewLogId?: number;
}

export const MobileEpisodeDetailView: React.FC<MobileEpisodeDetailViewProps> = ({
  episode,
  tmdbSeries,
  userTracking,
  logs,
  initialView = 'main',
  initialReviewLogId,
}) => {
  const [drawerTarget, setDrawerTarget] = useState<MobileWatchActionTarget | null>(null);
  const { toggleEpisodeWatched, deleteEpisodeLog } = useTrackersMutations();

  const {
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
    myAverage,
    friendsAverage,
    tmdbValue,
    friendsLogsData,
    openNewReview,
    openEditReview,
    handleDeleteLog,
    handleSave,
    handleToggleWatched,
    handleSaveQuote,
    handleDeleteQuote,
    optimisticWatchCount,
    isWatched,
    quotes,
    commentMentions,
    handleSendComment,
  } = useEpisodeDetailLogic({
    episode,
    tmdbSeries,
    logs,
    initialView,
    initialReviewLogId,
  });

  const watchCount = optimisticWatchCount;

  // Gestione tocco pallino visto / rewatch
  const handleCircleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userTracking) {
      showTrackerToast('Aggiungi prima la serie alla tua libreria', 'warning');
      return;
    }
    if (watchCount === 0) {
      handleToggleWatched();
    } else {
      setDrawerTarget({
        type: 'episode',
        id: episode.id,
        title: episode.title || `Episodio ${episode.episode_number}`,
        seasonNumber: episode.season_number,
        episodeNumber: episode.episode_number,
        watchCount,
      });
    }
  };

  const handleDrawerAddWatch = () => {
    toggleEpisodeWatched({ episode_id: episode.id, watched: true });
  };

  const handleDrawerResetWatch = () => {
    for (let i = 0; i < watchCount; i++) {
      toggleEpisodeWatched({ episode_id: episode.id, watched: false });
    }
  };

  const handleDrawerSubWatch = () => {
    toggleEpisodeWatched({ episode_id: episode.id, watched: false });
  };

  // 1. Form View (Nuova o Modifica Recensione Episodio)
  if (view === 'form') {
    return (
      <div className="absolute inset-0 z-20 bg-gray-50 flex flex-col justify-between overflow-hidden p-4 pb-0 select-none animate-fadeIn">
        <MobileEpisodeReviewForm
          editingLogId={editingLogId}
          onBack={() => setView(logs.length > 0 ? 'reviews' : 'main')}
          reviewDate={reviewDate}
          setReviewDate={setReviewDate}
          visibility={visibility}
          setVisibility={setVisibility}
          review={review}
          setReview={setReview}
          rating={rating}
          setRating={setRating}
          platform={platform}
          setPlatform={setPlatform}
          allPlatforms={allPlatforms}
          onSave={handleSave}
        />
      </div>
    );
  }

  // 2. Reviews List View (Le mie recensioni dell'episodio)
  if (view === 'reviews') {
    return (
      <div className="animate-fadeIn">
        <MobileEpisodeMyReviewsList
          logs={logs}
          onBack={() => setView('main')}
          onOpenNewReview={openNewReview}
          onOpenEditReview={openEditReview}
          onDeleteReview={(id) => deleteEpisodeLog(id)}
          onDeleteReviews={(ids) => ids.forEach((id) => deleteEpisodeLog(id))}
          onSelectReview={(log) => {
            setSelectedReview({
              id: log.id,
              author_id: String(log.user_id),
              author_name: 'Tu',
              rating: (log.rating || 0) / 2,
              notes: log.notes || '',
              updated_at: log.watched_at,
              comments: log.comments || [],
              is_mine: true,
              review_visibility: log.review_visibility,
              viewing_platform_name: log.viewing_platform_name ?? null,
              original_log: log,
            });
            setView('review_detail');
          }}
        />
      </div>
    );
  }

  // 3. Friends Reviews Overview
  if (view === 'friends_reviews') {
    const friendsList = aggregateFriendsReviews(friendsLogsData);
    return (
      <div className="animate-fadeIn">
        <FriendsReviewsListView
          friendsList={friendsList}
          onBack={() => setView('main')}
          onSelectFriend={(friendId) => {
            setSelectedFriendId(friendId);
            setView('friend_detail');
          }}
          title="Recensioni Amici"
          emptyMessage="Nessun amico ha recensito questo episodio."
        />
      </div>
    );
  }

  // 4. Friend Detail View
  if (view === 'friend_detail' && selectedFriendId) {
    const friendLogs = friendsLogsData.filter(
      (l) => String(l.friend_id) === String(selectedFriendId)
    );
    const friendName = friendLogs[0]?.friend_name || '';

    return (
      <div className="animate-fadeIn">
        <FriendDetailReviewsView
          friendName={friendName}
          onBack={() => setView('friends_reviews')}
          logs={friendLogs}
          getCardData={(log) => ({
            id: log.id,
            rating: log.rating,
            dateStr: log.watched_at,
            notes: log.notes,
            review_visibility: log.review_visibility,
            commentsCount: log.comments?.length,
          })}
          onSelectReview={(log) => {
            setSelectedReview({
              id: log.id,
              author_id: String(log.friend_id),
              author_name: log.friend_name,
              author_avatar: log.friend_avatar || '',
              rating: (log.rating || 0) / 2,
              notes: log.notes || '',
              updated_at: log.watched_at,
              comments: log.comments || [],
              is_mine: false,
              review_visibility: log.review_visibility,
              original_log: log,
            });
            setView('review_detail');
          }}
        />
      </div>
    );
  }

  // 5. Review Detail & Comments View (Dedicato Mobile)
  if (view === 'review_detail') {
    if (!selectedReview) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 gap-3 text-gray-500 min-h-[300px]">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-500">Apertura recensione...</span>
        </div>
      );
    }

    const origLog = selectedReview.original_log;
    const isUserLog = origLog && 'user_id' in origLog;

    const handleEditCurrentReview = () => {
      if (isUserLog) {
        openEditReview(origLog as UserEpisodeLog);
      } else {
        const found = logs.find((l) => l.id === selectedReview.id);
        if (found) openEditReview(found);
      }
    };

    const handleDeleteCurrentReview = () => {
      const logId = isUserLog ? (origLog as UserEpisodeLog).id : selectedReview.id;
      handleDeleteLog(Number(logId));
    };

    return (
      <div className="animate-fadeIn">
        <MobileReviewDetailView
          review={selectedReview}
          onBack={() => setView(selectedReview.is_mine ? 'reviews' : 'friend_detail')}
          onEdit={selectedReview.is_mine ? handleEditCurrentReview : undefined}
          onDelete={selectedReview.is_mine ? handleDeleteCurrentReview : undefined}
          onReply={(name) => commentMentions.handleReplyClick(name)}
          commentText={commentMentions.commentText}
          commentTextRef={commentMentions.commentTextRef}
          mentionQuery={commentMentions.mentionQuery}
          mentionSuggestions={commentMentions.mentionSuggestions}
          onChangeComment={commentMentions.handleCommentChange}
          onSelectMention={commentMentions.handleSelectMention}
          onSubmitComment={handleSendComment}
        />
      </div>
    );
  }

  // 6. Quotes View
  if (view === 'quotes') {
    return (
      <div className="h-full flex flex-col flex-1 animate-fadeIn">
        <MobileEpisodeQuotesSection
          quotes={quotes}
          onBackToMain={() => setView('main')}
          onSaveQuote={handleSaveQuote}
          onDeleteQuote={handleDeleteQuote}
          onDeleteQuotes={(ids) => ids.forEach((id) => handleDeleteQuote(id))}
        />
      </div>
    );
  }

  // Formattazione data di trasmissione
  const formattedDate = episode.air_date
    ? new Date(`${episode.air_date}T00:00:00`).toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const seasonTitle = episode.season_number === 0
    ? 'Episodi Speciali'
    : `Stagione ${episode.season_number}`;
  const seasonEpCode = `${seasonTitle} - Episodio ${episode.episode_number}`;

  // 7. Schermata Principale Episodio Mobile (Richiesta dall'utente)
  return (
    <div className="flex flex-col gap-4 pb-8 select-none animate-fadeIn">
      {/* RIGA INTESTAZIONE SUPERIORE: STAGIONE X - EPISODIO X | DATA & PALLINO VISTO */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-200/80 pb-3 pt-1">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-blue-600 font-black text-xs uppercase tracking-wider">
            {seasonEpCode}
          </span>
          {formattedDate && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500 font-medium text-xs capitalize">
                {formattedDate}
              </span>
            </>
          )}
        </div>

        {/* Pallino visto interattivo (con X1, X2... e cassetto rewatch) */}
        <button
          type="button"
          onClick={handleCircleClick}
          className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-90 shrink-0 ${
            isWatched
              ? 'bg-blue-600 border border-blue-600 text-white'
              : 'border-2 border-gray-300 hover:border-blue-400 bg-white text-transparent'
          }`}
          title={
            isWatched
              ? `Visto ${watchCount}x (tocca per opzioni)`
              : 'Segna come visto'
          }
          aria-label={isWatched ? 'Visto' : 'Non visto'}
        >
          {watchCount > 1 ? (
            <span className="text-[10px] font-black leading-none">
              X{watchCount}
            </span>
          ) : (
            <Check className="w-4 h-4 stroke-[3]" />
          )}
        </button>
      </div>

      {/* TRAMA DELL'EPISODIO */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
            Trama
          </h4>

          {/* Pulsante Citazioni con pallino per il conteggio */}
          <button
            type="button"
            onClick={() => setView('quotes')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              quotes.length > 0
                ? 'bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Citazioni episodio"
          >
            <Quote className="w-3 h-3" />
            <span>Citazioni</span>
            {quotes.length > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-full bg-amber-200 text-amber-950 text-[10px] font-black flex items-center justify-center -mr-0.5">
                {quotes.length}
              </span>
            )}
          </button>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          {episode.overview && episode.overview.trim().length > 0
            ? episode.overview
            : 'Nessuna descrizione o trama disponibile per questo episodio.'}
        </p>
      </div>

      {/* SEZIONE VOTI: BOX UNICO ATTORNO A TUTTI E TRE I VOTI */}
      <div className="w-full max-w-sm mx-auto bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs flex flex-col items-center gap-3.5 shrink-0 my-1">
        {/* Livello Superiore: TMDB e Amici */}
        <div className="flex items-center justify-around w-full">
          {/* TMDB */}
          <div className="flex flex-col items-center gap-1 px-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              TMDB
            </span>
            <div className="flex items-center">
              {tmdbValue !== null ? (
                <StarRating value={tmdbValue} hideNumber readonly iconClassName="w-5 h-5" />
              ) : (
                <span className="text-gray-400 font-medium text-xs">--</span>
              )}
            </div>
          </div>

          <div className="w-px h-9 bg-gray-200" />

          {/* Amici */}
          <div
            onClick={() => setView('friends_reviews')}
            className="flex flex-col items-center gap-1 px-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors p-1 -m-1 group"
          >
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
              Amici
            </span>
            <div className="flex items-center">
              {friendsAverage !== null ? (
                <StarRating value={friendsAverage} hideNumber readonly iconClassName="w-5 h-5" />
              ) : (
                <span className="text-gray-400 font-medium text-xs">--</span>
              )}
            </div>
          </div>
        </div>

        {/* Separatore Orizzontale */}
        <div className="w-full border-t border-gray-100" />

        {/* Livello Inferiore: Il Tuo Voto */}
        <div className="w-full flex flex-col items-center">
          {myAverage !== null ? (
            <div
              onClick={() => setView('reviews')}
              className="w-full flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50 rounded-xl p-1.5 transition-colors group"
            >
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                Il Tuo Voto
              </span>
              <div
                className="flex items-center"
                title={`Media basata su ${logs.filter((l) => typeof l.rating === 'number').length} voti`}
              >
                <StarRating value={myAverage} hideNumber readonly iconClassName="w-6 h-6" />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={logs.length > 0 ? () => setView('reviews') : openNewReview}
              className="w-full flex flex-col items-center justify-center gap-0.5 py-1.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer active:scale-98"
            >
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Ancora nessun voto
              </span>
              <span className="text-xs font-black text-gray-900">Aggiungilo!</span>
            </button>
          )}
        </div>
      </div>

      {/* Drawer azioni rewatch per l'episodio */}
      <MobileWatchActionDrawer
        isOpen={drawerTarget !== null}
        onClose={() => setDrawerTarget(null)}
        target={drawerTarget}
        onAddWatch={handleDrawerAddWatch}
        onResetWatch={handleDrawerResetWatch}
        onSubWatch={handleDrawerSubWatch}
      />
    </div>
  );
};

export default MobileEpisodeDetailView;
