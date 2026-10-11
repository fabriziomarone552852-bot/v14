// src/components/settings/ProfileSection.tsx
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoadingIcon } from '@/components/shared/utils/Icons';
import type { UserServerSettings } from '@/types/settings';
import type { UserResponse } from '@/types/auth';
import ChangePasswordModal from './ChangePasswordModal';
import EditEmailModal from './EditEmailModal';
import { ProfileSocialHub } from './ProfileSocialHub';
import { useImageUpload } from '@/hooks/useImageUpload';
import { api } from '@/api/apiService';
import { resolveImageUrl } from '@/utils/imageUtils';
import { extractErrorMessage } from '@/utils/errorUtils';

interface ProfileSectionProps {
  settings: UserServerSettings;
  email: string;
  onEmailChange: (value: string) => void;
  onChangePasswordSubmit: (currentPassword: string, newPassword: string, confirmNewPassword: string) => Promise<void>;
  disabled?: boolean;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  settings,
  email,
  onEmailChange,
  onChangePasswordSubmit,
  disabled = false,
}) => {
  const { user, updateUser } = useAuth();
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const {
    fileInputRef,
    isUploading: isUploadingImage,
    handleFileUpload: handleImageUpload,
    triggerFileInput,
  } = useImageUpload({
    folder: 'profiles',
    onSuccess: async (url) => {
      try {
        await api.patch('/users/me/settings', { profile_picture_url: url });
        const meRes = await api.get<UserResponse>('/users/me');
        if (meRes) updateUser(meRes);
      } catch (err: unknown) {
        alert(extractErrorMessage(err, "Errore durante l'aggiornamento del profilo."));
      }
    },
    onError: (err) => {
      alert(extractErrorMessage(err, "Errore durante il caricamento dell'immagine."));
    },
  });

  if (!user) return null;

  const handlePasswordSubmit = async (currentPw: string, newPw: string, confirmPw: string) => {
    setPasswordLoading(true);
    try {
      await onChangePasswordSubmit(currentPw, newPw, confirmPw);
      setIsPasswordModalOpen(false);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-[calc(100vh-420px)] min-h-[350px]">
      {/* Colonna Sinistra: Avatar, Info Utente, Email, Password */}
      <div className="lg:col-span-4 flex flex-col h-full">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col items-center relative overflow-hidden h-full">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none"></div>
          
          <div 
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-slate-200 z-10 overflow-hidden mb-3 flex items-center justify-center cursor-pointer relative group shrink-0"
            onClick={() => !disabled && !isUploadingImage && triggerFileInput()}
            title="Cambia Immagine Profilo"
          >
            {isUploadingImage ? (
              <LoadingIcon className="w-6 h-6 text-blue-500 animate-spin" />
            ) : (
              <>
                <img 
                  src={resolveImageUrl(user.profile_picture_url, '/default_avatar.png')} 
                  alt={user.username} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                </div>
              </>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          
          <h1 className="text-xl font-black text-slate-800 z-10 mb-0.5">@{settings.username}</h1>
          <p className="text-sm font-medium text-slate-500 z-10 text-center">{email}</p>
          
          <div className="w-full mt-auto pt-4 border-t border-slate-100 space-y-2.5">
             <button
              type="button"
              onClick={() => setIsEmailModalOpen(true)}
              disabled={disabled}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-sm rounded-xl transition focus:outline-none cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Cambia Email</span>
            </button>
             <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              disabled={disabled}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-sm rounded-xl transition focus:outline-none cursor-pointer"
            >
              <span>🔒</span>
              <span>Cambia Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Colonna Destra: Sezione Social Hub dedicata */}
      <ProfileSocialHub />

      {/* Modal Cambio Password */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordSubmit}
        loading={passwordLoading}
      />
      
      {/* Modal Cambio Email */}
      <EditEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        currentEmail={email}
        onSave={(newEmail) => onEmailChange(newEmail)}
      />
    </div>
  );
};

export default ProfileSection;
