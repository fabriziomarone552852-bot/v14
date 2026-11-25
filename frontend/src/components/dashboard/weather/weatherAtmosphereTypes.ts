// frontend/src/components/dashboard/weather/weatherAtmosphereTypes.ts

export type WeatherAtmosphereType =
  | 'clear_day'
  | 'clear_night'
  | 'partly_cloudy_day'
  | 'partly_cloudy_night'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'thunder'
  | 'snow';

export interface AtmosphereConfig {
  type: WeatherAtmosphereType;
  bgGradient: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  label: string;
}

export const ATMOSPHERE_PRESETS: Record<WeatherAtmosphereType, AtmosphereConfig> = {
  clear_day: {
    type: 'clear_day',
    bgGradient: 'from-sky-400 via-sky-300 to-amber-100',
    badgeBg: 'bg-white/95 text-amber-900 border-amber-200',
    badgeText: 'text-amber-900',
    icon: '☀️',
    label: 'Sereno',
  },
  clear_night: {
    type: 'clear_night',
    bgGradient: 'from-slate-950 via-indigo-950 to-slate-900',
    badgeBg: 'bg-slate-900/95 text-amber-200 border-indigo-800',
    badgeText: 'text-amber-200',
    icon: '🌙',
    label: 'Sereno (Notte)',
  },
  partly_cloudy_day: {
    type: 'partly_cloudy_day',
    bgGradient: 'from-sky-400 via-sky-300 to-blue-200',
    badgeBg: 'bg-white/95 text-sky-900 border-sky-200',
    badgeText: 'text-sky-900',
    icon: '⛅',
    label: 'Parzialmente Nuvoloso',
  },
  partly_cloudy_night: {
    type: 'partly_cloudy_night',
    bgGradient: 'from-slate-950 via-indigo-950 to-slate-800',
    badgeBg: 'bg-indigo-950/95 text-indigo-200 border-indigo-800',
    badgeText: 'text-indigo-200',
    icon: '🌥️',
    label: 'Nubi sparse (Notte)',
  },
  cloudy: {
    type: 'cloudy',
    bgGradient: 'from-slate-500 via-slate-400 to-slate-300',
    badgeBg: 'bg-slate-100/95 text-slate-800 border-slate-300',
    badgeText: 'text-slate-800',
    icon: '☁️',
    label: 'Cielo Coperto',
  },
  fog: {
    type: 'fog',
    bgGradient: 'from-slate-400 via-slate-300 to-stone-300',
    badgeBg: 'bg-slate-100/95 text-slate-800 border-slate-300',
    badgeText: 'text-slate-800',
    icon: '🌫️',
    label: 'Nebbia o Foschia',
  },
  rain: {
    type: 'rain',
    bgGradient: 'from-slate-800 via-slate-700 to-blue-950',
    badgeBg: 'bg-slate-900/95 text-blue-200 border-blue-800',
    badgeText: 'text-blue-200',
    icon: '🌧️',
    label: 'Pioggia',
  },
  thunder: {
    type: 'thunder',
    bgGradient: 'from-slate-950 via-slate-900 to-indigo-950',
    badgeBg: 'bg-indigo-950/95 text-amber-300 border-indigo-700',
    badgeText: 'text-amber-300',
    icon: '⛈️',
    label: 'Temporale',
  },
  snow: {
    type: 'snow',
    bgGradient: 'from-slate-700 via-blue-900 to-sky-950',
    badgeBg: 'bg-sky-950/95 text-cyan-200 border-sky-700',
    badgeText: 'text-cyan-200',
    icon: '❄️',
    label: 'Neve',
  },
};

/**
 * Determina lo scenario atmosferico a partire dal codice WMO Open-Meteo (o symbol_code) e dal flag giorno/notte.
 */
export const resolveAtmosphereType = (
  symbolCode?: string,
  weatherCode?: number,
  isDay?: boolean
): WeatherAtmosphereType => {
  if (typeof weatherCode === 'number') {
    if (weatherCode >= 95) return 'thunder';
    if ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) {
      return 'snow';
    }
    if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
      return 'rain';
    }
    if (weatherCode === 45 || weatherCode === 48) return 'fog';
    if (weatherCode === 3) return 'cloudy';
    if (weatherCode === 1 || weatherCode === 2) {
      return isDay === false ? 'partly_cloudy_night' : 'partly_cloudy_day';
    }
    if (weatherCode === 0) {
      return isDay === false ? 'clear_night' : 'clear_day';
    }
  }

  if (!symbolCode) {
    return isDay === false ? 'clear_night' : 'clear_day';
  }

  const code = symbolCode.toLowerCase();
  const night = isDay === false || code.includes('night');

  if (code.includes('thunder')) return 'thunder';
  if (code.includes('snow') || code.includes('sleet')) return 'snow';
  if (code.includes('rain')) return 'rain';
  if (code.includes('fog')) return 'fog';
  if (code.includes('partlycloudy') || code.includes('fair')) {
    return night ? 'partly_cloudy_night' : 'partly_cloudy_day';
  }
  if (code.includes('cloudy')) return 'cloudy';
  if (night) return 'clear_night';

  return 'clear_day';
};
