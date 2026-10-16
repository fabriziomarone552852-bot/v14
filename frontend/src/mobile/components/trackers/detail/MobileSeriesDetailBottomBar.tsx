// src/mobile/components/trackers/detail/MobileSeriesDetailBottomBar.tsx
import React from 'react';
import { Info, Layers, Star } from 'lucide-react';
import type { TabType } from '@/components/trackers/SeriesDetailModal/hooks/useSeriesDetailModalLogic';

export interface MobileSeriesDetailBottomBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const MobileSeriesDetailBottomBar: React.FC<MobileSeriesDetailBottomBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2.5 p-2.5 bg-white border-t border-gray-200 shrink-0 pb-[max(env(safe-area-inset-bottom,0px),10px)] select-none">
      {/* 1. PANORAMICA */}
      <button
        type="button"
        onClick={() => onTabChange('overview')}
        className={`flex items-center justify-center h-11 rounded-2xl border active:scale-95 transition-all shadow-xs cursor-pointer ${
          activeTab === 'overview'
            ? 'border-blue-400 bg-blue-50 text-blue-600 ring-2 ring-blue-400/20'
            : 'border-gray-200 bg-gray-50/70 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
        }`}
        title="Panoramica"
        aria-label="Panoramica"
      >
        <Info className={`w-5 h-5 transition-transform ${activeTab === 'overview' ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
      </button>

      {/* 2. STAGIONI ED EPISODI */}
      <button
        type="button"
        onClick={() => onTabChange('seasons')}
        className={`flex items-center justify-center h-11 rounded-2xl border active:scale-95 transition-all shadow-xs cursor-pointer ${
          activeTab === 'seasons'
            ? 'border-blue-400 bg-blue-50 text-blue-600 ring-2 ring-blue-400/20'
            : 'border-gray-200 bg-gray-50/70 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
        }`}
        title="Stagioni ed Episodi"
        aria-label="Stagioni ed Episodi"
      >
        <Layers className={`w-5 h-5 transition-transform ${activeTab === 'seasons' ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
      </button>

      {/* 3. RECENSIONI */}
      <button
        type="button"
        onClick={() => onTabChange('review')}
        className={`flex items-center justify-center h-11 rounded-2xl border active:scale-95 transition-all shadow-xs cursor-pointer ${
          activeTab === 'review'
            ? 'border-blue-400 bg-blue-50 text-blue-600 ring-2 ring-blue-400/20'
            : 'border-gray-200 bg-gray-50/70 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
        }`}
        title="Recensioni"
        aria-label="Recensioni"
      >
        <Star
          className={`w-5 h-5 transition-transform ${
            activeTab === 'review'
              ? 'scale-110 fill-blue-500 text-blue-600 stroke-[2.5]'
              : 'stroke-2'
          }`}
        />
      </button>
    </div>
  );
};

export default MobileSeriesDetailBottomBar;
