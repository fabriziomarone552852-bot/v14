import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { CloseIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import type { FriendStatusResponse } from '@/types/social';
import { resolveImageUrl } from '@/utils/imageUtils';

interface UserProfileModalProps {
  userStatus: FriendStatusResponse;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ userStatus, onClose }) => {
  const [status, setStatus] = useState(userStatus.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = userStatus;
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const queryClient = useQueryClient();

  const handleAction = async () => {
    setLoading(true);
    setError(null);
    try {
      if (status === 'none') {
        // Invia richiesta
        await api.post(`/social/friends/request/${user.id}`);
        setStatus('pending_sent');
      } else if (status === 'accepted') {
        // Rimuovi amicizia
        await api.delete(`/social/friends/${user.id}`);
        setStatus('none');
      } else if (status === 'pending_received') {
        // Accetta amicizia
        await api.post(`/social/friends/accept/${user.id}`);
        setStatus('accepted');
      } else if (status === 'pending_sent') {
        // Annulla richiesta inviata
        await api.delete(`/social/friends/${user.id}`);
        setStatus('none');
      }
      queryClient.invalidateQueries({ queryKey: ['social'] });
    } catch (e: any) {
      setError(e.message || 'Errore durante l\'operazione');
    } finally {
      setLoading(false);
    }
  };

  const getButtonProps = () => {
    switch (status) {
      case 'none':
        return { text: 'Richiedi amicizia', className: 'bg-blue-600 hover:bg-blue-700 text-white' };
      case 'pending_sent':
        return { text: 'Richiesta inviata', className: 'bg-slate-200 hover:bg-slate-300 text-slate-800' };
      case 'pending_received':
        return { text: 'Accetta richiesta', className: 'bg-green-600 hover:bg-green-700 text-white' };
      case 'accepted':
        return { text: 'Rimuovi amicizia', className: 'bg-red-100 hover:bg-red-200 text-red-600' };
      default:
        return { text: '...', className: 'bg-slate-100 text-slate-400' };
    }
  };

  const btn = getButtonProps();

  return createPortal(
    <div 
      className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center relative animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {/* Profile Picture */}
        <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden mb-4 flex items-center justify-center">
          {user.profile_picture_url ? (
            <img src={resolveImageUrl(user.profile_picture_url, '/default_avatar.png')} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-black text-slate-400 uppercase">{user.username.substring(0, 2)}</span>
          )}
        </div>

        <h3 className="text-xl font-black text-slate-800 mb-1">@{user.username}</h3>
        <p className="text-sm text-slate-500 mb-6 font-semibold">{status === 'accepted' ? 'Siete Amici' : 'Nessun collegamento'}</p>

        {error && (
          <div className="mb-4 text-xs font-semibold text-red-500 bg-red-50 px-3 py-2 rounded-lg text-center w-full">
            {error}
          </div>
        )}

        <button
          onClick={handleAction}
          disabled={loading || status === 'blocked'}
          className={`w-full py-3 rounded-xl font-bold transition-colors flex justify-center items-center cursor-pointer ${btn.className} disabled:opacity-50`}
        >
          {loading ? <LoadingIcon className="w-5 h-5 animate-spin" /> : btn.text}
        </button>
      </div>
    </div>,
    document.body
  );
};
