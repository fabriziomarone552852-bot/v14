import React, { useState, useMemo } from 'react';
import type { TMDBSeries, UserSeriesTracking, TMDBEpisode } from '@/types/trackers';
import { StarRating } from './StarRating';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { DatePicker } from '@/components/shared/utils/DatePicker/DatePicker';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useFriendsSeriesReviews } from '@/hooks/queries/useTrackersQueries';
import { useNotifications } from '@/hooks/useNotifications';
import { EditIcon, TrashIcon } from '@/components/shared/utils/Icons';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';



export interface UserSeriesLog {
  id: number;
  rating: number;
  notes: string;
  review_visibility: 'private' | 'friends_only' | 'public';
  updated_at: string;
}

export interface UnifiedReviewData {
  id: string | number;
  author_id: string | number;
  author_name: string;
  author_avatar?: string | null;
  rating: number;
  notes: string;
  updated_at: string;
  comments: any[];
  is_mine: boolean;
  original_log: any;
}

interface SeriesReviewTabProps {
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
  onOpenEpisode?: (episode: TMDBEpisode) => void;
}

type ViewState = 'main' | 'form' | 'friends_reviews' | 'friend_detail' | 'my_reviews' | 'review_detail';

export const SeriesReviewTab: React.FC<SeriesReviewTabProps> = ({ tmdbSeries, userTracking, onOpenEpisode }) => {
  const [view, setView] = useState<ViewState>('main');
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<UnifiedReviewData | null>(null);
  const [commentText, setCommentText] = useState('');
  const { createInteraction } = useNotifications();
  const { addSeriesLog, updateSeriesLog, deleteSeriesLog } = useTrackersMutations();
  const { data: friendsLogsData = [] } = useFriendsSeriesReviews(tmdbSeries.tmdb_id);

  const SERIES_QUOTES = useMemo(() => {
    if (!tmdbSeries.episodes) return [];
    
    return tmdbSeries.episodes.reduce((acc, ep) => {
       if (ep.quotes && ep.quotes.length > 0) {
           const epQuotes = ep.quotes.map((q: any) => ({
               id: q.id,
               text: q.quote_text,
               episodeStr: `S${ep.season_number}E${ep.episode_number}`,
               episodeData: ep
           }));
           return [...acc, ...epQuotes];
       }
       return acc;
    }, [] as {id: string, text: string, episodeStr: string, episodeData: TMDBEpisode}[]);
  }, [tmdbSeries.episodes]);

  const logs: UserSeriesLog[] = useMemo(() => {
    if (userTracking && userTracking.logs && userTracking.logs.length > 0) {
      return userTracking.logs.map(log => ({
        id: log.id,
        rating: (log.rating || 0) / 2,
        notes: log.notes || '',
        review_visibility: (log.review_visibility as 'private' | 'friends_only' | 'public') || 'friends_only',
        updated_at: log.updated_at || new Date().toISOString()
      }));
    }
    return [];
  }, [userTracking]);

  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [rating, setRating] = useState(0); 
  const [review, setReview] = useState('');
  const [visibility, setVisibility] = useState<UserSeriesLog['review_visibility']>((userTracking?.review_visibility as 'private' | 'friends_only' | 'public') || 'friends_only');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [reviewDate, setReviewDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const tmdbValue = (tmdbSeries as any).vote_average !== undefined && (tmdbSeries as any).vote_average !== null ? (tmdbSeries as any).vote_average / 2 : null;

  const myAverage = useMemo(() => {
    const ratedLogs = logs.filter(l => typeof l.rating === 'number');
    if (ratedLogs.length === 0) return null;
    const sum = ratedLogs.reduce((acc, l) => acc + (l.rating || 0), 0);
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
    
    const fractional = totalAvg - Math.floor(totalAvg);
    let roundedAvg = Math.floor(totalAvg);
    if (fractional >= 0.25 && fractional <= 0.75) roundedAvg += 0.5;
    else if (fractional > 0.75) roundedAvg += 1.0;
    
    return roundedAvg;
  }, []);

  const openNewReview = () => {
    setEditingLogId(null);
    setRating(0);
    setReview('');
    setVisibility('friends_only');
    const d = new Date();
    setReviewDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
    setView('form');
  };

  const openEditReview = (log: UserSeriesLog) => {
    setEditingLogId(log.id);
    setRating(log.rating || 0);
    setReview(log.notes || '');
    setVisibility(log.review_visibility || 'friends_only');
    setReviewDate(log.updated_at ? log.updated_at.split('T')[0] : '');
    setView('form');
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [logToDeleteId, setLogToDeleteId] = useState<number | null>(null);
  
  const confirmDeleteLog = (id: number) => {
    setLogToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDeleteLog = () => {
    if (logToDeleteId) {
      deleteSeriesLog(logToDeleteId);
    }
    setIsDeleteDialogOpen(false);
    setLogToDeleteId(null);
    setView('main');
  };

  const handleSave = () => {
    if (editingLogId) {
      updateSeriesLog({
        log_id: editingLogId,
        payload: {
          rating: rating > 0 ? Math.round(rating * 2) : null,
          notes: review,
          review_visibility: visibility,
          watched_at: reviewDate
        }
      });
    } else {
      addSeriesLog({
        tmdb_id: tmdbSeries.tmdb_id,
        payload: {
          rating: rating > 0 ? Math.round(rating * 2) : null,
          notes: review,
          review_visibility: visibility,
          watched_at: reviewDate
        }
      });
    }
    setView('my_reviews');
  };

  if (view === 'form') {
    return (
      <div className="flex flex-col h-full animate-fadeIn">
        <div className="flex items-center justify-between pb-4 mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('my_reviews')}
              className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900">
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

        <div className="flex flex-col flex-1 min-h-0 mb-4">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full h-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-0 focus:border-gray-300 outline-none resize-none text-base text-gray-800 transition-colors"
            placeholder="Cosa ne pensi di questa serie?"
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

  const sortedLogs = [...logs].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  if (view === 'my_reviews') {
    return (
      <div className="flex flex-col h-full animate-fadeIn">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('main')}
              className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              Le mie Recensioni
            </h2>
          </div>
          <button 
            onClick={openNewReview}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Vota!
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pt-4 pr-2">
          {sortedLogs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center h-full">
              <EmptyState message="Nessuna recensione registrata." />
            </div>
          ) : (
            sortedLogs.map((log) => (
              <ReviewItem 
                key={log.id} 
                log={log} 
                onEdit={() => openEditReview(log)} 
                onDelete={() => confirmDeleteLog(log.id)}
                onSelectReview={() => {
                  setSelectedReview({
                    id: log.id as any,
                    author_id: 'me',
                    author_name: 'Tu',
                    rating: (log.rating || 0) / 2,
                    notes: log.notes || '',
                    updated_at: log.updated_at,
                    comments: (log as any).comments || [],
                    is_mine: true,
                    original_log: log
                  });
                  setView('review_detail');
                }}
              />
            ))
          )}
        </div>

        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          title="Elimina recensione"
          message="Vuoi davvero eliminare questa recensione? L'operazione non può essere annullata."
          confirmText="Elimina"
          onConfirm={executeDeleteLog}
          onCancel={() => setIsDeleteDialogOpen(false)}
          isDestructive={true}
        />
      </div>
    );
  }

  if (view === 'friends_reviews') {
    const userMap: Record<string, { id: string | number, name: string, avatar?: string | null, ratings: number[] }> = {};
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
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('main')}
              className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Recensioni Amici
              {friendsList.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {friendsList.length}
                </span>
              )}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pt-4 pr-2">
          {friendsList.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center h-full">
              <EmptyState message="Nessun amico ha recensito questa serie." />
            </div>
          ) : (
            friendsList.map(friend => (
              <div 
                key={friend.id} 
                onClick={() => { setSelectedFriendId(String(friend.id)); setView('friend_detail'); }}
                className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-shadow hover:shadow-md hover:border-blue-300 group"
              >
                <div className="flex items-center gap-4">
                  <img src={friend.avatar || undefined} alt={friend.name} className="w-10 h-10 rounded-full border border-gray-200" />
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

  if (view === 'friend_detail' && selectedFriendId) {
    const friendLogs = friendsLogsData.filter(l => String(l.friend_id) === selectedFriendId).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    const friendName = friendLogs[0]?.friend_name || '';

    return (
      <div className="flex flex-col h-full animate-fadeIn">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('friends_reviews')}
              className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              I voti di {friendName}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pt-4 pr-2">
          {friendLogs.map((log) => (
            <div key={log.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 transition-shadow hover:shadow-sm cursor-pointer"
              onClick={() => {
                setSelectedReview({
                  id: log.id as any,
                  author_id: String(log.friend_id),
                  author_name: log.friend_name,
                  author_avatar: log.friend_avatar || "",
                  rating: (log.rating || 0) / 2,
                  notes: log.notes || "",
                  updated_at: log.updated_at,
                  comments: (log as any).comments || [],
                  is_mine: false,
                  original_log: log
                });
                setView('review_detail');
              }}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <StarRating value={(log.rating || 0) / 2} hideNumber readonly iconClassName="w-5 h-5" />
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {new Date(log.updated_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              
              <div className="relative mt-1">
                {log.review_visibility === 'private' ? (
                  <div className="text-sm italic text-gray-400">Recensione nascosta (Privata)</div>
                ) : log.notes ? (
                  <div className="text-sm text-gray-700">{log.notes}</div>
                ) : null}
              </div>
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
              onClick={() => setView(selectedReview.is_mine ? 'my_reviews' : 'friend_detail')}
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
                  confirmDeleteLog(Number(selectedReview.id));
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
                {selectedReview.author_avatar ? (
                  <img src={selectedReview.author_avatar} alt={selectedReview.author_name} className="w-10 h-10 rounded-full border border-gray-100" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-700 font-bold text-base">{selectedReview.author_name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <div className="font-bold text-gray-900">{selectedReview.author_name}</div>
                  <div className="text-xs text-gray-500">{new Date(selectedReview.updated_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
              <StarRating value={selectedReview.rating || 0} hideNumber readonly iconClassName="w-6 h-6" />
            </div>
            
            <div className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
              {selectedReview.notes}
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
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-0 focus:border-blue-500 outline-none resize-none h-12 custom-scrollbar transition-colors"
              placeholder="Scrivi un commento..."
              rows={1}
            />
            
            <button 
              onClick={async () => {
                if (!commentText.trim()) return;
                await createInteraction.mutateAsync({
                  interaction_type: 'SERIES_REVIEW_COMMENT',
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

  // main view

  return (
    <div className="flex flex-col gap-6 animate-fadeIn h-full">
      
      {/* Voti Globali */}
      <div className="flex items-center justify-center gap-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0">
        <div className="flex flex-col items-center gap-2">
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

        <div 
          onClick={() => setView('friends_reviews')}
          className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors p-2 -m-2 group"
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

        <div className="w-px h-12 bg-gray-200"></div>

        <div 
          onClick={() => setView('my_reviews')}
          className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors p-2 -m-2 group"
        >
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-blue-500 transition-colors">Il Tuo Voto</span>
          <div className="flex items-center" title={`Media basata su ${logs.filter(l => typeof l.rating === 'number').length} voti`}>
            {myAverage !== null ? (
              <StarRating value={myAverage} hideNumber readonly iconClassName="w-6 h-6" />
            ) : (
              <span className="text-gray-400 font-medium">--</span>
            )}
          </div>
        </div>
      </div>

      {/* Citazioni (sola lettura) */}
      <div className="flex-1 flex flex-col min-h-0 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Citazioni
            {SERIES_QUOTES.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {SERIES_QUOTES.length}
              </span>
            )}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pt-5 pr-2">
          {SERIES_QUOTES.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center h-full">
              <EmptyState message="Nessuna citazione salvata per questa serie." />
            </div>
          ) : (
            SERIES_QUOTES.map(q => (
              <div key={q.id} className="relative bg-white border border-gray-200 rounded-2xl p-4 pt-5 flex flex-col gap-2">
                <span 
                  onClick={() => onOpenEpisode && onOpenEpisode(q.episodeData)}
                  className="absolute -top-3 left-4 px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-blue-600 shadow-sm tracking-wider cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  title="Apri Dettaglio Episodio"
                >
                  {q.episodeStr}
                </span>
                <p className="text-gray-800 italic font-medium leading-relaxed">
                  "{q.text}"
                </p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

const ReviewItem: React.FC<{ log: UserSeriesLog, onEdit: () => void, onDelete: () => void, onSelectReview?: () => void }> = ({ log, onEdit, onDelete, onSelectReview }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 transition-shadow hover:shadow-sm">
      <div className="flex justify-between items-start cursor-pointer" onClick={() => { if (onSelectReview) onSelectReview(); else setExpanded(!expanded); }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {log.rating ? (
              <StarRating value={log.rating} hideNumber readonly iconClassName="w-5 h-5" />
            ) : (
              <span className="text-gray-400 text-sm font-medium">Nessun voto</span>
            )}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            {new Date(log.updated_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        
        {/* Azioni visibili solo in hover (group-hover) */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
            title="Modifica recensione"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-gray-400 hover:text-red-600 transition-colors p-1"
            title="Elimina recensione"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {log.notes && (
        <div className="relative">
          <div 
            onClick={() => { if (onSelectReview) onSelectReview(); else setExpanded(!expanded); }}
            className={`text-sm text-gray-700 cursor-pointer ${
              expanded ? 'max-h-32 overflow-y-auto custom-scrollbar pr-2' : 'line-clamp-1'
            }`}
          >
            {log.notes}
          </div>
        </div>
      )}
    </div>
  );
};
