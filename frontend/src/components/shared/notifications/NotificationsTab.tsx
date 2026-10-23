import React from 'react';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { BellIcon } from '@/components/shared/utils/Icons';


import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import type { NotificationResponse } from '@/types/notifications';
import type { FriendshipResponse } from '@/types/social';

interface Props {
  regularNotifications: NotificationResponse[];
  pendingRequests: FriendshipResponse[];
  handleNotificationClick: (n: NotificationResponse) => void;
  acceptRequest: { mutate: (id: number) => void };
  removeFriendship: { mutate: (id: number) => void };
}

export const NotificationsTab: React.FC<Props> = ({
  regularNotifications, pendingRequests, handleNotificationClick,
  acceptRequest, removeFriendship
}) => {
  return (
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
                                : notif.interaction_type === 'SHOPPING_GROUP_NEW_LIST'
                                ? 'Nuova Lista Spesa'
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
  );
};
