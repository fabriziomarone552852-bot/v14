// src/mobile/components/trackers/detail/MobileMovieReviewTab.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';
import type { Movie, MovieDetailTarget, UserMovieLog } from '@/types/movies';
import { useMovieReviewTabLogic } from '@/components/trackers/movies/detail/useMovieReviewTabLogic';
import { aggregateFriendsReviews } from '@/utils/ratingUtils';
import { StarRating } from '@/components/trackers/shared/detail/StarRating';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { AddButton } from '@/components/shared/utils/AddButton';
import { CloseIcon } from '@/components/shared/utils/Icons';
import { useBackHandler } from '@/utils/backButtonManager';
import { FriendsReviewsListView } from '@/components/trackers/shared/detail/FriendsReviewsListView';
import { FriendDetailReviewsView } from '@/components/trackers/shared/detail/FriendDetailReviewsView';
import { MobileReviewDetailView } from '../../shared/detail/MobileReviewDetailView';
import { MobileMovieReviewForm } from './MobileMovieReviewForm';
import { MobileMovieMyReviewsList } from './MobileMovieMyReviewsList';

export interface MobileMovieReviewTabProps {
  movieTmdbId: number;
  movie: MovieDetailTarget;
  userMovie?: Movie;
  initialReviewLogId?: number;
  onAddTracking?: () => void;
}

