import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/context/AuthContext';
import type { NotificationResponse } from '@/types/notifications';
import type { FriendshipResponse } from '@/types/social';
import type { MessageFriend } from '@/components/shared/notifications/MessagesTab';

export interface UseNotificationsInboxOptions {
  isOpen?: boolean;
  onClose?: () => void;
}

export const useNotificationsInbox = (options?: UseNotificationsInboxOptions) => {
  const { isOpen = false, onClose } = options || {};
  const { unreadNotifications, allNotifications, readInteraction, createInteraction } = useNotifications();
  const { friends, pendingRequests, acceptRequest, removeFriendship } = useSocial();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'notifiche' | 'messaggi'>('notifiche');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [retainedMessages, setRetainedMessages] = useState<NotificationResponse[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingMessage, setNavigatingMessage] = useState<string>('Caricamento in corso...');

  // Difesa contro risposte anomale: garantisce sempre array validi
  const safeAllNotifications = Array.isArray(allNotifications) ? allNotifications : [];
  const safeUnreadNotifications = Array.isArray(unreadNotifications) ? unreadNotifications : [];
  const safeFriends = Array.isArray(friends) ? friends : [];
  const safePendingRequests = Array.isArray(pendingRequests) ? pendingRequests : [];

  // Separazione Notifiche regolari da Messaggi Effimeri, ordinate dalla più recente
  const regularNotifications = safeAllNotifications
    .filter(n => n.interaction_type !== 'EPHEMERAL_MSG')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Messaggi effimeri correnti con quelli appena letti (trattenuti in UI fino alla chiusura)
  const ephemeralMessages = [
    ...safeAllNotifications.filter(n => n.interaction_type === 'EPHEMERAL_MSG'),
    ...retainedMessages
  ]
    .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadRegularCount = safeUnreadNotifications.filter(n => n.interaction_type !== 'EPHEMERAL_MSG').length;
  const unreadEphemeralCount = safeUnreadNotifications.filter(n => n.interaction_type === 'EPHEMERAL_MSG').length;

  const hasUnreadNotifiche = unreadRegularCount > 0 || safePendingRequests.length > 0;
  const hasUnreadMessaggi = unreadEphemeralCount > 0;
  const hasUnread = hasUnreadNotifiche || hasUnreadMessaggi;

  // Effetto Burn-After-Reading: quando la finestra è aperta sulla tab messaggi, segna come letti i messaggi effimeri
  useEffect(() => {
    if (isOpen && activeTab === 'messaggi') {
      const unreadEphemerals = safeAllNotifications.filter(n => n.interaction_type === 'EPHEMERAL_MSG' && !n.read_at);
      if (unreadEphemerals.length > 0) {
        setRetainedMessages(prev => {
          const newRetained = [...prev];
          unreadEphemerals.forEach(m => {
            if (!newRetained.find(rm => rm.id === m.id)) {
              newRetained.push({ ...m, read_at: new Date().toISOString() });
            }
          });
          return newRetained;
        });

        unreadEphemerals.forEach(m => {
          readInteraction.mutate(m.id);
        });
      }
    }
  }, [isOpen, activeTab, safeAllNotifications, readInteraction]);

  const handleClose = () => {
    setRetainedMessages([]);
    setSelectedFriendId(null);
    if (onClose) onClose();
  };

  const handleNotificationClick = (interaction: NotificationResponse) => {
    if (!interaction.read_at) {
      readInteraction.mutate(interaction.id);
    }

    let message = 'Caricamento in corso...';
    if (interaction.interaction_type === 'SHOPPING_GROUP_INVITE') {
      message = 'Apertura gruppo spesa...';
    } else if (interaction.interaction_type === 'SHOPPING_GROUP_NEW_LIST') {
      message = 'Apertura lista della spesa...';
    } else if (
      interaction.interaction_type.includes('REVIEW') ||
      interaction.interaction_type.includes('COMMENT') ||
      interaction.interaction_type.includes('MENTION')
    ) {
      message = 'Apertura recensione...';
    }

    setIsNavigating(true);
    setNavigatingMessage(message);

    if (interaction.interaction_type === 'SHOPPING_GROUP_INVITE') {
      navigate(`/shopping?openGroup=${interaction.reference_id}`);
    } else if (interaction.interaction_type === 'SHOPPING_GROUP_NEW_LIST') {
      navigate(`/shopping?listId=${interaction.reference_id}`);
    } else if (
      interaction.interaction_type === 'SERIES_REVIEW_COMMENT' ||
      interaction.interaction_type === 'SERIES_REVIEW_COMMENT_THREAD' ||
      interaction.interaction_type === 'SERIES_REVIEW_MENTION'
    ) {
      navigate(`/trackers/serie-tv?tmdb_id=${interaction.series_tmdb_id}&open_review=true&open_review_log_id=${interaction.reference_id}`);
    } else if (
      interaction.interaction_type === 'EPISODE_REVIEW_COMMENT' ||
      interaction.interaction_type === 'EPISODE_REVIEW_COMMENT_THREAD' ||
      interaction.interaction_type === 'EPISODE_REVIEW_MENTION'
    ) {
      navigate(`/trackers/serie-tv?tmdb_id=${interaction.series_tmdb_id}&open_episode=${interaction.episode_id}&open_review_log_id=${interaction.reference_id}`);
    }

    setTimeout(() => {
      handleClose();
      setIsNavigating(false);
    }, 320);
  };

  const getFriendUser = (friendship: FriendshipResponse) => {
    return friendship.requester_id === user?.id ? friendship.addressee : friendship.requester;
  };

  const validFriends = safeFriends
    .map(f => {
      const friendUser = getFriendUser(f);
      if (!friendUser) return null;
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
    if (aHasMsg && bHasMsg) {
      const aDate = new Date(a.friendMessages[0].created_at).getTime();
      const bDate = new Date(b.friendMessages[0].created_at).getTime();
      return bDate - aDate;
    }
    return a.username.localeCompare(b.username);
  });

  const handleSendMessage = (friendId: number) => {
    if (!messageText.trim()) return;
    createInteraction.mutate({
      interaction_type: 'EPHEMERAL_MSG',
      recipient_id: friendId,
      content: messageText.trim(),
    });
    setMessageText('');
    setSelectedFriendId(null);
  };

  return {
    activeTab,
    setActiveTab,
    isSearching,
    setIsSearching,
    searchQuery,
    setSearchQuery,
    selectedFriendId,
    setSelectedFriendId,
    messageText,
    setMessageText,
    regularNotifications,
    ephemeralMessages,
    unreadRegularCount,
    unreadEphemeralCount,
    hasUnreadNotifiche,
    hasUnreadMessaggi,
    hasUnread,
    validFriends,
    friends: safeFriends,
    pendingRequests: safePendingRequests,
    acceptRequest,
    removeFriendship,
    handleNotificationClick,
    handleSendMessage,
    handleClose,
    isNavigating,
    navigatingMessage,
  };
};
