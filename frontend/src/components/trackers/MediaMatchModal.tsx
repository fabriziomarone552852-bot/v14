import React from 'react';
import { LoadingIcon } from '@/components/shared/utils/Icons';
import { resolveImageUrl } from '@/utils/imageUtils';
import { useMediaMatchLogic } from '@/hooks/trackers/useMediaMatchLogic';

interface MediaMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain?: 'series' | 'movies' | 'books';
}

export const MediaMatchModal: React.FC<MediaMatchModalProps> = ({ isOpen, onClose, domain = 'series' }) => {
  const {
    selectedListId,
    setSelectedListId,
    selectedFriends,
    mappedFriends,
    myLists,
    user,
    activeSession,
    isLoadingSessions,
    matchResults,
    isResultsLoading,
    isCreatePending,
    isMyTurn,
    toggleFriend,
    handleCreate,
    handleJoin,
  } = useMediaMatchLogic({ isOpen, domain });

  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoadingSessions) {
      return (
        <div className="flex justify-center p-10">
          <LoadingIcon className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
    }

    if (activeSession) {
      // Room active: completed results
      if (activeSession.status === 'completed') {
        return (
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-center mb-4">Risultati dell'incrocio 🎉</h3>
            {isResultsLoading ? (
              <div className="flex justify-center p-10">
                <LoadingIcon className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : matchResults && matchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {matchResults.map((res, idx) => (
                  <div key={idx} className="flex flex-col items-center group relative overflow-hidden rounded-xl border border-gray-200">
                    <div className="aspect-[2/3] w-full bg-gray-100">
                      {res.poster_path ? (
                        <img src={`https://image.tmdb.org/t/p/w500${res.poster_path}`} alt={res.title} className="w-full h-full object-cover" />
                      ) : (
                        <img src="/no-poster.png" alt="No Image" className="w-full h-full object-cover opacity-50" />
                      )}
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                      <p className="text-white font-bold text-xs line-clamp-1">{res.title}</p>
                      <p className="text-blue-300 text-[10px]">{res.matched_users.length} match</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-10">Nessuna serie in comune trovata.</p>
            )}
          </div>
        );
      }

      // Room active: waiting/voting
      return (
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-center">Stanza Incrocio Liste</h3>
          <p className="text-center text-sm text-gray-500 mb-4">In attesa che tutti facciano la loro scelta...</p>

          <div className="flex flex-col md:flex-row gap-6">
            {/* AMICI STATUS */}
            <div className="flex-1 flex flex-col gap-2 bg-gray-50 p-4 rounded-xl">
              <h4 className="font-bold text-gray-700 mb-2">Partecipanti</h4>
              {activeSession.participants.map((p) => {
                const friend = mappedFriends.find((f) => f.id === p.user_id);
                const isMe = p.user_id === user?.id;
                const name = friend?.username || (isMe ? 'Tu' : `User ${p.user_id}`);
                const avatar = friend?.profile_picture_url ? resolveImageUrl(friend?.profile_picture_url) : '/default_avatar.png';

                return (
                  <div key={p.user_id} className="flex items-center justify-between bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2">
                      <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-semibold text-sm">{name}</span>
                    </div>
                    <div>
                      {p.status === 'joined' ? (
                        <span className="text-green-500" title="Pronto">✅</span>
                      ) : p.status === 'declined' ? (
                        <span className="text-red-500" title="Rifiutato">❌</span>
                      ) : (
                        <span className="text-amber-500" title="In attesa">🕒</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LA MIA SCELTA SE TOCCA A ME */}
            {isMyTurn && (
              <div className="flex-1 flex flex-col gap-2">
                <h4 className="font-bold text-gray-700 mb-2">Scegli la tua lista</h4>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  <button
                    onClick={() => setSelectedListId('catalog')}
                    className={`text-left flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                      selectedListId === 'catalog'
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-xs'
                        : 'text-gray-600 hover:bg-gray-50 font-medium border border-transparent'
                    }`}
                  >
                    <span className="truncate font-bold">Tutto il mio Catalogo</span>
                    {selectedListId === 'catalog' && <span className="text-blue-500">✓</span>}
                  </button>
                  {myLists?.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => setSelectedListId(list.id)}
                      className={`text-left flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                        selectedListId === list.id
                          ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-xs'
                          : 'text-gray-600 hover:bg-gray-50 font-medium border border-transparent'
                      }`}
                    >
                      <span className="truncate">{list.name}</span>
                      {list.items && (
                        <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full ml-2 shrink-0 shadow-sm">
                          {list.items.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleJoin}
                  className="mt-2 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
                >
                  Conferma Scelta
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Default mode: Create new room
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Seleziona Lista */}
          <div className="flex-1 flex flex-col gap-2">
            <h4 className="font-bold text-gray-700">Le mie liste</h4>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              <button
                onClick={() => setSelectedListId('catalog')}
                className={`text-left flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                  selectedListId === 'catalog'
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50 font-medium border border-transparent'
                }`}
              >
                <span className="truncate">Tutto il mio Catalogo</span>
                {selectedListId === 'catalog' && <span className="text-blue-500">✓</span>}
              </button>
              {myLists?.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={`text-left flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                    selectedListId === list.id
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-xs'
                      : 'text-gray-600 hover:bg-gray-50 font-medium border border-transparent'
                  }`}
                >
                  <span className="truncate">{list.name}</span>
                  {list.items && (
                    <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full ml-2 shrink-0 shadow-sm">
                      {list.items.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Seleziona Amici */}
          <div className="flex-1 flex flex-col gap-2">
            <h4 className="font-bold text-gray-700">Amici da invitare</h4>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {mappedFriends.map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => toggleFriend(friend.id)}
                  className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all ${
                    selectedFriends.includes(friend.id) ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <img
                    src={friend.profile_picture_url ? resolveImageUrl(friend.profile_picture_url) : '/default_avatar.png'}
                    alt={friend.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-bold flex-1">{friend.username}</span>
                  {selectedFriends.includes(friend.id) && <span className="text-blue-500 pr-2">✓</span>}
                </div>
              ))}
              {mappedFriends.length === 0 && <p className="text-sm text-gray-500">Nessun amico trovato.</p>}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCreate}
            disabled={selectedFriends.length === 0 || isCreatePending}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {isCreatePending ? 'Creazione...' : 'Invia Inviti'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800 px-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Incrocio Liste
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
};
