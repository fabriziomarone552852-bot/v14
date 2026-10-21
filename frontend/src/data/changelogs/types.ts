// src/data/changelogs/types.ts

export interface ChangelogItem {
  id: string;
  version: string;
  date: string;
  title: string;
  isLatest?: boolean;
  published?: boolean;
  highlights?: string[];
  features?: string[];
  improvements?: string[];
  fixes?: string[];
}
