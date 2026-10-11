import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/context/AuthContext';
import { BellIcon, CloseIcon } from '@/components/shared/utils/Icons';
import { NotificationsTab } from './NotificationsTab';
import { MessagesTab } from './MessagesTab';
import { useNavigate } from 'react-router-dom';
import type { NotificationResponse } from '@/types/notifications';
import type { FriendshipResponse } from '@/types/social';
import type { MessageFriend } from './MessagesTab';

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
  const [retainedMessages, setRetainedMessages] = useState<NotificationResponse[]>([]);
  
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

  const handleNotificationClick = (interaction: NotificationResponse) => {
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

  const getFriendUser = (friendship: FriendshipResponse) => {
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
    .filter((f): f is MessageFriend => f != null)
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
<NotificationsTab 
              regularNotifications={regularNotifications}
              pendingRequests={pendingRequests}
              handleNotificationClick={handleNotificationClick}
              acceptRequest={acceptRequest}
              removeFriendship={removeFriendship}
              
            />
)}

          {activeTab === 'messaggi' && (
<MessagesTab 
              validFriends={validFriends} friends={friends} isSearching={isSearching} setIsSearching={setIsSearching} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              
              selectedFriendId={selectedFriendId}
              setSelectedFriendId={setSelectedFriendId}
              messageText={messageText}
              setMessageText={setMessageText}
              handleSendMessage={handleSendMessage}
              
            />
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
