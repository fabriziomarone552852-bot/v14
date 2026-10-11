import React, { useState } from 'react';
import { useFullSeriesStats } from '@/hooks/queries/useTrackersQueries';
import { LoadingIcon } from '@/components/shared/utils/Icons';
import { GeneralStatsView } from './SeriesStatsViews/GeneralStatsView';
import { RatingsStatsView } from './SeriesStatsViews/RatingsStatsView';
import { HabitsStatsView } from './SeriesStatsViews/HabitsStatsView';
import { RewatchStatsView } from './SeriesStatsViews/RewatchStatsView';

interface SeriesStatsModalProps {
  onClose: () => void;
}

const SeriesStatsModal: React.FC<SeriesStatsModalProps> = ({ onClose }) => {
  const { data: stats, isLoading, isError } = useFullSeriesStats();
  const [activeTab, setActiveTab] = useState<'generale' | 'voti' | 'abitudini' | 'rewatch'>('generale');

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-4 z-10">
          <LoadingIcon className="w-10 h-10 animate-spin text-blue-500" />
          <p className="font-bold text-gray-600">Elaborazione statistiche in corso...</p>
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-4 z-10">
          <p className="font-bold text-red-500">Errore durante il caricamento delle statistiche.</p>
          <button onClick={onClose} className="px-6 py-2 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600">Chiudi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Shell */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[95vw] max-w-[1200px] h-[90vh] max-h-[900px] flex flex-col overflow-hidden animate-fadeIn z-10 pointer-events-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-gray-100 shrink-0">
          <h2 className="text-sm font-black text-gray-600 uppercase tracking-widest">
            Statistiche
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 gap-2 bg-white border-b border-slate-200 shrink-0 overflow-x-auto custom-scrollbar">
          {['generale', 'voti', 'abitudini', 'rewatch'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'generale' | 'voti' | 'abitudini' | 'rewatch')}
              className={`px-6 py-2.5 rounded-t-xl font-bold text-sm transition-colors uppercase tracking-wider whitespace-nowrap ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-50 flex flex-col">
          {activeTab === 'generale' && <GeneralStatsView stats={stats} />}
          {activeTab === 'voti' && <RatingsStatsView stats={stats} />}
          {activeTab === 'abitudini' && <HabitsStatsView stats={stats} />}
          {activeTab === 'rewatch' && <RewatchStatsView stats={stats} />}
        </div>
      </div>
    </div>
  );
};

export default SeriesStatsModal;
