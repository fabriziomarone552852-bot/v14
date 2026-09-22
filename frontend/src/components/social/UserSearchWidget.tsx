import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/api/apiService';
import { LoadingIcon, CloseIcon } from '@/components/shared/utils/Icons';
import { UserProfileModal } from './UserProfileModal';
import type { FriendStatusResponse } from '@/types/social';

export const UserSearchWidget: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [foundUser, setFoundUser] = useState<FriendStatusResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when expanding
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      // Backend esegue una ricerca esatta e non restituisce se stessi
      const res = await api.get<FriendStatusResponse[]>(`/social/search?q=${encodeURIComponent(query.trim())}`);
      if (res && res.length > 0) {
        setFoundUser(res[0]);
        // Chiudi la search bar
        setIsExpanded(false);
        setQuery('');
      } else {
        setErrorMsg('Utente non trovato');
      }
    } catch (err) {
      setErrorMsg('Errore ricerca');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setQuery('');
    setErrorMsg(null);
  };

  return (
    <>
      <div className="relative flex items-center h-full">
        <div 
          className={`flex items-center bg-white rounded-full border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'w-64 opacity-100' : 'w-10 opacity-70 hover:opacity-100 cursor-pointer'
          }`}
          onClick={() => {
            if (!isExpanded) setIsExpanded(true);
          }}
        >
          <button 
            type={isExpanded ? 'button' : 'button'}
            onClick={(e) => {
              if (isExpanded && query) {
                handleSearch(e);
              }
            }}
            className="w-10 h-10 flex items-center justify-center text-gray-500 shrink-0 hover:text-blue-600 transition-colors cursor-pointer"
          >
            {loading ? (
              <LoadingIcon className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>

          <form onSubmit={handleSearch} className="flex-1 flex items-center relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="Cerca username..."
              className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-700 py-2 pr-2"
              disabled={loading}
            />
          </form>

          {isExpanded && (
            <button 
              type="button" 
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="w-8 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Messaggio di errore a comparsa */}
        {errorMsg && isExpanded && (
          <div className="absolute top-full right-0 mt-2 bg-red-50 text-red-600 text-xs font-bold px-3 py-2 rounded-lg shadow-sm border border-red-100 whitespace-nowrap animate-fadeIn">
            {errorMsg}
          </div>
        )}
      </div>

      {foundUser && (
        <UserProfileModal 
          userStatus={foundUser} 
          onClose={() => setFoundUser(null)} 
        />
      )}
    </>
  );
};
