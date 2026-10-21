import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BellIcon, CloseIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import { NotificationsTab } from '@/components/shared/notifications/NotificationsTab';
import { MessagesTab } from '@/components/shared/notifications/MessagesTab';
import { useNotificationsInbox } from '@/hooks/useNotificationsInbox';
import { useBackHandler } from '@/utils/backButtonManager';

export interface MobileNotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNotificationsSheet: React.FC<MobileNotificationsSheetProps> = ({
  isOpen,
  onClose,
}) => {
  // Integrazione tasto Indietro Android (priorità 9 per chiudere il cassetto notifiche)
  useBackHandler(isOpen, onClose, 9);

  // Chiudi con tasto Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const {
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
    hasUnreadNotifiche,
    hasUnreadMessaggi,
    validFriends,
    friends,
    pendingRequests,
    acceptRequest,
    removeFriendship,
    handleNotificationClick,
    handleSendMessage,
    handleClose,
    isNavigating,
    navigatingMessage,
  } = useNotificationsInbox({
    isOpen,
    onClose,
  });

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* 1. Backdrop oscurato con sfocatura */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* 2. Pannello Bottom Sheet a scorrimento dal basso verso l'alto */}
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-gray-200 flex flex-col h-[88dvh] max-h-[92dvh] z-10 animate-slideUp overflow-hidden">
        {/* Pull bar / drag handle touch */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2.5 shrink-0" />

        {/* Header con titolo ed esci */}
        <div className="px-4 pb-3 flex items-center justify-between border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BellIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 tracking-tight leading-tight">
                Inbox & Notifiche
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all cursor-pointer focus:outline-none"
            aria-label="Chiudi notifiche"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher Segmentato */}
        <div className="flex p-1.5 bg-gray-100 mx-4 mt-3 rounded-xl shrink-0">
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all relative cursor-pointer ${
              activeTab === 'notifiche'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('notifiche')}
          >
            Notifiche
            {hasUnreadNotifiche && (
              <span className="absolute top-2 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all relative cursor-pointer ${
              activeTab === 'messaggi'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => {
              setActiveTab('messaggi');
              setSelectedFriendId(null);
            }}
          >
            Messaggi Effimeri
            {hasUnreadMessaggi && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {/* Contenuto Notifiche & Messaggi a Scorrimento */}
        <div className="flex-1 min-h-0 p-4 overflow-y-auto custom-scrollbar flex flex-col pb-[max(env(safe-area-inset-bottom,0px),16px)]">
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
              validFriends={validFriends}
              friends={friends}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedFriendId={selectedFriendId}
              setSelectedFriendId={setSelectedFriendId}
              messageText={messageText}
              setMessageText={setMessageText}
              handleSendMessage={handleSendMessage}
            />
          )}
        </div>

        {/* 4. Loading Overlay al tap di una notifica */}
        {isNavigating && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-30 animate-fadeIn select-none">
            <LoadingIcon className="w-10 h-10 text-blue-600 animate-spin -ml-0 mr-0" />
            <p className="text-sm font-bold text-gray-800 tracking-tight">{navigatingMessage}</p>
            <p className="text-xs text-gray-500 font-medium">Reindirizzamento in corso...</p>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileNotificationsSheet;
