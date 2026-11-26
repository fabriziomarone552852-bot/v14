// src/mobile/components/home/briefing/MobileDailyBriefingModal.tsx
import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Sun, Sparkles } from 'lucide-react';
import { CloseIcon } from '@/components/shared/utils/Icons';
import { useBackHandler } from '@/utils/backButtonManager';
import {
  MobileTrackerDetailBottomBar,
  type MobileTrackerBottomBarTab,
} from '@/mobile/components/trackers/shared/detail/MobileTrackerDetailBottomBar';
import type { Quote } from '@/types';
import type {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
} from '@/types/weather';
import type {
  HoroscopeSignEntry,
  ZodiacSignMeta,
  ZodiacSignSlug,
} from '@/types/horoscope';
import { BriefingQuoteTab } from './BriefingQuoteTab';
import { BriefingWeatherTab } from './BriefingWeatherTab';
import { BriefingHoroscopeTab } from './BriefingHoroscopeTab';

export type BriefingModalTabId = 'quote' | 'weather' | 'horoscope';

export interface MobileDailyBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: BriefingModalTabId;
  onSelectTab: (tab: BriefingModalTabId) => void;
  // Quote
  quote: Quote;
  isTodayQuote: boolean;
  // Weather
  isWeatherEnabled: boolean;
  isWeatherLoading: boolean;
  cityName?: string | null;
  currentWeather?: CurrentWeather;
  todayForecast?: DailyForecast;
  hourlyWeather: HourlyForecast[];
  onOpenFullWeather: () => void;
  // Horoscope
  isHoroscopeEnabled: boolean;
  isHoroscopeLoading: boolean;
  isHoroscopeError: boolean;
  activeSign: ZodiacSignSlug;
  activeSignMeta: ZodiacSignMeta;
  horoscopeEntry?: HoroscopeSignEntry;
  onChangeSign: (sign: ZodiacSignSlug) => void;
  onToggleHoroscopeEnabled: (enabled: boolean) => void;
}

export const MobileDailyBriefingModal: React.FC<MobileDailyBriefingModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  quote,
  isTodayQuote,
  isWeatherEnabled,
  isWeatherLoading,
  cityName,
  currentWeather,
  todayForecast,
  hourlyWeather,
  onOpenFullWeather,
  isHoroscopeEnabled,
  isHoroscopeLoading,
  isHoroscopeError,
  activeSign,
  activeSignMeta,
  horoscopeEntry,
  onChangeSign,
  onToggleHoroscopeEnabled,
}) => {
  useBackHandler(isOpen, onClose, 10);

  const bottomTabs = useMemo<MobileTrackerBottomBarTab<BriefingModalTabId>[]>(
    () => [
      {
        id: 'quote',
        label: 'Citazione',
        icon: (
          <span
            className="font-serif text-[23px] font-black leading-none tracking-tight translate-y-[4px] inline-block select-none"
            aria-hidden="true"
          >
            “”
          </span>
        ),
      },
      {
        id: 'weather',
        label: 'Meteo',
        icon: (
          <Sun
            className={`w-5 h-5 ${
              activeTab === 'weather' ? 'stroke-[2.5]' : 'stroke-2'
            }`}
          />
        ),
      },
      {
        id: 'horoscope',
        label: 'Oroscopo',
        icon: (
          <Sparkles
            className={`w-5 h-5 ${
              activeTab === 'horoscope' ? 'stroke-[2.5]' : 'stroke-2'
            }`}
          />
        ),
      },
    ],
    [activeTab]
  );

  if (!isOpen || typeof document === 'undefined') return null;

  const modalNode = (
    <div
      className="fixed inset-0 z-[9990] bg-white flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none"
      role="dialog"
      aria-modal="true"
    >
      {/* 1. HEADER SUPERIORE STANDARDIZZATO (Come Task ed Eventi) */}
      <div className="px-4 py-3.5 border-b border-gray-200 flex justify-between items-center bg-gray-50/95 shrink-0 pt-[max(env(safe-area-inset-top,0px),14px)]">
        <div className="text-base font-extrabold text-gray-900 uppercase tracking-wider truncate flex-1 min-w-0 pr-2">
          Oggi in pillole
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 hover:text-red-500 active:scale-95 transition-colors cursor-pointer shrink-0"
          aria-label="Chiudi"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      {/* 2. CORPO CENTRALE SCORREVOLE (flex-col per centrare la Citazione sull'asse Y con my-auto) */}
      <div className="p-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col">
        {activeTab === 'quote' && (
          <BriefingQuoteTab quote={quote} isTodayQuote={isTodayQuote} />
        )}

        {activeTab === 'weather' && (
          <BriefingWeatherTab
            isWeatherEnabled={isWeatherEnabled}
            isLoading={isWeatherLoading}
            cityName={cityName}
            current={currentWeather}
            todayForecast={todayForecast}
            hourly={hourlyWeather}
            onOpenFullWeather={onOpenFullWeather}
            onCloseBriefing={onClose}
          />
        )}

        {activeTab === 'horoscope' && (
          <BriefingHoroscopeTab
            isHoroscopeEnabled={isHoroscopeEnabled}
            isLoading={isHoroscopeLoading}
            isError={isHoroscopeError}
            activeSign={activeSign}
            activeSignMeta={activeSignMeta}
            entry={horoscopeEntry}
            onChangeSign={onChangeSign}
            onToggleEnabled={onToggleHoroscopeEnabled}
          />
        )}
      </div>

      {/* 3. BARRA INFERIORE CON SOLO LOGHI (Come Serie TV & Film) */}
      <MobileTrackerDetailBottomBar<BriefingModalTabId>
        activeTab={activeTab}
        tabs={bottomTabs}
        onTabChange={onSelectTab}
      />
    </div>
  );

  return createPortal(modalNode, document.body);
};