export const MobileMovieReviewTab: React.FC<MobileMovieReviewTabProps> = ({
  movieTmdbId,
  movie,
  userMovie,
  initialReviewLogId,
  onAddTracking,
}) => {
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
    isAddingQuote,
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
    quotes,
    friendsLogsData,
    openNewReview,
    openEditReview,
    confirmDeleteLog,
    handleSave,
    commentMentions,
    handleSendComment,
    user,
  } = useMovieReviewTabLogic({
    movieTmdbId,
    movie,
    userMovie,
    initialReviewLogId,
    onAddTracking,
  });

  // Gestione tasto indietro hardware Android per chiudere la finestra citazione se aperta
  useBackHandler(isAddingQuote, handleCancelQuote, 35);

  // 1. Form View (Nuova o Modifica Recensione Film)
  if (view === 'form') {
    return (
      <div className="absolute inset-0 z-20 bg-gray-50 flex flex-col justify-between overflow-hidden p-4 pb-0 select-none animate-fadeIn">
        <MobileMovieReviewForm
          editingLogId={editingLogId}
          onBack={() => setView(logs.length > 0 ? 'my_reviews' : 'main')}
          reviewDate={reviewDate}
          setReviewDate={setReviewDate}
          visibility={visibility}
          setVisibility={setVisibility}
          platform={platform}
          setPlatform={setPlatform}
          allPlatforms={allPlatforms}
          review={review}
          setReview={setReview}
          rating={rating}
          setRating={setRating}
          onSave={handleSave}
        />
      </div>
    );
  }

  // 2. My Reviews View (Diario Personale con Selezione Multipla)
  if (view === 'my_reviews') {
    return (
      <MobileMovieMyReviewsList
        logs={logs}
        onBack={() => setView('main')}
        onOpenNewReview={openNewReview}
        onOpenEditReview={openEditReview}
        onDeleteReview={(id) => confirmDeleteLog(id)}
        onDeleteReviews={(ids) => ids.forEach((id) => confirmDeleteLog(id))}
        onSelectReview={(log) => {
          setSelectedReview({
            id: log.id,
            author_id: String(user?.id || ''),
            author_name: 'Tu',
            rating: (log.rating || 0) / 2,
            notes: log.notes || '',
            updated_at: log.watched_at || log.updated_at || new Date().toISOString(),
            comments: log.comments || [],
            is_mine: true,
            review_visibility: log.review_visibility,
            viewing_platform_name: log.viewing_platform_name,
            original_log: log,
          });
          setView('review_detail');
        }}
      />
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
          emptyMessage="Nessun amico ha ancora recensito questo film."
        />
      </div>
    );
  }

  // 4. Friend Detail View
  if (view === 'friend_detail' && selectedFriendId) {
    const friendLogs = friendsLogsData
      .filter((l) => String(l.friend_id) === String(selectedFriendId))
      .sort((a, b) => {
        const timeA = new Date(a.watched_at || '').getTime();
        const timeB = new Date(b.watched_at || '').getTime();
        return timeB - timeA;
      });
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
            dateStr: log.watched_at || new Date().toISOString(),
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
              updated_at: log.watched_at || new Date().toISOString(),
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

  // 5. Review Detail & Comments View
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
        openEditReview(origLog as UserMovieLog);
      } else {
        const found = logs.find((l) => l.id === selectedReview.id);
        if (found) openEditReview(found);
      }
    };

    const handleDeleteCurrentReview = () => {
      const logId = isUserLog ? (origLog as UserMovieLog).id : selectedReview.id;
      confirmDeleteLog(Number(logId));
    };

    return (
      <div className="animate-fadeIn">
        <MobileReviewDetailView
          review={selectedReview}
          onBack={() => setView(selectedReview.is_mine ? 'my_reviews' : 'friend_detail')}
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

  // 6. Main Dashboard View
  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-6">
      {/* SEZIONE VOTI: BOX UNICO ATTORNO A TUTTI E TRE I VOTI */}
      <div className="w-full max-w-sm mx-auto bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs flex flex-col items-center gap-3.5 shrink-0">
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
              onClick={() => setView('my_reviews')}
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
              onClick={logs.length > 0 ? () => setView('my_reviews') : openNewReview}
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

      {/* CITAZIONI DEL FILM */}
      <div className="w-full bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 gap-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2 shrink-0">
            <span>Citazioni del Film</span>
            {quotes.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                {quotes.length}
              </span>
            )}
          </h3>

          <div className="w-32 shrink-0">
            <AddButton
              compact
              label="Aggiungi"
              onClick={handleOpenAddQuote}
            />
          </div>
        </div>

        {quotes.length === 0 ? (
          <div className="py-4 flex flex-col items-center justify-center">
            <EmptyState message="Nessuna citazione salvata per questo film." />
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto custom-scrollbar">
            {quotes.map((q) => (
              <div
                key={q.id}
                className="p-3 bg-gray-50/70 hover:bg-blue-50/50 rounded-xl border border-gray-200/70 transition-all flex items-start justify-between gap-2"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => handleEditQuote(q)}
                >
                  <p className="text-xs text-gray-800 italic leading-relaxed">
                    &ldquo;{q.quote_text}&rdquo;
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteQuote(q.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                  title="Elimina citazione"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALE FINESTRA AL CENTRO DELLO SCHERMO: NUOVA / MODIFICA CITAZIONE (Stile Webpage) */}
      {isAddingQuote &&
        createPortal(
          <div
            className="fixed inset-0 z-[10060] bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 pointer-events-auto animate-fadeIn select-none"
            onClick={handleCancelQuote}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 flex flex-col gap-3.5 border border-gray-100 animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Finestra con Titolo e tasto X */}
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                  <span>{editingQuoteId ? 'Modifica Citazione' : 'Nuova Citazione'}</span>
                </h3>
                <button
                  type="button"
                  onClick={handleCancelQuote}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
                  title="Chiudi"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Area di Testo per la Citazione */}
              <div className="flex flex-col gap-1.5">
                <textarea
                  value={newQuoteText}
                  onChange={(e) => setNewQuoteText(e.target.value)}
                  rows={3}
                  placeholder='Scrivi una citazione memorabile del film... (es. "Che la Forza sia con te")'
                  className="w-full px-3.5 py-2.5 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-medium leading-relaxed"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSaveQuote();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      handleCancelQuote();
                    }
                  }}
                />
              </div>

              {/* Tasti di Azione in Basso: Annulla (sfondo rosso, scritta bianca) + Salva (blu) */}
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleCancelQuote}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl cursor-pointer shadow-xs transition-all active:scale-95"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  disabled={!newQuoteText.trim()}
                  onClick={handleSaveQuote}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:opacity-60 rounded-xl cursor-pointer shadow-xs transition-all active:scale-95"
                >
                  Salva
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default MobileMovieReviewTab;
