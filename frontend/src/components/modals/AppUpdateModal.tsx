// src/components/modals/AppUpdateModal.tsx
import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { Browser } from '@capacitor/browser';
import { ArrowUpCircle, ExternalLink, Download, Clock } from 'lucide-react';
import { dismissUpdateForSession } from '@/services/versionChecker';

interface AppUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: string;
  remoteVersion: string;
  driveUrl: string;
  notes?: string;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  isOpen,
  onClose,
  currentVersion,
  remoteVersion,
  driveUrl,
  notes
}) => {
  const handleDownload = async () => {
    try {
      if (window.Capacitor?.isNativePlatform?.()) {
        await Browser.open({ url: driveUrl });
      } else {
        window.open(driveUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.open(driveUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDismiss = () => {
    dismissUpdateForSession(remoteVersion);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleDismiss}
      title={
        <span className="flex items-center gap-2 text-indigo-700">
          <ArrowUpCircle className="w-5 h-5 text-indigo-600 animate-pulse" />
          Aggiornamento Disponibile
        </span>
      }
      maxWidthClass="max-w-md"
      footer={
        <div className="flex gap-2.5 w-full">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 py-2.5 px-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <Clock className="w-4 h-4 text-gray-400" />
            Più tardi
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex-[1.5] py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Scarica da Drive
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-center">
        {/* Banner Comparativo Versione */}
        <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 border border-indigo-100 rounded-2xl p-4 shadow-sm">
          <div className="text-xs uppercase font-extrabold tracking-wider text-indigo-500 mb-2">
            Nuova versione pubblicata
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-medium text-gray-400">Installata</span>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-black">
                v{currentVersion}
              </span>
            </div>
            <span className="text-indigo-400 text-base font-bold">➔</span>
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-medium text-indigo-600">Disponibile</span>
              <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-black shadow-sm">
                v{remoteVersion}
              </span>
            </div>
          </div>
        </div>

        {/* Messaggio esplicativo */}
        <div className="text-sm text-gray-600 text-left leading-relaxed">
          <p className="font-semibold text-gray-800 mb-1">
            La tua versione dell&apos;app è obsoleta.
          </p>
          <p>
            Per avere tutte le ultime funzionalità, i miglioramenti di stabilità e garantire la perfetta sincronizzazione con il server, scarica e installa l&apos;ultimo APK da Google Drive.
          </p>
          {notes && (
            <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 text-left">
              <span className="font-bold block mb-0.5">Note di rilascio:</span>
              {notes}
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default AppUpdateModal;
