// frontend/src/types/horoscope.ts

export type ZodiacSignSlug =
  | 'ariete'
  | 'toro'
  | 'gemelli'
  | 'cancro'
  | 'leone'
  | 'vergine'
  | 'bilancia'
  | 'scorpione'
  | 'sagittario'
  | 'capricorno'
  | 'acquario'
  | 'pesci';

export interface ZodiacSignMeta {
  slug: ZodiacSignSlug;
  name: string;
  symbol: string;
  dateRange: string;
}

export const ZODIAC_SIGNS_LIST: readonly ZodiacSignMeta[] = [
  { slug: 'ariete', name: 'Ariete', symbol: '♈', dateRange: '21 Mar - 19 Apr' },
  { slug: 'toro', name: 'Toro', symbol: '♉', dateRange: '20 Apr - 20 Mag' },
  { slug: 'gemelli', name: 'Gemelli', symbol: '♊', dateRange: '21 Mag - 20 Giu' },
  { slug: 'cancro', name: 'Cancro', symbol: '♋', dateRange: '21 Giu - 22 Lug' },
  { slug: 'leone', name: 'Leone', symbol: '♌', dateRange: '23 Lug - 22 Ago' },
  { slug: 'vergine', name: 'Vergine', symbol: '♍', dateRange: '23 Ago - 22 Set' },
  { slug: 'bilancia', name: 'Bilancia', symbol: '♎', dateRange: '23 Set - 22 Ott' },
  { slug: 'scorpione', name: 'Scorpione', symbol: '♏', dateRange: '23 Ott - 21 Nov' },
  { slug: 'sagittario', name: 'Sagittario', symbol: '♐', dateRange: '22 Nov - 21 Dic' },
  { slug: 'capricorno', name: 'Capricorno', symbol: '♑', dateRange: '22 Dic - 19 Gen' },
  { slug: 'acquario', name: 'Acquario', symbol: '♒', dateRange: '20 Gen - 18 Feb' },
  { slug: 'pesci', name: 'Pesci', symbol: '♓', dateRange: '19 Feb - 20 Mar' },
] as const;

export const getZodiacSignMeta = (slug: ZodiacSignSlug): ZodiacSignMeta => {
  return ZODIAC_SIGNS_LIST.find((s) => s.slug === slug) ?? ZODIAC_SIGNS_LIST[0];
};

export interface HoroscopeSignEntry {
  sign: ZodiacSignSlug;
  name: string;
  symbol: string;
  date_range: string;
  date_label?: string | null;
  general: string;
  love?: string | null;
  work?: string | null;
  wellness?: string | null;
  source: string;
}

export interface DailyHoroscopeCollectionResponse {
  date: string;
  updated_at: string;
  signs: Partial<Record<ZodiacSignSlug, HoroscopeSignEntry>>;
}

export interface HoroscopePreference {
  enabled: boolean;
  sign: ZodiacSignSlug;
}
