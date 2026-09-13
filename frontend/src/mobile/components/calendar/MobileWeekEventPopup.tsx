// src/mobile/components/calendar/MobileWeekEventPopup.tsx
import React from 'react';
import type { CalendarEvent } from '@/types';
import type { PopupPosition } from '@/mobile/hooks/useMobileWeekCalendarLogic';
import { getHexColor } from '@/utils/uiUtils';

interface MobileWeekEventPopupProps {
  selectedEvent: CalendarEvent;
  popupPosition: PopupPosition;
  onClose: () => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export const MobileWeekEventPopup: React.FC<MobileWeekEventPopupProps> = ({
  selectedEvent,
  popupPosition,
  onClose,
  onSelectEvent,
}) => {
  return (
    <>
      {/* Backdrop trasparente SENZA oscurare nulla sotto */}
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />

      {/* Nuvoletta ancorata con apertura modale al 2° Click */}
      <div
        className="fixed z-50 animate-fadeIn select-none"
        style={{
          left: popupPosition.x,
          top: popupPosition.isTopHalf ? popupPosition.y : 'auto',
          bottom: !popupPosition.isTopHalf ? window.innerHeight - popupPosition.y : 'auto',
          width: '190px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          onClick={() => {
            onClose();
            onSelectEvent(selectedEvent);
          }}
          className="relative bg-white rounded-2xl shadow-xl border border-gray-200/90 p-2.5 cursor-pointer hover:border-blue-400 active:scale-[0.98] transition-all group"
        >
          {/* Freccetta / Puntatore ancorato al centro dell'evento */}
          {popupPosition.isTopHalf ? (
            <div
              className="absolute -top-1 w-2.5 h-2.5 bg-white border-t border-l border-gray-200 rotate-45"
              style={{ left: `${popupPosition.arrowX - 5}px` }}
            />
          ) : (
            <div
              className="absolute -bottom-1 w-2.5 h-2.5 bg-white border-b border-r border-gray-200 rotate-45"
              style={{ left: `${popupPosition.arrowX - 5}px` }}
            />
          )}

          {/* Header Nuvoletta: Orario/Data + Pallino Categoria */}
          <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-gray-100">
            {selectedEvent.time ? (
              <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full truncate">
                {selectedEvent.time}
                {selectedEvent.endTime ? ` → ${selectedEvent.endTime}` : ''}
              </span>
            ) : selectedEvent.endDateStr && selectedEvent.endDateStr !== selectedEvent.dateStr ? (
              <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full truncate">
                {selectedEvent.dateStr} → {selectedEvent.endDateStr}
              </span>
            ) : null}

            <div
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs ml-auto"
              style={{
                backgroundColor: getHexColor(selectedEvent.categoryColor),
              }}
              title={selectedEvent.category || 'Categoria'}
            />
          </div>

          {/* Titolo evento & Luogo */}
          <div className="pt-1.5 pb-0.5">
            <p className="text-xs font-black text-gray-900 leading-snug break-words">
              {selectedEvent.title}
            </p>
            {selectedEvent.location && (
              <p className="text-[10px] text-gray-500 font-medium truncate mt-1">
                📍 {selectedEvent.location}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileWeekEventPopup;
