// src/components/shared/form/LocationPreview.tsx
import React from 'react';
import { LocationIcon, ExternalLinkIcon } from '@/components/shared/utils/Icons';
import { openInGoogleMaps } from '@/utils/mapUtils';

interface LocationPreviewProps {
  location?: string | null;
  className?: string;
}

export const LocationPreview: React.FC<LocationPreviewProps> = ({
  location,
  className = '',
}) => {
  if (!location || !location.trim()) {
    return null;
  }

  const trimmedLoc = location.trim();

  return (
    <button
      type="button"
      onClick={() => openInGoogleMaps(trimmedLoc)}
      className={`group flex items-center justify-between w-full text-left p-2.5 bg-gray-50/80 hover:bg-blue-50/60 border border-gray-100 hover:border-blue-200 rounded-xl transition-all cursor-pointer ${className}`}
      title="Apri su Google Maps"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <LocationIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 shrink-0 transition-colors" />
        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 truncate transition-colors">
          {trimmedLoc}
        </span>
      </div>

      <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-blue-600 shrink-0 pl-2 transition-colors">
        <span className="hidden sm:inline text-[11px]">Apri su Maps</span>
        <ExternalLinkIcon className="w-3.5 h-3.5" />
      </div>
    </button>
  );
};

export default LocationPreview;
