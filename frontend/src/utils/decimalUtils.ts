// src/utils/decimalUtils.ts

/**
 * Sanitizza una stringa numerica decimale consentendo sia la virgola ',' che il punto '.'
 * come separatori decimali, rimuovendo caratteri non validi e prevenendo separatori duplicati.
 *
 * @example
 * sanitizeDecimalString("12,50") => "12,50"
 * sanitizeDecimalString("12.50") => "12.50"
 * sanitizeDecimalString("12..50") => "12.50"
 * sanitizeDecimalString("12,,50") => "12,50"
 * sanitizeDecimalString("abc12,5€") => "12,5"
 */
export const sanitizeDecimalString = (raw: string): string => {
  if (!raw) return '';
  // Rimuovi tutto tranne cifre, virgola e punto
  const cleaned = raw.replace(/[^0-9.,]/g, '');

  let separatorFound = false;
  let result = '';

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (char === '.' || char === ',') {
      if (!separatorFound) {
        separatorFound = true;
        result += char;
      }
    } else {
      result += char;
    }
  }

  return result;
};

/**
 * Converte in modo sicuro una stringa decimale formattata con virgola o punto
 * in un numero JavaScript float standard. Restituisce defaultValue se non valida o vuota.
 *
 * @example
 * parseDecimalValue("12,50") => 12.5
 * parseDecimalValue("12.50") => 12.5
 * parseDecimalValue(",50") => 0.5
 * parseDecimalValue(".50") => 0.5
 * parseDecimalValue("12,") => 12
 * parseDecimalValue("") => 0
 */
export const parseDecimalValue = (
  str: string | number | null | undefined,
  defaultValue = 0
): number => {
  if (typeof str === 'number') {
    return isNaN(str) ? defaultValue : str;
  }
  if (!str || typeof str !== 'string') {
    return defaultValue;
  }
  const normalized = str.trim().replace(',', '.');
  if (!normalized) return defaultValue;
  const num = parseFloat(normalized);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Formatta un numero o valore decimale per la visualizzazione all'utente.
 */
export const formatDecimalDisplay = (val: number | null | undefined, decimals = 2): string => {
  if (val == null || isNaN(val)) return '';
  return val.toFixed(decimals);
};
