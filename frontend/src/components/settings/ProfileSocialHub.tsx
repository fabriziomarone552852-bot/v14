// src/components/settings/ProfileSocialHub.tsx
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocial } from '@/hooks/useSocial';
import { LoadingIcon } from '@/components/shared/utils/Icons';
import { UserProfileModal } from '@/components/social/UserProfileModal';
import type { FriendStatusResponse } from '@/types/social';
import { useConfirm } from '@/context/ConfirmContext';
import { resolveImageUrl } from '@/utils/imageUtils';

export const ProfileSocialHub: React.FC = () => {
  const { user } = useAuth();
  const { friends, pendingRequests, sentRequests, isLoadingFriends, searchUser, acceptRequest, removeFriendship } = useSocial();
  const { confirm } = useConfirm();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [foundUser, setFoundUser] = useState<FriendStatusResponse | null>(null);

  if (!user) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    searchUser.mutate(searchQuery.trim(), {
      onSuccess: (res) => {
        if (res && res.length > 0) {
          setFoundUser(res[0]);
        } else {
          alert('Utente non trovato');
        }
      },
      onError: () => alert('Errore durante la ricerca')
    });
  };

  // Filtro dinamico degli amici nel frontend in memoria (RAM)
  const filteredFriends = friends.filter(friendRel => {
    const isRequester = friendRel.requester_id === user.id;
    const friend = isRequester ? friendRel.addressee : friendRel.requester;
    if (!friend) return false;
    return friend.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="lg:col-span-8 flex flex-col h-full">
      <div className="bg-slate-50/50 rounded-3xl border border-slate-200/80 p-4 flex flex-col h-full overflow-hidden">
        
        {/* Header & Search */}
        <div className="mb-3 shrink-0">
          <h2 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Social Hub
          </h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Ricerca tra i tuoi amici o ricercane di nuovi"
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 shadow-sm transition-colors min-w-0"
              disabled={searchUser.isPending}
            />
            <button 
              type="submit"
              disabled={searchUser.isPending || !searchQuery.trim()}
              className="px-5 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center cursor-pointer shrink-0"
            >
              {searchUser.isPending ? <LoadingIcon className="w-5 h-5 animate-spin" /> : 'Cerca'}
            </button>
          </form>
        </div>

        {/* Area Scrollabile (Richieste & Amici) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col min-h-0">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 shrink-0 flex items-center gap-2">
             Amici e richieste
             {(pendingRequests.length > 0 || sentRequests.length > 0) && (
               <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[10px]">
                 {pendingRequests.length + sentRequests.length} in sospeso
               </span>
             )}
          </h3>
          
          <div className="space-y-2 pb-2">
            {isLoadingFriends ? (
              <div className="flex justify-center p-8"><LoadingIcon className="w-8 h-8 text-slate-300 animate-spin" /></div>
            ) : pendingRequests.length === 0 && sentRequests.length === 0 && filteredFriends.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-sm font-medium text-slate-500">
                  {searchQuery ? 'Nessun utente corrisponde alla ricerca.' : 'Non hai ancora aggiunto amici né richieste in sospeso.'}
                </p>
              </div>
            ) : (
              <>
                {/* Richieste Ricevute */}
                {pendingRequests.map(req => (
                  <div key={`req-rec-${req.id}`} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm ring-1 ring-red-100 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>
                    <div className="flex items-center gap-3 pl-2">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-200 shadow-sm">
                        {req.requester?.profile_picture_url ? (
                          <img src={resolveImageUrl(req.requester.profile_picture_url, '/default_avatar.png')} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-slate-400 text-sm">{req.requester?.username?.substring(0,2).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="font-bold text-base text-slate-800">@{req.requester?.username}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => acceptRequest.mutate(req.requester_id)}
                        disabled={acceptRequest.isPending}
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        Accetta
                      </button>
                      <button 
                        onClick={() => removeFriendship.mutate(req.requester_id)}
                        disabled={removeFriendship.isPending}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        Rifiuta
                      </button>
                    </div>
                  </div>
                ))}

                {/* Richieste Inviate */}
                {sentRequests.map(req => (
                  <div key={`req-sent-${req.id}`} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-200 shadow-sm">
                        {req.addressee?.profile_picture_url ? (
                          <img src={resolveImageUrl(req.addressee.profile_picture_url, '/default_avatar.png')} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-slate-400 text-sm">{req.addressee?.username?.substring(0,2).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="font-bold text-base text-slate-800">@{req.addressee?.username}</span>
                    </div>
                    <button 
                      disabled
                      className="px-3 py-1.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-lg cursor-not-allowed border border-slate-200"
                    >
                      In attesa
                    </button>
                  </div>
                ))}

                {/* Amici */}
                {filteredFriends.map(friendRel => {
                  const isRequester = friendRel.requester_id === user.id;
                  const friend = isRequester ? friendRel.addressee : friendRel.requester;
                  if (!friend) return null;

                  return (
                    <div key={`friend-${friendRel.id}`} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-200 shadow-sm">
                          {friend.profile_picture_url ? (
                            <img src={resolveImageUrl(friend.profile_picture_url, '/default_avatar.png')} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-slate-400 text-sm">{friend.username.substring(0,2).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="font-bold text-base text-slate-800">@{friend.username}</span>
                      </div>
                      <button 
                        onClick={() => {
                          confirm({
                            title: 'Rimuovi Amicizia',
                            message: `Vuoi davvero rimuovere @${friend.username} dagli amici?`,
                            confirmText: 'Sì, rimuovi',
                            isDestructive: true,
                            onConfirm: () => removeFriendship.mutate(friend.id)
                          });
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-red-50 text-blue-600 hover:text-red-600 font-bold text-xs rounded-lg transition-colors cursor-pointer border border-blue-100 hover:border-red-100"
                        title="Rimuovi amicizia"
                      >
                        Rimuovi
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {foundUser && (
        <UserProfileModal 
          userStatus={foundUser} 
          onClose={() => {
            setFoundUser(null);
            searchUser.reset();
          }} 
        />
      )}
    </div>
  );
};
