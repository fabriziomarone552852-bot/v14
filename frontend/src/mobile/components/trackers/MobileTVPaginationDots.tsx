// src/mobile/components/trackers/MobileTVPaginationDots.tsx
import React from 'react';

export interface MobileTVPaginationDotsProps {
  activePageIndex: 0 | 1;
  onSelectPage: (index: 0 | 1) => void;
}

export const MobileTVPaginationDots: React.FC<MobileTVPaginationDotsProps> = ({
  activePageIndex,
  onSelectPage,
}) => {
  return (
    <div className="shrink-0 flex items-center justify-center gap-2 py-1.5 select-none bg-white/80 backdrop-blur-xs border-t border-gray-100 rounded-b-2xl">
      <button
        type="button"
        onClick={() => onSelectPage(0)}
        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
          activePageIndex === 0
            ? 'w-6 bg-blue-600 shadow-xs'
            : 'w-1.5 bg-gray-300 hover:bg-gray-400'
        }`}
        title="Pagina 1: Libreria Serie TV"
        aria-label="Pagina 1: Libreria"
      />
      <button
        type="button"
        onClick={() => onSelectPage(1)}
        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
          activePageIndex === 1
            ? 'w-6 bg-blue-600 shadow-xs'
            : 'w-1.5 bg-gray-300 hover:bg-gray-400'
        }`}
        title="Pagina 2: Dashboard & Attività"
        aria-label="Pagina 2: Dashboard"
      />
    </div>
  );
};

export default MobileTVPaginationDots;
