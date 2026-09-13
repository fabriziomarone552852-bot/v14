// src/mobile/components/settings/MobileSettingsLogoutModal.tsx
import React from 'react';
import { LogOut } from 'lucide-react';

interface MobileSettingsLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export const MobileSettingsLogoutModal: React.FC<MobileSettingsLogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 space-y-4 animate-scaleUp">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900">Disconnessione</h3>
            <p className="text-xs text-gray-500">Sei sicuro di voler uscire dal profilo?</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={onConfirmLogout}
            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
          >
            Conferma Esci
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileSettingsLogoutModal;
