import React from 'react';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { SearchIcon, CloseIcon } from '@/components/shared/utils/Icons';


import type { NotificationResponse } from '@/types/notifications';
import type { FriendshipResponse } from '@/types/social';

export interface MessageFriend {
  id: number;
  username: string;
  profile_picture_url?: string | null;
  friendMessages: NotificationResponse[];
}

interface Props {
  validFriends: MessageFriend[];
  friends: FriendshipResponse[];
  isSearching: boolean;
  setIsSearching: (b: boolean) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  
  selectedFriendId: number | null;
  setSelectedFriendId: (id: number | null) => void;
  messageText: string;
  setMessageText: (t: string) => void;
  handleSendMessage: (id: number) => void;
  
}

export const MessagesTab: React.FC<Props> = ({
  validFriends, selectedFriendId, setSelectedFriendId, friends, isSearching, setIsSearching, searchQuery, setSearchQuery,
  messageText, setMessageText, handleSendMessage, 
}) => {
  return (
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
                  validFriends.map((friend) => {
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
                            {friend.friendMessages.map((msg) => (
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
                                {friend.friendMessages.map((msg) => (
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
  );
};
