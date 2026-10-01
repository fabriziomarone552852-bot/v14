import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/context/AuthContext';
import { BellIcon, CloseIcon, SearchIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export const NotificationsSidebar: React.FC = () => {
  const { unreadNotifications, allNotifications, readInteraction, createInteraction } = useNotifications();
  const { friends, pendingRequests, acceptRequest, removeFriendship } = useSocial();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifiche' | 'messaggi'>('notifiche');
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [retainedMessages, setRetainedMessages] = useState<any[]>([]);
  
  // Separazione Notifiche regolari da Messaggi Effimeri, ordinate dalla più recente
  const regularNotifications = allNotifications
    .filter(n => n.interaction_type !== 'EPHEMERAL_MSG')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  // Uniamo i messaggi effimeri correnti con quelli appena letti (trattenuti in UI fino alla chiusura)
  const ephemeralMessages = [
    ...allNotifications.filter(n => n.interaction_type === 'EPHEMERAL_MSG'),
    ...retainedMessages
  ]
    .filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i) // unique by id
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const unreadRegularCount = unreadNotifications.filter(n => n.interaction_type !== 'EPHEMERAL_MSG').length;
  const unreadEphemeralCount = unreadNotifications.filter(n => n.interaction_type === 'EPHEMERAL_MSG').length;
  
  const hasUnreadNotifiche = unreadRegularCount > 0 || pendingRequests.length > 0;
  const hasUnreadMessaggi = unreadEphemeralCount > 0;
  const hasUnread = hasUnreadNotifiche || hasUnreadMessaggi;

  useEffect(() => {
    // Quando la sidebar è aperta e siamo sulla tab 'messaggi', consideriamo TUTTI i messaggi effimeri visibili come "letti"
    if (isOpen && activeTab === 'messaggi') {
      const unreadEphemerals = allNotifications.filter(n => n.interaction_type === 'EPHEMERAL_MSG' && !n.read_at);
      if (unreadEphemerals.length > 0) {
        // Li salviamo localmente così restano visibili finché non chiude la sidebar
        setRetainedMessages(prev => {
          const newRetained = [...prev];
          unreadEphemerals.forEach(m => {
            if (!newRetained.find(rm => rm.id === m.id)) {
              newRetained.push({ ...m, read_at: new Date().toISOString() });
            }
          });
          return newRetained;
        });
        
        // E li bruciamo sul server istantaneamente
        unreadEphemerals.forEach(m => {
          readInteraction.mutate(m.id);
        });
      }
    }
  }, [isOpen, activeTab, allNotifications, readInteraction]);

  const handleClose = () => {
    setIsOpen(false);
    setRetainedMessages([]);
    setSelectedFriendId(null);
  };

  const handleNotificationClick = (interaction: any) => {
    if (!interaction.read_at) {
      readInteraction.mutate(interaction.id);
    }
    if (interaction.interaction_type === 'SHOPPING_GROUP_INVITE') {
      navigate(`/shopping?openGroup=${interaction.reference_id}`);
      handleClose();
    } else if (interaction.interaction_type === 'SERIES_REVIEW_COMMENT' || interaction.interaction_type === 'SERIES_REVIEW_COMMENT_THREAD' || interaction.interaction_type === 'SERIES_REVIEW_MENTION') {
      navigate(`/trackers/serie-tv?tmdb_id=${interaction.series_tmdb_id}&open_review=true&open_review_log_id=${interaction.reference_id}`);
      handleClose();
    } else if (interaction.interaction_type === 'EPISODE_REVIEW_COMMENT' || interaction.interaction_type === 'EPISODE_REVIEW_COMMENT_THREAD' || interaction.interaction_type === 'EPISODE_REVIEW_MENTION') {
      navigate(`/trackers/serie-tv?tmdb_id=${interaction.series_tmdb_id}&open_episode=${interaction.episode_id}&open_review_log_id=${interaction.reference_id}`);
      handleClose();
    }
  };

  const getFriendUser = (friendship: any) => {
    return friendship.requester_id === user?.id ? friendship.addressee : friendship.requester;
  };

  // Creiamo la lista validFriends e aggiungiamo un flag se hanno messaggi effimeri pendenti
  let validFriends = friends
    .map(f => {
      const friendUser = getFriendUser(f);
      if (!friendUser) return null;
      // Trova eventuali messaggi effimeri da questo amico
      const friendMessages = ephemeralMessages.filter(m => m.author_id === friendUser.id);
      return { ...friendUser, friendMessages };
    })
    .filter(f => f != null)
    .filter(f => f.username.toLowerCase().includes(searchQuery.toLowerCase()));

  // Ordinamento: amici con messaggi in sospeso in cima (dal più recente), poi ordine alfabetico
  validFriends.sort((a, b) => {
    const aHasMsg = a.friendMessages.length > 0;
    const bHasMsg = b.friendMessages.length > 0;
    if (aHasMsg && !bHasMsg) return -1;
    if (!aHasMsg && bHasMsg) return 1;
    // Se entrambi hanno messaggi, ordina per il più recente
    if (aHasMsg && bHasMsg) {
      const aDate = new Date(a.friendMessages[0].created_at).getTime();
      const bDate = new Date(b.friendMessages[0].created_at).getTime();
      return bDate - aDate;
    }
    // Altrimenti ordine alfabetico
    return a.username.localeCompare(b.username);
  });

  const handleSendMessage = (friendId: number) => {
    if (!messageText.trim()) return;
    createInteraction.mutate({
      interaction_type: 'EPHEMERAL_MSG',
      recipient_id: friendId,
      content: messageText.trim()
    });
    setMessageText('');
    setSelectedFriendId(null);
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)} 
        className={`fixed right-0 top-1/3 -translate-y-1/2 translate-x-8 hover:translate-x-0 w-20 hover:w-28 h-14 rounded-l-2xl shadow-[-5px_0_15px_rgba(0,0,0,0.1)] flex items-center justify-start pl-3 cursor-pointer transition-all duration-300 z-60 border group text-white ${hasUnread ? 'bg-red-600 border-y-red-500 border-l-red-500 animate-pulse hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500 border-y-blue-400 border-l-blue-400'}`}
      >
        <div className="relative">
          <BellIcon className="w-6 h-6" />
        </div>
        <span className="ml-2 font-black text-sm uppercase opacity-0 group-hover:opacity-100 transition-opacity delay-100">
          Inbox
        </span>
      </div>

      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[100] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
            <BellIcon className="w-5 h-5 text-blue-600" />
            Inbox
          </h2>
          <button onClick={() => handleClose()} className="text-gray-400 hover:text-red-500 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="flex p-2 bg-gray-100 mx-4 mt-4 rounded-lg">
          <button 
            className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors relative ${activeTab === 'notifiche' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('notifiche')}
          >
            Notifiche
            {hasUnreadNotifiche && <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>
          <button 
            className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors relative ${activeTab === 'messaggi' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => {
              setActiveTab('messaggi');
              setSelectedFriendId(null);
            }}
          >
            Messaggi Effimeri
            {hasUnreadMessaggi && <span className="absolute top-2 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col">
          {activeTab === 'notifiche' && (
            <div className="flex flex-col gap-2 h-full">
              {regularNotifications.length === 0 && pendingRequests.length === 0 ? (
                <EmptyState 
                  icon={<BellIcon className="w-12 h-12 text-gray-300" />} 
                  message="Nessuna notifica da mostrare."
                  className="mt-10"
                />
              ) : (
                <ul className="space-y-2">
                  {/* Richieste di Amicizia (In cima) */}
                  {pendingRequests.map(req => (
                    <li key={`req-${req.id}`} className="p-3 rounded-xl border bg-amber-50 border-amber-200 shadow-sm">
                      <div className="flex gap-3">
                        <div className="mt-1">
                          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 font-bold mb-1">
                            Richiesta di Amicizia
                          </p>
                          <p className="text-xs text-gray-600 mb-3">
                            <span className="font-bold text-gray-800">{req.requester?.username}</span> vorrebbe stringere amicizia con te.
                          </p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => acceptRequest.mutate(req.requester_id)}
                              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
                            >
                              Accetta
                            </button>
                            <button 
                              onClick={() => removeFriendship.mutate(req.requester_id)}
                              className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold py-1.5 rounded-lg transition-colors"
                            >
                              Rifiuta
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}

                  {/* Interazioni normali (NO messaggi effimeri) */}
                  {regularNotifications.map((notif) => (
                    <li 
                      key={notif.id} 
                      className={`p-3 rounded-xl border transition-colors cursor-pointer ${!notif.read_at ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">
                          {!notif.read_at ? (
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm text-gray-800 ${!notif.read_at ? 'font-bold' : 'font-medium'}`}>
                            {notif.interaction_type === 'SERIES_REVIEW_COMMENT' ? `${notif.author_name || 'Qualcuno'} ha commentato la tua recensione di ${notif.context_title || 'una serie'}` : 
                             notif.interaction_type === 'SERIES_REVIEW_COMMENT_THREAD' ? `${notif.author_name || 'Qualcuno'} ha partecipato alla discussione sulla recensione di ${notif.context_title || 'una serie'}` : 
                             notif.interaction_type === 'SERIES_REVIEW_MENTION' ? `${notif.author_name || 'Qualcuno'} ti ha menzionato nella recensione di ${notif.context_title || 'una serie'}` :
                             notif.interaction_type === 'EPISODE_REVIEW_COMMENT' ? `${notif.author_name || 'Qualcuno'} ha commentato la tua recensione dell'episodio ${notif.context_title || ''}` : 
                             notif.interaction_type === 'EPISODE_REVIEW_COMMENT_THREAD' ? `${notif.author_name || 'Qualcuno'} ha partecipato alla discussione sulla recensione dell'episodio ${notif.context_title || ''}` : 
                             notif.interaction_type === 'EPISODE_REVIEW_MENTION' ? `${notif.author_name || 'Qualcuno'} ti ha menzionato nella recensione dell'episodio ${notif.context_title || ''}` :
                             notif.content}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] uppercase font-bold text-gray-400">
                              {notif.interaction_type === 'SHOPPING_GROUP_INVITE' 
                                ? 'Invito Gruppo Spesa' 
                                : notif.interaction_type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: it })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'messaggi' && (
            <div className="flex flex-col gap-4 h-full">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs leading-relaxed">
                <p className="font-semibold mb-1">Seleziona un amico per inviare un messaggio effimero.</p>
                <p>Il messaggio si autodistruggerà appena verrà letto!</p>
              </div>
              
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-between mb-1 h-8">
                  {!isSearching ? (
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">I tuoi amici</h3>
                  ) : (
                    <input
                      type="text"
                      autoFocus
                      placeholder="Cerca amico..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 mr-2 px-2 py-1 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                    />
                  )}
                  <button 
                    onClick={() => {
                      if (isSearching) setSearchQuery('');
                      setIsSearching(!isSearching);
                    }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {isSearching ? <CloseIcon className="w-4 h-4" /> : <SearchIcon className="w-4 h-4" />}
                  </button>
                </div>

                {friends.length === 0 ? (
                  <EmptyState 
                    icon={<span className="text-4xl block">👥</span>}
                    message="Non sono presenti ancora amici nella tua lista."
                    className="mt-6"
                  />
                ) : validFriends.length === 0 ? (
                  <EmptyState 
                    message="Nessun amico trovato con questo nome."
                    className="mt-6"
                  />
                ) : (
                  validFriends.map((friend: any) => {
                    const isSelected = selectedFriendId === friend.id;
                    const hasMessages = friend.friendMessages.length > 0;
                    
                    return (
                      <div key={friend.id} className={`flex flex-col border rounded-xl overflow-hidden shadow-sm transition-all bg-white ${hasMessages ? 'border-blue-300' : 'border-gray-100'}`}>
                        
                        <div 
                          className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-b border-blue-100' : 'hover:bg-gray-50'}`}
                          onClick={() => {
                            setSelectedFriendId(isSelected ? null : friend.id);
                            if (!isSelected) setMessageText('');
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {friend.profile_picture_url ? (
                              <img src={friend.profile_picture_url} alt={friend.username} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                {friend.username.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span className="font-bold text-gray-700">{friend.username}</span>
                          </div>
                        </div>

                        {/* Messaggi Ricevuti (Visibili sotto il nome) */}
                        {!isSelected && hasMessages && (
                          <div className="px-3 pb-3 pt-1 bg-blue-50/30">
                            {friend.friendMessages.map((msg: any) => (
                              <div key={msg.id} className="text-sm text-gray-800 p-3 bg-white rounded-lg border border-blue-100 mb-2 shadow-sm italic cursor-pointer" onClick={() => setSelectedFriendId(friend.id)}>
                                "{msg.content}"
                              </div>
                            ))}
                            <div className="text-[10px] text-blue-500 font-bold px-1 uppercase tracking-wider text-center mt-1 cursor-pointer" onClick={() => setSelectedFriendId(friend.id)}>
                              Clicca qui se vuoi rispondere
                            </div>
                          </div>
                        )}

                        {/* Area di Composizione Messaggio */}
                        {isSelected && (
                          <div className="p-3 bg-white flex flex-col gap-3 animate-fadeIn">
                            {hasMessages && (
                              <div className="mb-2">
                                {friend.friendMessages.map((msg: any) => (
                                  <div key={msg.id} className="text-sm text-gray-800 p-3 bg-blue-50 rounded-lg border border-blue-200 mb-2 shadow-sm italic relative">
                                    "{msg.content}"
                                    <div className="text-[10px] text-gray-400 mt-2 not-italic text-right uppercase font-bold tracking-widest">
                                      Letto e bruciato 🚀
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <textarea
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              placeholder={`Scrivi un messaggio a ${friend.username}...`}
                              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[80px]"
                              autoFocus
                            />
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleSendMessage(friend.id)}
                                disabled={!messageText.trim()}
                                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Invia Messaggio
                              </button>
                            </div>
                          </div>
                        )}
                        
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] transition-opacity" 
          onClick={() => handleClose()}
        ></div>
      )}
    </>
  );
};
