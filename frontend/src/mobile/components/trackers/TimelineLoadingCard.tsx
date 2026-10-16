// src/mobile/components/trackers/TimelineLoadingCard.tsx
import React from 'react';
import { LoadingIcon } from '@/components/shared/utils/ActionStateIcons';

export const TimelineLoadingCard: React.FC = () => (
  <div className="flex items-center justify-center gap-2.5 py-3.5 px-4 mx-1 rounded-2xl bg-white/90 backdrop-blur-xs border border-gray-200/90 shadow-2xs text-xs text-gray-600 font-bold animate-fadeIn shrink-0">
    <LoadingIcon className="w-4 h-4 text-blue-600 animate-spin" />
    <span>Caricamento in corso...</span>
  </div>
);

export default TimelineLoadingCard;
