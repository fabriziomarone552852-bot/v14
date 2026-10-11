import React from 'react';
import { resolveImageUrl } from '@/utils/imageUtils';

interface MediaCardProps {
  id?: number | string;
  title: string;
  posterPath?: string | null;
  customPosterPath?: string | null;
  status?: string;
  externalStatus?: string | null;
  onClick?: () => void;
  // Fallback if status logic changes or wants to be overwritten
  overrideBorderColor?: string;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  title,
  posterPath,
  customPosterPath,
  status,
  externalStatus,
  onClick,
  overrideBorderColor
}) => {
  const getBorderColor = () => {
    if (overrideBorderColor) return overrideBorderColor;
    if (!status) return 'border-transparent';
    if (status === 'watching' || status === 'reading' || status === 'playing') return 'border-yellow-400';
    if (status === 'completed' || status === 'watched' || status === 'read' || status === 'played') {
      return externalStatus === 'Returning Series' ? 'border-purple-500' : 'border-green-500';
    }
    return 'border-transparent';
  };

  const borderColor = getBorderColor();
  const finalPoster = customPosterPath 
    ? resolveImageUrl(customPosterPath) 
    : posterPath 
      ? `https://image.tmdb.org/t/p/w500${posterPath}` 
      : null;

  return (
    <div className="flex flex-col group cursor-pointer w-full relative" onClick={onClick}>
       <div className={`relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-gray-100 shadow-sm border-[3px] transition-all duration-300 group-hover:scale-105 ${borderColor}`}>
          {finalPoster ? (
            <img src={finalPoster} alt={title} className="w-full h-full object-cover" />
          ) : (
            <img src="/no-poster.png" alt="No Image" className="w-full h-full object-cover opacity-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 p-3">
             <h4 className="font-bold text-white line-clamp-2 text-sm leading-tight drop-shadow-md">{title}</h4>
          </div>
       </div>
    </div>
  );
};
