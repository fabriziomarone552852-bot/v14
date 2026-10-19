// src/mobile/components/trackers/MobileTVPaginationDots.tsx
import React from 'react';

export interface MobileTVPaginationDotsProps {
  activePageIndex: 0 | 1 | 2;
  onSelectPage: (index: 0 | 1 | 2) => void;
}

export const MobileTVPaginationDots: React.FC<MobileTVPaginationDotsProps> = ({
  activePageIndex,
  onSelectPage,
}) => {
  return (
    <div className="shrink-0 flex items-center justify-center gap-2 py-1.5 select-none bg-white/80 backdrop-blur-xs border-t border-gray-100 rounded-b-2xl">
      {/* 0. Prossime Uscite */}
      <button
        type="button"
        onClick={() => onSelectPage(0)}
        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
          activePageIndex === 0
            ? 'w-6 bg-blue-600 shadow-xs'
            : 'w-1.5 bg-gray-300 hover:bg-gray-400'
        }`}
        title="Pagina 1: Prossime Uscite"
        aria-label="Pagina 1: Prossime Uscite"
      />
      {/* 1. Diario (Centrale / Home) */}
      <button
        type="button"
        onClick={() => onSelectPage(1)}
        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
          activePageIndex === 1
            ? 'w-6 bg-blue-600 shadow-xs'
            : 'w-1.5 bg-gray-300 hover:bg-gray-400'
        }`}
        title="Pagina 2: Diario Episodi"
        aria-label="Pagina 2: Diario Episodi"
      />
      {/* 2. Dashboard & Catalogo */}
      <button
        type="button"
        onClick={() => onSelectPage(2)}
        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
          activePageIndex === 2
            ? 'w-6 bg-blue-600 shadow-xs'
            : 'w-1.5 bg-gray-300 hover:bg-gray-400'
        }`}
        title="Pagina 3: Dashboard & Catalogo"
        aria-label="Pagina 3: Dashboard & Catalogo"
      />
    </div>
  );
};

export default MobileTVPaginationDots;
