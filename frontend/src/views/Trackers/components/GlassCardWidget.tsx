import React from 'react';

interface GlassCardWidgetProps {
  label: string;
  title: string;
  subtitle: string;
  posterPath: string | null;
  onClick?: () => void;
}

export const GlassCardWidget: React.FC<GlassCardWidgetProps> = ({
  label,
  title,
  subtitle,
  posterPath,
  onClick
}) => {
  const imageUrl = posterPath 
    ? (posterPath.startsWith('http') ? posterPath : `https://image.tmdb.org/t/p/w300${posterPath}`)
    : null;

  return (
    <div 
      onClick={onClick}
      className="relative flex flex-col h-28 rounded-xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] group"
    >
      {/* Sfondo sfocato */}
      <div 
        className={`absolute inset-0 bg-cover bg-center z-0 blur-xl opacity-60 scale-110 transition-opacity group-hover:opacity-80 ${!imageUrl ? 'bg-gray-300' : ''}`}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
      />
      {/* Overlay chiaro per leggibilità testo */}
      <div className="absolute inset-0 bg-white/70 z-10" />

      {/* Contenuto Foreground */}
      <div className="relative z-20 flex items-center p-3 h-full gap-3">
        {/* Locandina Foreground */}
        <div className="w-14 h-20 shrink-0 rounded-md overflow-hidden shadow-md bg-gray-100 flex items-center justify-center">
           {imageUrl ? (
             <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
           ) : (
             <img src="/no-poster.png" alt="No Image" className="w-full h-full object-cover opacity-50" />
           )}
        </div>
        
        {/* Testo */}
        <div className="flex flex-col justify-center flex-1 min-w-0 h-full">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600/80 mb-0.5 truncate">{label}</p>
          <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">{title}</h4>
          {subtitle && <p className="text-xs text-gray-700 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};
