import { parseRRule } from '@/utils/rruleUtils';
import { formatToItalianShortDate } from '@/utils/dateUtils';

export const formatEventRecurrence = (rruleString?: string | null): string => {
  if (!rruleString) return '—';

  try {
    const { isRecurrent, freq, interval, until } = parseRRule(rruleString);
    if (!isRecurrent) return '—';

    const intVal = parseInt(interval, 10) || 1;
    let freqText = '';

    switch (freq) {
      case 'DAILY':
        freqText = intVal === 1 ? 'Ogni giorno' : `Ogni ${intVal} giorni`;
        break;
      case 'WEEKLY':
        freqText = intVal === 1 ? 'Ogni settimana' : `Ogni ${intVal} settimane`;
        break;
      case 'MONTHLY':
        freqText = intVal === 1 ? 'Ogni mese' : `Ogni ${intVal} mesi`;
        break;
      case 'YEARLY':
        freqText = intVal === 1 ? 'Ogni anno' : `Ogni ${intVal} anni`;
        break;
      default:
        freqText = intVal === 1 ? 'Ogni intervallo' : `Ogni ${intVal} intervalli`;
        break;
    }

    if (until) {
      const formattedUntil = formatToItalianShortDate(until);
      return `${freqText} fino al ${formattedUntil}`;
    }

    return freqText;
  } catch {
    return 'Ricorrente';
  }
};
