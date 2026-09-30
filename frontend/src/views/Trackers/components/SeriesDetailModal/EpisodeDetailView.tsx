// @ts-nocheck
import React, { useState, useMemo } from 'react';
import type { TMDBEpisode, UserEpisodeLog, ReviewComment } from '@/types/trackers';
import { StarRating } from './StarRating';
import { EditIcon, TrashIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { DatePicker } from '@/components/shared/utils/DatePicker/DatePicker';
import { AddButton } from '@/components/shared/utils/AddButton';
import { useFriendsEpisodeReviews } from '@/hooks/queries/useTrackersQueries';
import { useNotifications } from '@/hooks/useNotifications';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useConfirm } from '@/context/ConfirmContext';

export interface FriendLog {
  id: string;
  friend_id: string;
  friend_name: string;
  friend_avatar: string;
  rating: number;
  notes: string;
  review_visibility: 'private' | 'friends_only' | 'public';
  watched_at: string;
  comments?: ReviewComment[];
}



interface EpisodeDetailViewProps {
  episode: TMDBEpisode;
  tmdbSeries?: any;
  logs: UserEpisodeLog[];
  onBack: () => void;
}

type ViewState = 'main' | 'reviews' | 'form' | 'friends_reviews' | 'friend_detail' | 'quotes' | 'quote_form' | 'review_detail';

export interface UnifiedReviewData {
  review_visibility?: string;
  id: string | number;
  author_id: string | number;
  author_name: string;
  author_avatar?: string | null;
  rating: number;
  notes: string;
  updated_at: string;
  comments: ReviewComment[];
  is_mine: boolean;
  original_log: any; // used to reference the original log for editing if mine
}


const VisibilityIcon = ({ visibility, className = "w-3 h-3" }: { visibility: string, className?: string }) => {
  if (visibility === 'private') return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
  if (visibility === 'friends_only') return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
}

