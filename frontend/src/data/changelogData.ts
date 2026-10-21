// src/data/changelogData.ts
import type { ChangelogItem } from './changelogs/types';
import { CHANGELOG_V15 } from './changelogs/v15';
import { CHANGELOG_V14 } from './changelogs/v14';
import { CHANGELOG_V13 } from './changelogs/v13';

export type { ChangelogItem };

/**
 * Storico completo delle note di rilascio, aggregato per macro-versioni (v15, v14, v13...).
 * Ogni file in ./changelogs/ raccoglie tutte le versioni di una specifica Major release.
 */
export const CHANGELOG_HISTORY: ChangelogItem[] = [
  ...CHANGELOG_V15,
  ...CHANGELOG_V14,
  ...CHANGELOG_V13,
];

export const APP_VERSION: string = CHANGELOG_HISTORY[0].version;
export const APP_VERSION_NAME: string = `v${APP_VERSION}`;
export const APP_LAST_UPDATE: string = CHANGELOG_HISTORY[0].date;