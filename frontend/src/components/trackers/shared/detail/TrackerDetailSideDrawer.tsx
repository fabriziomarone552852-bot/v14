import React, { type ReactNode } from 'react';

export interface TrackerDetailSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  closeTitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Contenitore riutilizzabile (DRY) per i pannelli laterali del modale dettaglio (Liste e Amici),
 * con scorrimento fluido da destra verso sinistra in apertura e rientro laterale in chiusura.
 */
export const TrackerDetailSideDrawer: React.FC<TrackerDetailSideDrawerProps> = ({
  isOpen,
  onClose,
  title,
  closeTitle,
  children,
  footer,
}) => {
  return (
    <div
      className={`absolute inset-0 z-50 overflow-hidden ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      {/* Backdrop leggero cliccabile per chiudere la sidebar */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Pannello laterale scorrevole da destra verso sinistra */}
      <div
        className={`absolute inset-y-0 right-0 w-72 bg-white flex flex-col border-l border-gray-100 will-change-transform transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? 'translate-x-0 shadow-2xl'
            : 'translate-x-[102%] shadow-none'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-200 text-gray-500 rounded-full transition-colors cursor-pointer"
            title={closeTitle}
            aria-label={closeTitle}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {children}
        </div>

        {footer && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