export const EpisodeDetailView: React.FC<EpisodeDetailViewProps> = ({ episode, tmdbSeries, logs, onBack }) => {
  const [view, setView] = useState<ViewState>('main');
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<UnifiedReviewData | null>(null);
  const [commentText, setCommentText] = useState('');
  const { data: friendsLogsData = [] } = useFriendsEpisodeReviews(episode.id);
  const { createInteraction } = useNotifications();
  const { confirm } = useConfirm();
  const { toggleEpisodeWatched, updateEpisodeNotes, addEpisodeLog, updateEpisodeLog, deleteEpisodeLog, addQuote, updateQuote, deleteQuote } = useTrackersMutations();
  
  // States per form
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [rating, setRating] = useState(0); 
  const [review, setReview] = useState('');
  const [visibility, setVisibility] = useState('friends_only');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // States per quote
  const [quoteText, setQuoteText] = useState('');
  const quotes = episode.quotes || [];
  const [editingQuoteId, setEditingQuoteId] = useState<number | null>(null);
  
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [reviewDate, setReviewDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Calcolo media dei miei voti
  const myAverage = useMemo(() => {
    const ratedLogs = logs.filter(l => typeof l.rating === 'number');
    if (ratedLogs.length === 0) return null;
    const sum = ratedLogs.reduce((acc, l) => acc + ((l.rating || 0) / 2), 0);
    return sum / ratedLogs.length;
  }, [logs]);

  const friendsAverage = useMemo(() => {
    const userMap: Record<string, number[]> = {};
    friendsLogsData.forEach(log => {
      if (typeof log.rating === 'number') {
        if (!userMap[log.friend_id]) userMap[log.friend_id] = [];
        userMap[log.friend_id].push(log.rating / 2);
      }
    });
    const userAverages = Object.values(userMap).map(ratings => ratings.reduce((a, b) => a + b, 0) / ratings.length);
    if (userAverages.length === 0) return null;
    const totalAvg = userAverages.reduce((a, b) => a + b, 0) / userAverages.length;
    
    // Arrotondamento come da regole precedenti per uniformità
    const fractional = totalAvg - Math.floor(totalAvg);
    let roundedAvg = Math.floor(totalAvg);
    if (fractional >= 0.25 && fractional <= 0.75) roundedAvg += 0.5;
    else if (fractional > 0.75) roundedAvg += 1.0;
    
    return roundedAvg;
  }, [friendsLogsData]);

  // Voto TMDB (da 0-10 a 0-5)
  const tmdbValue = episode.vote_average !== undefined && episode.vote_average !== null ? episode.vote_average / 2 : null;

  const openNewReview = () => {
    setEditingLogId(null);
    setRating(0);
    setReview('');
    setVisibility('friends_only');
    const d = new Date();
    setReviewDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
    setView('form');
  };

  const openEditReview = (log: UserEpisodeLog) => {
    setEditingLogId(log.id);
    setRating((log.rating || 0) / 2);
    setReview(log.notes || '');
    setVisibility(log.review_visibility || 'friends_only');
    setReviewDate(log.watched_at ? log.watched_at.split('T')[0] : '');
    setView('form');
  };

        const handleDeleteLog = (logId: number) => {
    confirm({
      title: 'Elimina recensione',
      message: 'Vuoi davvero eliminare questa recensione?',
      confirmText: 'Elimina',
      isDestructive: true,
      onConfirm: () => {
        deleteEpisodeLog(logId);
        setView('reviews');
        setSelectedReview(null);
      }
    });
  };

        const handleSave = () => {
      if (editingLogId) {
        updateEpisodeLog({
          log_id: editingLogId,
          payload: {
            rating: rating * 2,
            notes: review,
            review_visibility: visibility,
            watched_at: reviewDate
          }
        });
      } else {
        addEpisodeLog({
          episode_id: episode.id,
          payload: {
            rating: rating * 2,
            notes: review,
            review_visibility: visibility,
            watched_at: reviewDate
          }
        });
      }
      setView('reviews');
    };

  const imagePlaceholder = episode.still_path 
    ? `https://image.tmdb.org/t/p/w500${episode.still_path}` 
    : tmdbSeries?.backdrop_path 
      ? `https://image.tmdb.org/t/p/w1280${tmdbSeries.backdrop_path}` 
      : tmdbSeries?.poster_path
        ? `https://image.tmdb.org/t/p/w500${tmdbSeries.poster_path}`
        : `https://placehold.co/600x338/e2e8f0/64748b?text=S${episode.season_number}E${episode.episode_number}`;

  if (view === 'form') {
    return (
      <div className="flex flex-col h-full animate-fadeIn">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView(logs.length > 0 ? 'reviews' : 'main')}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-gray-900">
              {editingLogId ? 'Modifica Recensione' : 'Nuova Recensione'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <DatePicker
                value={reviewDate}
                onChange={setReviewDate}
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
                usePortal={true}
                customTrigger={
                  <div 
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition-colors shadow-sm select-none"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700 font-medium">
                        {reviewDate ? new Date(reviewDate).toLocaleDateString('en-GB') : 'Oggi'}
                      </span>
                    </div>
                  </div>
                }
              />
            </div>

            <div className="relative" style={{ width: '130px' }}>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition-colors shadow-sm select-none"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-500">
                  {visibility === 'private' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                  {visibility === 'friends_only' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                  {visibility === 'public' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                </span>
                <span className="text-gray-700 font-medium">
                  {visibility === 'private' && 'Solo io'}
                  {visibility === 'friends_only' && 'Amici'}
                  {visibility === 'public' && 'Pubblico'}
                </span>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute z-50 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 mt-1 animate-fadeIn right-0 top-full">
                  <div onClick={() => { setVisibility('private'); setIsDropdownOpen(false); }} className="px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <span className="text-gray-700">Solo io</span>
                  </div>
                  <div onClick={() => { setVisibility('friends_only'); setIsDropdownOpen(false); }} className="px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    <span className="text-gray-700">Amici</span>
                  </div>
                  <div onClick={() => { setVisibility('public'); setIsDropdownOpen(false); }} className="px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-gray-700">Pubblico</span>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto mb-4">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full h-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-0 focus:border-gray-300 outline-none resize-none text-base text-gray-800 transition-colors"
            placeholder="Cosa ne pensi di questo episodio?"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 shrink-0">
          <StarRating value={rating} onChange={setRating} hideNumber />

          <button 
            onClick={handleSave}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors"
          >
            Salva
          </button>
        </div>
      </div>
    );
  }

  if (view === 'reviews') {
    // Dalla più recente (in alto) alla più vecchia (in basso)
    const sortedLogs = [...logs].sort((a, b) => new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime());

    return (
      <div className="flex flex-col h-full animate-fadeIn">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('main')}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              title="Torna ai Dettagli Episodio"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Le mie Recensioni
              {logs.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {logs.length}
                </span>
              )}
            </h2>
          </div>
          <button 
            onClick={openNewReview}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Vota!
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
          {sortedLogs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center -mt-8">
              <EmptyState message="Nessuna recensione registrata." />
            </div>
          ) : (
            sortedLogs.map((log) => (
              <ReviewItem 
                key={log.id} 
                log={log} 
                onEdit={() => openEditReview(log)} 
                onSelectReview={() => {
                  setSelectedReview({
                    id: log.id as any,
                    author_id: 'me',
                    author_name: 'Tu',
                    rating: (log.rating || 0) / 2,
                    notes: log.notes || '',
                    updated_at: log.watched_at,
                    comments: log.comments || [],
                    is_mine: true,
                    review_visibility: log.review_visibility,
                    original_log: log
                  });
                  setView('review_detail');
                }}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  // Nuova vista: Lista recensioni degli amici
  if (view === 'friends_reviews') {
    const userMap: Record<string, { id: string | number, name: string, avatar: string | null | undefined, ratings: number[] }> = {};
    friendsLogsData.forEach(log => {
      if (!userMap[log.friend_id]) {
        userMap[log.friend_id] = { id: log.friend_id, name: log.friend_name, avatar: log.friend_avatar, ratings: [] };
      }
      if (typeof log.rating === 'number') {
        userMap[log.friend_id].ratings.push(log.rating / 2);
      }
    });

    const friendsList = Object.values(userMap).map(u => {
      const avg = u.ratings.length > 0 ? u.ratings.reduce((a, b) => a + b, 0) / u.ratings.length : null;
      let roundedAvg = avg;
      if (avg !== null) {
        const fractional = avg - Math.floor(avg);
        roundedAvg = Math.floor(avg);
        if (fractional >= 0.25 && fractional <= 0.75) roundedAvg += 0.5;
        else if (fractional > 0.75) roundedAvg += 1.0;
      }
      return { ...u, average: roundedAvg };
    }).filter(u => u.average !== null);

    return (
      <div className="flex flex-col h-full animate-fadeIn">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('main')}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              title="Torna ai Dettagli Episodio"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Recensioni Amici
              {friendsList.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {friendsList.length}
                </span>
              )}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
          {friendsList.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center -mt-8">
              <EmptyState message="Nessun amico ha recensito questo episodio." />
            </div>
          ) : (
            friendsList.map(friend => (
              <div 
                key={friend.id} 
                onClick={() => { setSelectedFriendId(String(friend.id)); setView('friend_detail'); }}
                className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-shadow hover:shadow-md hover:border-blue-300"
              >
                <div className="flex items-center gap-4">
                  <img src={friend.avatar} alt={friend.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                  <span className="font-bold text-gray-900 text-base">{friend.name}</span>
                </div>
                <div className="flex items-center">
                  {friend.average !== null ? (
                    <StarRating value={friend.average} hideNumber readonly iconClassName="w-5 h-5" />
                  ) : (
                    <span className="text-gray-400 font-medium">--</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Dettaglio dei voti di un singolo amico
  if (view === 'friend_detail' && selectedFriendId) {
    const friendLogs = friendsLogsData.filter((l: any) => String(l.friend_id) === String(selectedFriendId)) //(l => String(l.friend_id) === String(selectedFriendId)).sort((a, b) => new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime());
    const friendName = friendLogs[0]?.friend_name || '';

    return (
      <div className="flex flex-col h-full animate-fadeIn">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('friends_reviews')}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              title="Torna alla lista amici"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h2 className="text-lg font-bold text-gray-900">
              I voti di {friendName}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
          {friendLogs.map((log) => (
            <div 
              key={log.id} 
              className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 transition-shadow hover:shadow-sm cursor-pointer"
              onClick={() => {
                setSelectedReview({
                  id: log.id as any,
                  author_id: String(log.friend_id),
                  author_name: log.friend_name,
                  author_avatar: log.friend_avatar || "",
                  rating: ((log as any).rating || 0) / 2,
                  notes: log.notes || "",
                  updated_at: log.watched_at,
                  comments: log.comments || [],
                  is_mine: false,
                    review_visibility: log.review_visibility,
                  original_log: log
                });
                setView('review_detail');
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <StarRating value={(log.rating || 0) / 2} hideNumber readonly iconClassName="w-5 h-5" />
                  </div>
                  <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                    {new Date(log.watched_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                    <div title={log.review_visibility === 'private' ? 'Personale (Solo io)' : log.review_visibility === 'friends_only' ? 'Amici' : 'Pubblica'}>
                      <VisibilityIcon visibility={log.review_visibility || 'public'} className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative mt-1">
                {log.review_visibility === 'private' ? (
                  <div className="text-sm italic text-gray-400">Recensione privata</div>
                ) : log.notes ? (
                  <div className="text-sm text-gray-700 line-clamp-3">{log.notes}</div>
                ) : null}
              </div>

              {log.comments && log.comments.length > 0 && (
                <div className="pt-2 border-t border-gray-100 mt-1">
                  <span className="text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors">
                    {log.comments.length} {log.comments.length === 1 ? 'commento' : 'commenti'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'review_detail' && selectedReview) {
    return (
      <div className="flex flex-col h-full animate-fadeIn">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView(selectedReview.is_mine ? 'reviews' : 'friend_detail')}
              className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {selectedReview.is_mine ? 'La tua recensione' : `Recensione di ${selectedReview.author_name}`}
            </h2>
          </div>
          {selectedReview.is_mine && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  openEditReview(selectedReview.original_log);
                }}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                title="Modifica"
              >
                <EditIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  handleDeleteLog(selectedReview.original_log.id);
                }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Elimina"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 pt-4 pr-2">
          {/* Main Review */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {selectedReview.is_mine ? (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700" title={selectedReview.review_visibility === 'private' ? 'Personale (Solo io)' : selectedReview.review_visibility === 'friends_only' ? 'Amici' : 'Pubblica'}>
                      <VisibilityIcon visibility={selectedReview.review_visibility || 'public'} className="w-5 h-5" />
                    </div>
                  ) : selectedReview.author_avatar ? (
                    <img src={selectedReview.author_avatar} alt={selectedReview.author_name} className="w-10 h-10 rounded-full border border-gray-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-700 font-bold text-base">{selectedReview.author_name.charAt(0)}</span>
                    </div>
                  )}
                <div>
                  <div className="font-bold text-gray-900">{selectedReview.author_name}</div>
                  <div className="text-xs text-gray-500">{new Date(selectedReview.updated_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
              <StarRating value={selectedReview.rating || 0} hideNumber readonly iconClassName="w-6 h-6" />
            </div>
            
            <div className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
              {selectedReview.review_visibility === 'private' && !selectedReview.is_mine ? <span className='italic text-gray-500 flex items-center gap-2'><svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' /></svg>Recensione privata (solo il voto è visibile)</span> : selectedReview.notes}
            </div>
          </div>

          {/* Comments Section */}
          <div className="flex flex-col gap-4">
            {selectedReview.comments.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Non ci sono ancora commenti. Sii il primo a commentare!
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedReview.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3 items-start bg-gray-50 p-3 rounded-xl">
                    {comment.author_avatar ? (
                      <img src={comment.author_avatar} alt={comment.author_name} className="w-8 h-8 rounded-full border border-gray-200 shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-blue-700 font-bold text-xs">{comment.author_name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-sm text-gray-900 truncate">{comment.author_name}</span>
                        <span className="text-xs text-gray-400 shrink-0">
                          {new Date(comment.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* New Comment Input */}
        <div className="pt-4 mt-2 border-t border-gray-100 shrink-0">
          <div className="flex gap-2">
            <textarea
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-0 focus:border-blue-500 outline-none resize-none h-12 custom-scrollbar transition-colors"
              placeholder="Scrivi un commento..."
              rows={1}
            />
            
            <button 
              onClick={async () => {
                if (!commentText.trim()) return;
                await createInteraction.mutateAsync({
                  interaction_type: 'EPISODE_REVIEW_COMMENT',
                  recipient_id: Number(selectedReview.author_id),
                  reference_id: Number(selectedReview.id),
                  content: commentText.trim()
                });
                setCommentText('');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 flex items-center justify-center transition-colors shadow-sm shrink-0">

              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'quote_form') {
    return (
      <div className="flex flex-col h-full animate-fadeIn">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-4 shrink-0">
          <button 
            onClick={() => {
              setQuoteText('');
              setView('quotes');
            }}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h2 className="text-lg font-bold text-gray-900">Nuova Citazione</h2>
        </div>
        
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <textarea
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            className="w-full flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-0 focus:border-gray-300 outline-none resize-none text-base text-gray-800 transition-colors"
            placeholder="Scrivi qui la citazione memorabile dell'episodio..."
          />
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-gray-100 shrink-0">
          <button 
            onClick={() => {
              if (quoteText.trim()) {

                  if (editingQuoteId) {
                      updateQuote({ quote_id: editingQuoteId, payload: { quote_text: quoteText } });
                      setEditingQuoteId(null);
                  } else {
                      addQuote({ episode_id: episode.id, quote_text: quoteText });
                  }
  
              }
              setQuoteText('');
              setView('quotes');
            }}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors"
          >
            Salva Citazione
          </button>
        </div>
      </div>
    );
  }

  if (view === 'quotes') {
    return (
      <div className="flex flex-col h-full animate-fadeIn">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('main')}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Citazioni dell'Episodio
              {quotes.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {quotes.length}
                </span>
              )}
            </h2>
          </div>
          <div className="w-48">
            <AddButton 
              label="Aggiungi Citazione"
              onClick={() => { setEditingQuoteId(null); setQuoteText(''); setView('quote_form'); }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
          {quotes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center -mt-8">
              <EmptyState message="Nessuna citazione inserita." />
            </div>
          ) : (
            quotes.map(q => (
              <div key={q.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-2 relative group">
                <p className="text-gray-800 italic font-medium leading-relaxed">
                  "{q.quote_text}"
                </p>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">

                        <button
                          onClick={() => { setEditingQuoteId(q.id); setQuoteText(q.quote_text); setView('quote_form'); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Modifica citazione"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                   <button 
                    onClick={() => deleteQuote(q.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Elimina"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // view === 'main'
  return (
    <div className="flex flex-col h-full animate-fadeIn">
      {/* Intestazione */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <span className="text-blue-600 font-bold text-sm tracking-wider uppercase flex items-center gap-2">
              <span>Stagione {episode.season_number} - Episodio {episode.episode_number}</span>
              {episode.air_date && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500 font-medium tracking-normal capitalize">
                    {new Date(episode.air_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </>
              )}
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
              {episode.title || `Episodio ${episode.episode_number}`}
            </h2>
          </div>
        </div>

        <button
          onClick={() => {
            const isWatched = logs.length > 0;
            toggleEpisodeWatched({ episode_id: episode.id, watched: !isWatched });
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-sm ${logs.length > 0 ? 'bg-blue-500 text-white shadow-md' : 'border-2 border-gray-300 text-transparent hover:border-blue-400'}`}
          title={logs.length > 0 ? "Segna come non visto" : "Segna come visto"}
        >
          {logs.length > 0 ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Corpo Principale (Immagine + Trama) */}
      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-1/2 rounded-xl overflow-hidden bg-gray-200 shadow-md relative group">
          <img src={imagePlaceholder} alt="Episode thumbnail" className="w-full h-full object-cover" />
          <button
            onClick={() => setView('quotes')}
            className={`absolute bottom-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all shadow-sm z-10 ${quotes.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            title="Citazioni"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            {quotes.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow-sm"></span>
            )}
          </button>
        </div>
        <div className="w-1/2 flex flex-col">
          <div className="prose prose-sm text-gray-700 leading-relaxed overflow-y-auto custom-scrollbar pr-2 h-full">
            {episode.overview ? (
              <p>{episode.overview}</p>
            ) : (
              <p className="italic text-gray-400">Nessuna trama disponibile per questo episodio.</p>
            )}
          </div>
        </div>
      </div>

      {/* Sezione Voti (In Basso) */}
      <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col items-center gap-6 shrink-0">
        <div className="flex items-center justify-center gap-16">
          {/* TMDB */}
          <div className="flex flex-col items-center gap-2 shrink-0 px-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">TMDB</span>
            <div className="flex items-center">
              {tmdbValue !== null ? (
                <StarRating value={tmdbValue} hideNumber readonly iconClassName="w-6 h-6" />
              ) : (
                <span className="text-gray-400 font-medium">--</span>
              )}
            </div>
          </div>

          <div className="w-px h-12 bg-gray-200"></div>

          {/* Amici */}
          <div 
            onClick={() => setView('friends_reviews')}
            className="flex flex-col items-center gap-2 shrink-0 px-4 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors p-2 -m-2 group"
          >
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-blue-500 transition-colors">Amici</span>
            <div className="flex items-center">
              {friendsAverage !== null ? (
                <StarRating value={friendsAverage} hideNumber readonly iconClassName="w-6 h-6" />
              ) : (
                <span className="text-gray-400 font-medium">--</span>
              )}
            </div>
          </div>
        </div>

        <div className="w-full max-w-xs pb-2">
          {myAverage !== null ? (
            <div 
              onClick={() => setView('reviews')}
              className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-xl p-3 transition-colors border border-transparent hover:border-gray-200"
            >
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Il Tuo Voto</span>
              <div className="flex items-center" title={`Media basata su ${logs.filter(l => typeof l.rating === 'number').length} voti`}>
                <StarRating value={myAverage} hideNumber readonly iconClassName="w-7 h-7" />
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setView('reviews')}
              className="w-full flex flex-col items-center justify-center gap-1 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
            >
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ancora nessun voto</span>
              <span className="text-sm font-extrabold text-gray-700">Aggiungilo!</span>
            </button>
          )}
        </div>
      </div>
      
    </div>
  );
};

// Componente per singola recensione nella lista
const ReviewItem: React.FC<{ log: UserEpisodeLog, onEdit: () => void, onSelectReview: () => void }> = ({ log, onEdit, onSelectReview }) => {
  return (
    <div 
      className="group bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 transition-shadow hover:shadow-sm cursor-pointer"
      onClick={onSelectReview}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {log.rating ? (
              <StarRating value={log.rating / 2} hideNumber readonly iconClassName="w-5 h-5" />
            ) : (
              <span className="text-gray-400 text-sm font-medium">Nessun voto</span>
            )}
          </div>
          <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                    {new Date(log.watched_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                    <div title={log.review_visibility === 'private' ? 'Personale (Solo io)' : log.review_visibility === 'friends_only' ? 'Amici' : 'Pubblica'}>
                      <VisibilityIcon visibility={log.review_visibility || 'public'} className="w-3.5 h-3.5" />
                    </div>
                  </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Azioni visibili solo in hover (group-hover) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="text-gray-400 hover:text-blue-600 transition-colors p-1"
              title="Modifica recensione"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
          </div>
        </div>
      </div>

      {log.notes && (
        <div className="relative">
          <div className="text-sm text-gray-700 line-clamp-3">
            {log.notes}
          </div>
        </div>
      )}

      {log.comments && log.comments.length > 0 && (
        <div className="pt-2 border-t border-gray-100 mt-1">
          <span className="text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors">
            {log.comments.length} {log.comments.length === 1 ? 'commento' : 'commenti'}
          </span>
        </div>
      )}

    </div>
  );
};








