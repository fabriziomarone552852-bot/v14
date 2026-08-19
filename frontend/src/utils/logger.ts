// src/utils/logger.ts
//
// Logger centralizzato. In produzione (import.meta.env.PROD) non emette nulla.
// In sviluppo emette normalmente su console.
//
// Uso: import { logger } from '@/utils/logger';
//      logger.error('Messaggio', err);

const isDev = !import.meta.env.PROD;

export const logger = {
  log: (...args: unknown[]): void => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]): void => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]): void => {
    if (isDev) console.error(...args);
  },
};
