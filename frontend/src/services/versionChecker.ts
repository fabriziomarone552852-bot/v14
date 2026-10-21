// src/services/versionChecker.ts
import { getApiBaseUrl } from '@/api/client';
import { APP_VERSION } from '@/data/changelogData';

export interface RemoteVersionInfo {
  version: string;
  driveUrl: string;
  notes?: string;
}

export interface VersionCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  remoteVersion: string;
  driveUrl: string;
  notes?: string;
}

const SESSION_DISMISSED_KEY = 'vita_update_dismissed_version';

/**
 * Confronta due stringhe di versione semantiche (es: "15.0.0" vs "14.2.12").
 * Restituisce true se `remote` è strettamente maggiore di `current`.
 */
export function isVersionNewer(remote: string, current: string): boolean {
  if (!remote || !current) return false;

  const clean = (v: string) => v.trim().replace(/^v/i, '');
  const rParts = clean(remote).split('.').map(n => parseInt(n, 10) || 0);
  const cParts = clean(current).split('.').map(n => parseInt(n, 10) || 0);

  const len = Math.max(rParts.length, cParts.length, 3);
  for (let i = 0; i < len; i++) {
    const r = rParts[i] ?? 0;
    const c = cParts[i] ?? 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

/**
 * Scarica version.json dal server ed esegue il confronto con la versione locale installata.
 */
export async function checkAppUpdate(ignoreDismissed = false): Promise<VersionCheckResult | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/version.json?t=${Date.now()}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let response: Response | null = null;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
    } catch {
      // Fallback: se la chiamata diretta a /version.json fallisce per rete o policy, tenta tramite endpoint /system/version
      try {
        const fallbackUrl = `${baseUrl}/system/version?t=${Date.now()}`;
        response = await fetch(fallbackUrl, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
      } catch {
        response = null;
      }
    }
    clearTimeout(timeoutId);

    if (!response || !response.ok) {
      return null;
    }

    const data = (await response.json()) as RemoteVersionInfo;
    if (!data || !data.version) {
      return null;
    }

    const hasUpdate = isVersionNewer(data.version, APP_VERSION);

    // Se l'utente ha già cliccato "Più tardi" in questa sessione per questa specifica versione
    if (hasUpdate && !ignoreDismissed) {
      const dismissed = sessionStorage.getItem(SESSION_DISMISSED_KEY);
      if (dismissed === data.version) {
        return null;
      }
    }

    return {
      hasUpdate,
      currentVersion: APP_VERSION,
      remoteVersion: data.version,
      driveUrl: data.driveUrl || 'https://drive.google.com/drive/folders/1UrahhXpwuU4xPXjF1aT83LflnhIeEkPz?usp=sharing',
      notes: data.notes
    };
  } catch {
    // Errore silenzioso: se offline o server non raggiungibile, non disturba l'utente
    return null;
  }
}

/**
 * Salva la versione ignorata nella sessione corrente
 */
export function dismissUpdateForSession(version: string): void {
  try {
    sessionStorage.setItem(SESSION_DISMISSED_KEY, version);
  } catch {}
}
