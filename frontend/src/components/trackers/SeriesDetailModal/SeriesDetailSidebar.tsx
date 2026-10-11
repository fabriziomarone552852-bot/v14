// src/components/trackers/SeriesDetailModal/SeriesDetailSidebar.tsx
import React from 'react';
import type { UserSeriesTracking } from '@/types/trackers';
import type { TabType } from './hooks/useSeriesDetailModalLogic';

interface SeriesDetailSidebarProps {
  posterUrl: string;
  title: string;
  userTracking: UserSeriesTracking | null;
  isPressing: boolean;
  handleMouseDown: (e: React.PointerEvent) => void;
  handleMouseUp: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleClickTrack: () => void;
  statusColor: string;
  statusText: string;
  StatusIcon: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenImageModal: () => void;
}

export const SeriesDetailSidebar: React.FC<SeriesDetailSidebarProps> = ({
  posterUrl,
  title,
  userTracking,
  isPressing,
  handleMouseDown,
  handleMouseUp,
  handleTouchStart,
  handleTouchEnd,
  handleClickTrack,
  statusColor,
  statusText,
  StatusIcon,
  activeTab,
  onTabChange,
  onOpenImageModal,
}) => {
  return (
    <div className="w-1/3 min-w-[250px] max-w-[300px] p-6 flex flex-col gap-6 relative z-20">
      {/* LOCANDINA / POSTER */}
      <div
        className="group/poster -mt-32 w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-gray-200 shrink-0 relative z-30 cursor-pointer"
        onClick={() => {
          if (userTracking) {
            onOpenImageModal();
          } else {
            alert('Aggiungi prima la serie alla tua libreria per personalizzare la locandina.');
          }
        }}
      >
        <img src={posterUrl} alt={title} className="w-full h-full object-cover" />

        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 z-30">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-2 shadow-lg border border-white/30">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-white text-xs font-bold uppercase tracking-wider drop-shadow-md">Cambia</span>
        </div>

        {/* Tasto Aggiungi / Segna tutti */}
        <div className="absolute top-2 right-2 z-40">
          <button
            onPointerDown={handleMouseDown}
            onPointerUp={handleMouseUp}
            onPointerLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => {
              e.stopPropagation();
              handleClickTrack();
            }}
            className={`w-9 h-9 flex items-center justify-center transition-all ${
              isPressing
                ? 'rounded-full scale-95 duration-[800ms] ease-out bg-green-500'
                : 'rounded-xl active:scale-95 duration-200'
            } ${
              userTracking && !isPressing
                ? 'bg-blue-500 border-2 border-solid border-blue-500 text-white shadow-md'
                : !isPressing
                ? 'bg-white/40 backdrop-blur-md border-2 border-dashed border-white/80 text-white hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/90 shadow-sm'
                : 'border-2 border-solid border-blue-600 text-white shadow-md'
            }`}
            title={
              userTracking
                ? 'Già in lista (Tieni premuto per segnare tutti come visti)'
                : 'Aggiungi alla lista (Tieni premuto per segnare tutti come visti)'
            }
          >
            {userTracking ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>

        {/* Tasto Stato */}
        <div className="absolute bottom-2 right-2 z-40 group/status">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white ${statusColor}`}
          >
            {StatusIcon}
          </div>
          <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover/status:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
            {statusText}
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex flex-col gap-2">
        <NavButton
          active={activeTab === 'overview'}
          onClick={() => onTabChange('overview')}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        >
          Panoramica
        </NavButton>
        <NavButton
          active={activeTab === 'seasons'}
          onClick={() => onTabChange('seasons')}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          }
        >
          Stagioni ed Episodi
        </NavButton>
        <NavButton
          active={activeTab === 'review'}
          onClick={() => onTabChange('review')}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          }
        >
          Recensioni e Citazioni
        </NavButton>
      </div>
    </div>
  );
};

const NavButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}> = ({ active, onClick, children, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left font-medium transition-all cursor-pointer ${
      active
        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
    }`}
  >
    <div className={active ? 'text-blue-500' : 'text-gray-400'}>{icon}</div>
    {children}
  </button>
);
