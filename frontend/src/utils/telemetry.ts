// src/utils/telemetry.ts
import { Capacitor } from '@capacitor/core';
import { APP_VERSION_NAME } from '@/data/changelogData';

export interface TelemetryLogEntry {
  timestamp: string;
  type: 'api_error' | 'react_crash' | 'app_warning' | 'custom';
  message: string;
  endpoint?: string;
  statusCode?: number;
  stack?: string;
  meta?: Record<string, unknown>;
}

const MAX_LOGS = 15;
const errorLogBuffer: TelemetryLogEntry[] = [];

/**
 * Registra un errore o evento diagnostico nel buffer circolare in memoria.
 */
export function recordTelemetryError(entry: Omit<TelemetryLogEntry, 'timestamp'>): void {
  try {
    const fullEntry: TelemetryLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };
    errorLogBuffer.unshift(fullEntry);
    if (errorLogBuffer.length > MAX_LOGS) {
      errorLogBuffer.pop();
    }
  } catch {
    // Ignora errori interni al logger di telemetria
  }
}

/**
 * Restituisce una copia dei log recenti salvati in memoria.
 */
export function getRecentTelemetryLogs(): TelemetryLogEntry[] {
  return [...errorLogBuffer];
}

/**
 * Identifica la piattaforma di esecuzione attuale.
 */
export function detectPlatformName(): string {
  if (Capacitor.isNativePlatform()) {
    return 'android_apk';
  }
  if (typeof window !== 'undefined') {
    const isMobileWidth = window.innerWidth < 768;
    return isMobileWidth ? 'web_mobile' : 'web_desktop';
  }
  return 'unknown';
}

/**
 * Genera il payload diagnostico completo serializzato in JSON da allegare ai bug report.
 */
export function getDiagnosticContext(extraContext?: Record<string, unknown>): string {
  try {
    const contextData = {
      app_version: APP_VERSION_NAME,
      platform: detectPlatformName(),
      current_route: typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : 'unknown',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      screen_resolution: typeof window !== 'undefined'
        ? `${window.innerWidth}x${window.innerHeight} (pixelRatio: ${window.devicePixelRatio || 1})`
        : 'unknown',
      timestamp: new Date().toISOString(),
      recent_errors: getRecentTelemetryLogs(),
      ...extraContext,
    };
    return JSON.stringify(contextData, null, 2);
  } catch (err: unknown) {
    return JSON.stringify({
      error: 'Impossibile raccogliere telemetria completa',
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
