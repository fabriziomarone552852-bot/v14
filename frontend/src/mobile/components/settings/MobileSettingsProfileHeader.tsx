// src/mobile/components/settings/MobileSettingsProfileHeader.tsx
import React, { useRef, useState } from 'react';
import { User, ShieldCheck, Users } from 'lucide-react';
import type { useAuth } from '@/context/AuthContext';
import { resolveImageUrl } from '@/utils/imageUtils';
import { mediaService } from '@/api/mediaService';
import { api } from '@/api/apiService';
import { LoadingIcon } from '@/components/shared/utils/Icons';

interface MobileSettingsProfileHeaderProps {
  user: ReturnType<typeof useAuth>['user'];
  updateUser: ReturnType<typeof useAuth>['updateUser'];
  displayUsername: string;
  roleName: string;
  isSuperuser?: boolean;
  email?: string;
  onSocialClick: () => void;
  pendingRequestsCount?: number;
}

export const MobileSettingsProfileHeader: React.FC<MobileSettingsProfileHeaderProps> = ({
  user,
  updateUser,
  displayUsername,
  roleName,
  isSuperuser = false,
  email,
  onSocialClick,
  pendingRequestsCount = 0,
}) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const res = await mediaService.uploadImage(file, 'profiles');
      await api.patch('/users/me/settings', { profile_picture_url: res.url });
      const meRes = await api.get<any>('/users/me');
      if (meRes) updateUser(meRes);
    } catch (err: any) {
      alert(err.message || "Errore durante il caricamento dell'immagine.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Avatar / Immagine Profilo */}
        <div 
          className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 font-extrabold text-xl shadow-2xs shrink-0 cursor-pointer overflow-hidden relative"
          onClick={() => !isUploadingImage && fileInputRef.current?.click()}
        >
          {isUploadingImage ? (
            <LoadingIcon className="w-6 h-6 animate-spin text-blue-500" />
          ) : user?.profile_picture_url ? (
            <img 
              src={resolveImageUrl(user.profile_picture_url, '/default_avatar.png')} 
              alt={displayUsername} 
              className="w-full h-full object-cover" 
            />
          ) : (
            displayUsername.charAt(0)
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />
        
        {/* Info Utente */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-extrabold text-gray-900 truncate">{displayUsername}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isSuperuser ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <ShieldCheck className="w-3 h-3 text-amber-600" /> {roleName}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                <User className="w-3 h-3 text-gray-500" /> {roleName}
              </span>
            )}
          </div>
          {email && <p className="text-xs text-gray-500 truncate mt-0.5">{email}</p>}
        </div>

        {/* Pulsante Social / Amici */}
        <button
          type="button"
          onClick={onSocialClick}
          className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors shrink-0 relative cursor-pointer"
          title="Social & Amici"
        >
          <Users className="w-6 h-6" />
          {pendingRequestsCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white ring-1 ring-red-200 shadow-sm" />
          )}
        </button>
      </div>
    </div>
  );
};

export default MobileSettingsProfileHeader;
