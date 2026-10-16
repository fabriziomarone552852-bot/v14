// src/mobile/components/trackers/detail/MobileSeriesReviewTab.tsx
import React from 'react';
import type { TMDBSeries, UserSeriesTracking, TMDBEpisode, UserSeriesLog } from '@/types/trackers';
import { useSeriesReviewTabLogic } from '@/components/trackers/SeriesDetailModal/hooks/useSeriesReviewTabLogic';
import { aggregateFriendsReviews } from '@/utils/ratingUtils';
import { StarRating } from '@/components/trackers/SeriesDetailModal/StarRating';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { FriendsReviewsListView } from '@/components/trackers/SeriesDetailModal/shared/FriendsReviewsListView';
import { FriendDetailReviewsView } from '@/components/trackers/SeriesDetailModal/shared/FriendDetailReviewsView';
import { MobileReviewDetailView } from './MobileReviewDetailView';
import { MobileSeriesReviewForm } from './MobileSeriesReviewForm';
import { MobileSeriesMyReviewsList } from './MobileSeriesMyReviewsList';

export interface MobileSeriesReviewTabProps {
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
  initialReviewLogId?: number;
  onOpenEpisode?: (episode: TMDBEpisode) => void;
}

export const MobileSeriesReviewTab: React.FC<MobileSeriesReviewTabProps> = ({
  tmdbSeries,
  userTracking,
  initialReviewLogId,
  onOpenEpisode,
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
    reviewDate,
    setReviewDate,
    allPlatforms,
    SERIES_QUOTES,
    logs,
    friendsLogsData,
    tmdbValue,
    myAverage,
    friendsAverage,
    openNewReview,
    openEditReview,
    confirmDeleteLog,
    handleSave,
    commentMentions,
    handleSendComment,
    user,
  } = useSeriesReviewTabLogic({
    tmdbSeries,
    userTracking,
    initialReviewLogId,
  });

  // 1. Form View (Nuova o Modifica Recensione Serie)
  if (view === 'form') {
    return (
      <div className="absolute inset-0 z-20 bg-gray-50 flex flex-col justify-between overflow-hidden p-4 pb-0 select-none animate-fadeIn">
        <MobileSeriesReviewForm
          editingLogId={editingLogId}
          onBack={() => setView(logs.length > 0 ? 'my_reviews' : 'main')}
          platform={platform}
          setPlatform={setPlatform}
          allPlatforms={allPlatforms}
          reviewDate={reviewDate}
          setReviewDate={setReviewDate}
          visibility={visibility}
          setVisibility={setVisibility}
          review={review}
          setReview={setReview}
          rating={rating}
          setRating={setRating}
          onSave={handleSave}
        />
      </div>
    );
  }

  // 2. My Reviews View (Elenco Personale con Selezione Multipla)
  if (view === 'my_reviews') {
    return (
      <MobileSeriesMyReviewsList
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
            rating: log.rating || 0,
            notes: log.notes || '',
            updated_at: log.updated_at || new Date().toISOString(),
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
          emptyMessage="Nessun amico ha recensito questa serie."
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
            dateStr: log.watched_at || log.updated_at || new Date().toISOString(),
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
              updated_at: log.watched_at || log.updated_at || new Date().toISOString(),
              comments: log.comments || [],
              is_mine: false,
              review_visibility: log.review_visibility,
              viewing_platform_name: log.viewing_platform_name,
              original_log: log,
            });
            setView('review_detail');
          }}
        />
      </div>
    );
  }

  // 5. Review Detail & Comments View (Mobile Nativo)
  if (view === 'review_detail' && selectedReview) {
    const origLog = selectedReview.original_log;
    const isUserLog = origLog && 'user_id' in origLog;

    const handleEditCurrentReview = () => {
      if (isUserLog) {
        openEditReview(origLog as UserSeriesLog);
      } else {
        const found = logs.find((l) => l.id === selectedReview.id);
        if (found) openEditReview(found);
      }
    };

    const handleDeleteCurrentReview = () => {
      const logId = isUserLog ? (origLog as UserSeriesLog).id : selectedReview.id;
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

  // 6. Main Dashboard View (Speculare a quella degli Episodi - Zero Overflow)
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
              onClick={openNewReview}
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

      {/* CITAZIONI DELLA SERIE */}
      <div className="w-full bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
            <span>Citazioni della Serie</span>
            {SERIES_QUOTES.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                {SERIES_QUOTES.length}
              </span>
            )}
          </h3>
        </div>
        {SERIES_QUOTES.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center">
            <EmptyState message="Nessuna citazione salvata per questa serie." />
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto custom-scrollbar">
            {SERIES_QUOTES.map((q) => (
              <div
                key={q.id}
                onClick={() => onOpenEpisode && onOpenEpisode(q.episodeData)}
                className="p-3 bg-gray-50/70 hover:bg-blue-50/50 rounded-xl border border-gray-200/70 transition-all cursor-pointer flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                  <span className="text-blue-600 font-extrabold">{q.episodeStr}</span>
                </div>
                <p className="text-xs text-gray-800 italic leading-relaxed">
                  &ldquo;{q.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSeriesReviewTab;
