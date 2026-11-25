// frontend/src/utils/weatherUtils.ts

const WMO_DESCRIPTIONS_IT: Record<number, string> = {
  0: 'Sereno',
  1: 'Prevalentemente sereno',
  2: 'Parzialmente nuvoloso',
  3: 'Cielo coperto',
  45: 'Nebbia',
  48: 'Nebbia con brina',
  51: 'Pioggerella leggera',
  53: 'Pioggerella moderata',
  55: 'Pioggerella intensa',
  56: 'Pioggerella gelata',
  57: 'Pioggerella gelata intensa',
  61: 'Pioggia leggera',
  63: 'Pioggia moderata',
  65: 'Pioggia forte',
  66: 'Pioggia gelata leggera',
  67: 'Pioggia gelata forte',
  71: 'Neve leggera',
  73: 'Neve moderata',
  75: 'Forte nevicata',
  77: 'Granuli di neve',
  80: 'Rovesci leggeri',
  81: 'Rovesci moderati',
  82: 'Rovesci violenti',
  85: 'Rovesci di neve',
  86: 'Forti rovesci di neve',
  95: 'Temporale',
  96: 'Temporale con grandine',
  99: 'Forte temporale con grandine',
};

const WEEKDAYS_SHORT_IT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'] as const;
const MONTHS_SHORT_IT = [
  'gen', 'feb', 'mar', 'apr', 'mag', 'giu',
  'lug', 'ago', 'set', 'ott', 'nov', 'dic',
] as const;

export interface UvLevelInfo {
  label: string;
  badgeClass: string;
}

/**
 * Restituisce una descrizione testuale in italiano a partire dal codice WMO Open-Meteo
 * (preferito) oppure dal symbol_code normalizzato.
 */
export const getWeatherDescription = (symbolCode?: string, weatherCode?: number): string => {
  if (typeof weatherCode === 'number' && weatherCode in WMO_DESCRIPTIONS_IT) {
    return WMO_DESCRIPTIONS_IT[weatherCode];
  }

  if (!symbolCode) return 'Meteo non disponibile';
  const code = symbolCode.toLowerCase();

  if (code.includes('clearsky')) {
    return code.includes('night') ? 'Sereno (notte)' : 'Sereno';
  }
  if (code.includes('fair')) {
    return code.includes('night') ? 'Poco nuvoloso' : 'Prevalentemente sereno';
  }
  if (code.includes('partlycloudy')) {
    return 'Parzialmente nuvoloso';
  }
  if (code.includes('thunder')) {
    return 'Temporale';
  }
  if (code.includes('snow')) {
    return code.includes('heavy') ? 'Forti nevicate' : 'Neve';
  }
  if (code.includes('sleet')) {
    return 'Nevischio';
  }
  if (code.includes('heavyrain')) {
    return 'Pioggia forte';
  }
  if (code.includes('lightrain') || code.includes('rainshowers')) {
    return 'Rovesci di pioggia';
  }
  if (code.includes('rain')) {
    return 'Pioggia';
  }
  if (code.includes('fog')) {
    return 'Nebbia o foschia';
  }
  if (code.includes('cloudy')) {
    return 'Cielo coperto';
  }
  return 'Variabile';
};

/**
 * Estrae l'orario HH:MM da una stringa ISO locale restituita da Open-Meteo (es. "2026-11-24T06:56").
 */
export const extractTimeHHMM = (isoLocalTime?: string | null): string => {
  if (!isoLocalTime || isoLocalTime.length < 16) return '--:--';
  return isoLocalTime.substring(11, 16);
};

/**
 * Converte un timestamp ISO UTC (es. updated_at) in orario locale HH:MM.
 */
export const formatUpdatedAtHHMM = (isoUtc?: string | null): string => {
  if (!isoUtc) return '';
  const parsed = new Date(isoUtc);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Converte i gradi di provenienza del vento (0-360) nella sigla cardinale italiana.
 */
export const formatWindDirection = (degrees?: number | null): string => {
  if (typeof degrees !== 'number' || Number.isNaN(degrees)) return '';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const normalized = ((degrees % 360) + 360) % 360;
  return dirs[Math.round(normalized / 45) % 8];
};

/**
 * Restituisce etichetta e classe colore per un indice UV.
 */
export const getUvLevelInfo = (uv?: number | null): UvLevelInfo => {
  if (typeof uv !== 'number' || Number.isNaN(uv)) {
    return { label: 'N/D', badgeClass: 'text-slate-500' };
  }
  if (uv < 3) return { label: 'Basso', badgeClass: 'text-emerald-600' };
  if (uv < 6) return { label: 'Moderato', badgeClass: 'text-amber-600' };
  if (uv < 8) return { label: 'Alto', badgeClass: 'text-orange-600' };
  if (uv < 11) return { label: 'Molto alto', badgeClass: 'text-rose-600' };
  return { label: 'Estremo', badgeClass: 'text-purple-700' };
};

/**
 * Formatta una data YYYY-MM-DD in etichetta breve italiana ("Oggi", "Domani", "Gio 26").
 * Usa parsing locale esplicito per evitare shift UTC.
 */
export const formatShortItalianDay = (dateStr: string, index?: number): string => {
  if (index === 0) return 'Oggi';
  if (index === 1) return 'Domani';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return dateStr;
  const [y, m, d] = parts;
  const dateObj = new Date(y, m - 1, d);
  const weekday = WEEKDAYS_SHORT_IT[dateObj.getDay()] ?? '';
  return `${weekday} ${d}`;
};

/**
 * Restituisce la sigla del giorno della settimana (es. "Mer") per una stringa ISO locale YYYY-MM-DD...
 */
export const getShortWeekdayFromIso = (isoLocalTime: string): string => {
  const datePart = isoLocalTime.substring(0, 10);
  const parts = datePart.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return '';
  const [y, m, d] = parts;
  return WEEKDAYS_SHORT_IT[new Date(y, m - 1, d).getDay()] ?? '';
};

/**
 * Formatta una data YYYY-MM-DD in etichetta leggibile italiana (es. "Lun 23 nov") senza shift UTC.
 */
export const formatItalianDayHeader = (dateStr: string): string => {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return dateStr;
  const [y, m, d] = parts;
  const dateObj = new Date(y, m - 1, d);
  const weekday = WEEKDAYS_SHORT_IT[dateObj.getDay()] ?? '';
  const month = MONTHS_SHORT_IT[m - 1] ?? '';
  return `${weekday} ${d} ${month}`.trim();
};
