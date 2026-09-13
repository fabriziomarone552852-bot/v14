// src/mobile/hooks/useMobileMonthCalendarLogic.ts
import { useState, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { CalendarEvent, DbTask, Category, DailyEntry } from '@/types';
import { formatDateString, pad } from '@/utils/dateUtils';
import { isEventInDay } from '@/utils/eventUtils';

interface UseMobileMonthCalendarLogicParams {
  targetDate: Date;
  events: CalendarEvent[];
  tasks?: DbTask[];
  dailyEntries?: DailyEntry[];
  allCategories?: Category[];
  onDayClick: (dateStr: string) => void;
}

export const useMobileMonthCalendarLogic = ({
  targetDate,
  events,
  tasks = [],
  dailyEntries = [],
  allCategories = [],
  onDayClick,
}: UseMobileMonthCalendarLogicParams) => {
  const todayStr = useMemo(() => formatDateString(new Date()), []);

  const year = targetDate.getFullYear();
  const monthIndex = targetDate.getMonth();

  // 1. Calcolo giorni del mese e slot totali
  const { firstDayIndex, daysInMonth, totalGridCells } = useMemo(() => {
    const firstDay = new Date(year, monthIndex, 1);
    const daysCount = new Date(year, monthIndex + 1, 0).getDate();
    // Monday = 0, Tuesday = 1, ..., Sunday = 6
    const startIdx = (firstDay.getDay() + 6) % 7;
    const totalSlots = Math.ceil((startIdx + daysCount) / 7) * 7;
    return {
      firstDayIndex: startIdx,
      daysInMonth: daysCount,
      totalGridCells: totalSlots,
    };
  }, [year, monthIndex]);

  // 2. Mappatura rapida dei Mood giornalieri (tipo 'PX')
  const moodsByDate = useMemo(() => {
    const map: Record<string, Category> = {};
    if (dailyEntries && Array.isArray(dailyEntries)) {
      dailyEntries.forEach((entry) => {
        if (entry.tipo === 'PX') {
          const d = entry.data_riferimento || (entry as unknown as { dateStr?: string }).dateStr;
          if (d && entry.category_id) {
            const cat = allCategories.find((c) => c.id === entry.category_id);
            if (cat) map[d] = cat;
          }
        }
      });
    }
    return map;
  }, [dailyEntries, allCategories]);

  // 3. Mappatura rapida delle Task per data
  const tasksByDate = useMemo(() => {
    const map: Record<string, DbTask[]> = {};
    tasks.forEach((t) => {
      if (t.data_scadenza) {
        const dateStr = t.data_scadenza.substring(0, 10);
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(t);
      }
    });
    return map;
  }, [tasks]);

  // 4. Mappatura rapida degli Eventi per data
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (let i = 1; i <= daysInMonth; i++) {
      const dateKey = `${year}-${pad(monthIndex + 1)}-${pad(i)}`;
      map[dateKey] = events.filter((e) => isEventInDay(e, dateKey));
    }
    return map;
  }, [events, year, monthIndex, daysInMonth]);

  // 5. STATO NUVOLETTA (POPOVER DEL GIORNO CLICCATO)
  const [selectedDateForPopup, setSelectedDateForPopup] = useState<string | null>(null);

  // 6. GESTIONE LONG PRESS VS TAP RAPIDO SUL QUADRATO DEL GIORNO
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);

  const startLongPress = (dateStr: string) => {
    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
      setSelectedDateForPopup(null);
      onDayClick(dateStr);
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleDayTouchEnd = (dateStr: string) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!isLongPressTriggeredRef.current) {
      // Tap rapido: apri/chiudi la nuvoletta
      setSelectedDateForPopup((prev) => (prev === dateStr ? null : dateStr));
    }
  };

  // Dati reattivi per la nuvoletta attualmente aperta
  const popupDayEvents = selectedDateForPopup ? eventsByDate[selectedDateForPopup] || [] : [];
  const popupDayTasks = selectedDateForPopup ? tasksByDate[selectedDateForPopup] || [] : [];
  const popupDayMood = selectedDateForPopup ? moodsByDate[selectedDateForPopup] : undefined;

  const formattedPopupDate = useMemo(() => {
    if (!selectedDateForPopup) return '';
    const [y, m, d] = selectedDateForPopup.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const formatted = format(dateObj, 'EEEE d MMMM', { locale: it });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [selectedDateForPopup]);

  return {
    year,
    monthIndex,
    todayStr,
    firstDayIndex,
    daysInMonth,
    totalGridCells,
    moodsByDate,
    tasksByDate,
    eventsByDate,
    selectedDateForPopup,
    setSelectedDateForPopup,
    startLongPress,
    cancelLongPress,
    handleDayTouchEnd,
    popupDayEvents,
    popupDayTasks,
    popupDayMood,
    formattedPopupDate,
  };
};

export default useMobileMonthCalendarLogic;
