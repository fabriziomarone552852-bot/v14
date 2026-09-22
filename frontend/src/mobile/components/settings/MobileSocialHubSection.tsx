import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocial } from '@/hooks/useSocial';
import { useConfirm } from '@/context/ConfirmContext';
import { LoadingIcon } from '@/components/shared/utils/Icons';
import { UserProfileModal } from '@/components/social/UserProfileModal';
import { resolveImageUrl } from '@/utils/imageUtils';
import type { FriendStatusResponse } from '@/types/social';
import { Search } from 'lucide-react';

export const MobileSocialHubSection: React.FC = () => {
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

  const filteredFriends = friends.filter(friendRel => {
    const isRequester = friendRel.requester_id === user.id;
    const friend = isRequester ? friendRel.addressee : friendRel.requester;
    if (!friend) return false;
    return friend.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full space-y-4 animate-fadeIn pb-12">
      <div className="border-b border-gray-200 pb-3">
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          Amicizie
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Gestisci i tuoi contatti e invia nuove richieste</p>
      </div>

      <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-4">
        {/* Barra di ricerca */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Ricerca tra i tuoi amici o ricercane di nuovi"
              className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-colors"
              disabled={searchUser.isPending}
            />
          </div>
          <button 
            type="submit"
            disabled={searchUser.isPending || !searchQuery.trim()}
            className="px-4 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
          >
            {searchUser.isPending ? <LoadingIcon className="w-5 h-5 animate-spin" /> : 'Cerca'}
          </button>
        </form>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            Amici e richieste
            {(pendingRequests.length > 0 || sentRequests.length > 0) && (
              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md text-[10px]">
                {pendingRequests.length + sentRequests.length} in sospeso
              </span>
            )}
          </h3>

          <div className="space-y-3">
            {isLoadingFriends ? (
              <div className="flex justify-center p-6"><LoadingIcon className="w-8 h-8 text-gray-300 animate-spin" /></div>
            ) : pendingRequests.length === 0 && sentRequests.length === 0 && filteredFriends.length === 0 ? (
              <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-sm font-medium text-gray-500">
                  {searchQuery ? 'Nessun utente corrisponde alla ricerca.' : 'Non hai ancora aggiunto amici né richieste in sospeso.'}
                </p>
              </div>
            ) : (
              <>
                {/* Richieste Ricevute */}
                {pendingRequests.map(req => (
                  <div key={`req-rec-${req.id}`} className="flex flex-col gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm ring-1 ring-red-100 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>
                    <div className="flex items-center gap-3 pl-2">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200 shrink-0">
                        {req.requester?.profile_picture_url ? (
                          <img src={resolveImageUrl(req.requester.profile_picture_url, '/default_avatar.png')} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-gray-400 text-sm">{req.requester?.username?.substring(0,2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-gray-900 truncate">@{req.requester?.username}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Richiesta ricevuta</div>
                      </div>
                    </div>
                    <div className="flex gap-2 pl-2">
                      <button 
                        onClick={() => acceptRequest.mutate(req.requester_id)}
                        disabled={acceptRequest.isPending}
                        className="flex-1 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer"
                      >
                        Accetta
                      </button>
                      <button 
                        onClick={() => removeFriendship.mutate(req.requester_id)}
                        disabled={removeFriendship.isPending}
                        className="flex-1 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer"
                      >
                        Rifiuta
                      </button>
                    </div>
                  </div>
                ))}

                {/* Richieste Inviate */}
                {sentRequests.map(req => (
                  <div key={`req-sent-${req.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 opacity-90">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-white overflow-hidden flex items-center justify-center border border-gray-200 shrink-0">
                        {req.addressee?.profile_picture_url ? (
                          <img src={resolveImageUrl(req.addressee.profile_picture_url, '/default_avatar.png')} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-gray-400 text-sm">{req.addressee?.username?.substring(0,2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-sm text-gray-700 truncate">@{req.addressee?.username}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-gray-200 text-gray-600 font-bold text-[10px] rounded-lg shrink-0 uppercase tracking-wider">
                      In attesa
                    </span>
                  </div>
                ))}

                {/* Amici */}
                {filteredFriends.map(friendRel => {
                  const isRequester = friendRel.requester_id === user.id;
                  const friend = isRequester ? friendRel.addressee : friendRel.requester;
                  if (!friend) return null;

                  return (
                    <div key={`friend-${friendRel.id}`} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-50 overflow-hidden flex items-center justify-center border border-blue-100 shrink-0">
                          {friend.profile_picture_url ? (
                            <img src={resolveImageUrl(friend.profile_picture_url, '/default_avatar.png')} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-blue-400 text-sm">{friend.username.substring(0,2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-sm text-gray-900 truncate">@{friend.username}</div>
                        </div>
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
                        className="px-3 py-1.5 bg-rose-50 text-rose-600 font-bold text-xs rounded-lg border border-rose-100 hover:bg-rose-100 transition-colors shrink-0 cursor-pointer"
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

export default MobileSocialHubSection;
