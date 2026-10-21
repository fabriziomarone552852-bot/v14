import React, { useState } from 'react';
import { BellIcon, CloseIcon } from '@/components/shared/utils/Icons';
import { NotificationsTab } from './NotificationsTab';
import { MessagesTab } from './MessagesTab';
import { useNotificationsInbox } from '@/hooks/useNotificationsInbox';

export const NotificationsSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

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
    hasUnread,
    validFriends,
    friends,
    pendingRequests,
    acceptRequest,
    removeFriendship,
    handleNotificationClick,
    handleSendMessage,
    handleClose,
  } = useNotificationsInbox({
    isOpen,
    onClose: () => setIsOpen(false),
  });

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
          <button onClick={handleClose} className="text-gray-400 hover:text-red-500 transition-colors">
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
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] transition-opacity" 
          onClick={handleClose}
        ></div>
      )}
    </>
  );
};
