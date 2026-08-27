// src/utils/monthCellUtils.ts
import type React from 'react';

/**
 * Calcola la classe CSS di allineamento per i popover e i menu contestuali
 * all'interno delle celle del calendario mensile (7 colonne).
 *
 * - Colonne 5, 6 (Sabato, Domenica): allineamento a destra per evitare overflow
 * - Colonne 0, 1 (Lunedì, Martedì): allineamento a sinistra
 * - Colonne centrali (2, 3, 4): centrato
 */
export function getPopoverAlignClass(colIndex?: number): string {
  if (colIndex === undefined) return 'left-1/2 transform -translate-x-1/2';
  if (colIndex >= 5) return 'right-0 left-auto transform translate-x-0';
  if (colIndex <= 1) return 'left-0 right-auto transform translate-x-0';
  return 'left-1/2 transform -translate-x-1/2';
}

/**
 * Genera gli stili di sfondo e bordo per una cella con stato d'animo / mood attivo.
 */
export function getMoodCellStyles(activeMoodColor?: string | null): {
  cellBgStyle: React.CSSProperties;
  cellBorderStyle: React.CSSProperties;
  moodColor: string;
} {
  const moodColor = activeMoodColor || '#9CA3AF';
  const cellBgStyle: React.CSSProperties = activeMoodColor ? { backgroundColor: `${moodColor}15` } : {};
  const cellBorderStyle: React.CSSProperties = activeMoodColor ? { borderColor: moodColor } : {};

  return { cellBgStyle, cellBorderStyle, moodColor };
}
