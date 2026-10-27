import React from 'react';
import { LoadingIcon } from '@/components/shared/utils/Icons';

export interface MediaStatsTab {
  id: string;
  label: string;
}

export interface MediaStatsModalShellProps {
  title: string;
  onClose: () => void;
  isLoading?: boolean;
  isError?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  tabs: readonly MediaStatsTab[] | MediaStatsTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

export const MediaStatsModalShell: React.FC<MediaStatsModalShellProps> = ({
  title,
  onClose,
  isLoading = false,
  isError = false,
  loadingMessage = 'Elaborazione statistiche in corso...',
  errorMessage = 'Errore durante il caricamento delle statistiche.',
  tabs,
  activeTab,
  onTabChange,
  children,
}) => {
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-4 z-10 animate-fadeIn">
          <LoadingIcon className="w-10 h-10 animate-spin text-blue-500" />
          <p className="font-bold text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-4 z-10 animate-fadeIn text-center">
          <span className="text-3xl">⚠️</span>
          <p className="font-bold text-red-500">{errorMessage}</p>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[95vw] max-w-[1200px] h-[90vh] max-h-[900px] flex flex-col overflow-hidden animate-fadeIn z-10 pointer-events-auto text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-gray-100 shrink-0">
          <h2 className="text-sm font-black text-gray-600 uppercase tracking-widest">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi finestra statistiche"
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex px-6 pt-4 gap-2 bg-white border-b border-slate-200 shrink-0 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`px-6 py-2.5 rounded-t-xl font-bold text-sm transition-colors uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-50 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MediaStatsModalShell;
