// frontend/src/utils/moonPhaseUtils.ts

export type MoonPhaseKey =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

export interface MoonPhaseInfo {
  key: MoonPhaseKey;
  /** Fase normalizzata nel ciclo sinodico [0..1): 0 = Luna Nuova, 0.25 = Primo Quarto, 0.5 = Piena, 0.75 = Ultimo Quarto */
  phase: number;
  /** Frazione illuminata del disco lunare [0..1] */
  illumination: number;
  /** Percentuale illuminata arrotondata (0..100) */
  illuminationPct: number;
  /** Nome italiano della fase lunare */
  label: string;
  /** Emoji corrispondente (emisfero boreale) */
  icon: string;
}

const normalizeDegrees = (deg: number): number => ((deg % 360) + 360) % 360;
const degToRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Costruisce l'oggetto descrittivo completo a partire da un valore di fase [0..1).
 */
export const buildMoonPhaseInfoFromPhase = (rawPhase: number): MoonPhaseInfo => {
  const phase = ((rawPhase % 1) + 1) % 1;
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
  const illuminationPct = Math.round(illumination * 100);

  if (phase < 0.03 || phase >= 0.97) {
    return { key: 'new_moon', phase, illumination, illuminationPct, label: 'Luna Nuova', icon: '🌑' };
  }
  if (phase < 0.22) {
    return { key: 'waxing_crescent', phase, illumination, illuminationPct, label: 'Luna Crescente', icon: '🌒' };
  }
  if (phase < 0.28) {
    return { key: 'first_quarter', phase, illumination, illuminationPct, label: 'Primo Quarto', icon: '🌓' };
  }
  if (phase < 0.47) {
    return { key: 'waxing_gibbous', phase, illumination, illuminationPct, label: 'Gibbosa Crescente', icon: '🌔' };
  }
  if (phase < 0.53) {
    return { key: 'full_moon', phase, illumination, illuminationPct, label: 'Luna Piena', icon: '🌕' };
  }
  if (phase < 0.72) {
    return { key: 'waning_gibbous', phase, illumination, illuminationPct, label: 'Gibbosa Calante', icon: '🌖' };
  }
  if (phase < 0.78) {
    return { key: 'last_quarter', phase, illumination, illuminationPct, label: 'Ultimo Quarto', icon: '🌗' };
  }
  return { key: 'waning_crescent', phase, illumination, illuminationPct, label: 'Luna Calante', icon: '🌘' };
};

/**
 * Calcola la fase lunare astronomica reale per una data/ora (algoritmo di Jean Meeus,
 * elongazione eclittica geocentrica Sole-Luna con anomalie ed evezione) direttamente in RAM.
 */
export const getMoonPhaseInfo = (date: Date = new Date()): MoonPhaseInfo => {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;

  const D = normalizeDegrees(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T);
  const M = normalizeDegrees(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
  const Mp = normalizeDegrees(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T);

  const trueElongationDeg = normalizeDegrees(
    D +
      6.289 * Math.sin(degToRad(Mp)) -
      2.101 * Math.sin(degToRad(M)) +
      1.274 * Math.sin(degToRad(2 * D - Mp)) +
      0.658 * Math.sin(degToRad(2 * D)) +
      0.214 * Math.sin(degToRad(2 * Mp))
  );

  const phase = trueElongationDeg / 360;
  return buildMoonPhaseInfoFromPhase(phase);
};
