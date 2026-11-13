// src/utils/trackerFilterUtils.ts

export type GenreFilterMode = 'OR' | 'AND';
export type GenreTriState = 'neutral' | 'include' | 'exclude';

export interface GenreFilterRule {
  include: string[];
  exclude: string[];
  mode: GenreFilterMode;
}

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface TMDBGenreCatalogItem {
  id: number;
  name: string;
}

export const EMPTY_GENRE_FILTER: GenreFilterRule = {
  include: [],
  exclude: [],
  mode: 'OR',
};

const GENRE_SYNONYM_GROUPS: ReadonlyArray<{
  tvIds: readonly number[];
  movieIds: readonly number[];
  names: readonly string[];
}> = [
  { tvIds: [10759], movieIds: [28], names: ['azione', 'action', 'action & adventure'] },
  { tvIds: [10759], movieIds: [12], names: ['avventura', 'adventure'] },
  { tvIds: [16], movieIds: [16], names: ['animazione', 'animation'] },
  { tvIds: [35], movieIds: [35], names: ['commedia', 'comedy'] },
  { tvIds: [80], movieIds: [80], names: ['crime', 'crimine', 'poliziesco'] },
  { tvIds: [99], movieIds: [99], names: ['documentario', 'documentary'] },
  { tvIds: [18], movieIds: [18], names: ['dramma', 'drama', 'drammatico'] },
  { tvIds: [10751], movieIds: [10751], names: ['famiglia', 'family'] },
  { tvIds: [10765], movieIds: [14], names: ['fantasy', 'sci-fi & fantasy'] },
  { tvIds: [10765], movieIds: [878], names: ['fantascienza', 'science fiction', 'sci-fi'] },
  { tvIds: [36], movieIds: [36], names: ['storia', 'history', 'storico'] },
  { tvIds: [27], movieIds: [27], names: ['horror'] },
  { tvIds: [10402], movieIds: [10402], names: ['musica', 'music'] },
  { tvIds: [9648], movieIds: [9648], names: ['mistero', 'mystery'] },
  { tvIds: [10749], movieIds: [10749], names: ['romance', 'romantico', 'sentimentale'] },
  { tvIds: [53], movieIds: [53], names: ['thriller'] },
  { tvIds: [10768], movieIds: [10752], names: ['guerra', 'war', 'war & politics'] },
  { tvIds: [37], movieIds: [37], names: ['western'] },
  { tvIds: [10762], movieIds: [], names: ['kids', 'bambini', 'ragazzi'] },
  { tvIds: [10763], movieIds: [], names: ['news'] },
  { tvIds: [10764], movieIds: [], names: ['reality'] },
  { tvIds: [10766], movieIds: [], names: ['soap'] },
  { tvIds: [10767], movieIds: [], names: ['talk'] },
  { tvIds: [], movieIds: [10770], names: ['televisione film', 'tv movie'] },
];

export const isGenreFilterActive = (rule?: GenreFilterRule | null): boolean =>
  Boolean(rule && (rule.include.length > 0 || rule.exclude.length > 0));

export const getGenreTriState = (rule: GenreFilterRule, value: string): GenreTriState => {
  if (rule.include.includes(value)) return 'include';
  if (rule.exclude.includes(value)) return 'exclude';
  return 'neutral';
};

export const cycleGenreTriState = (
  rule: GenreFilterRule,
  value: string
): GenreFilterRule => {
  const current = getGenreTriState(rule, value);
  if (current === 'neutral') {
    const nextInclude = [...rule.include, value];
    return {
      ...rule,
      include: nextInclude,
      exclude: rule.exclude.filter((v) => v !== value),
      mode: nextInclude.length < 2 ? 'OR' : rule.mode,
    };
  }
  if (current === 'include') {
    const nextInclude = rule.include.filter((v) => v !== value);
    return {
      ...rule,
      include: nextInclude,
      exclude: [...rule.exclude, value],
      mode: nextInclude.length < 2 ? 'OR' : rule.mode,
    };
  }
  const nextInclude = rule.include.filter((v) => v !== value);
  return {
    ...rule,
    include: nextInclude,
    exclude: rule.exclude.filter((v) => v !== value),
    mode: nextInclude.length < 2 ? 'OR' : rule.mode,
  };
};

export const toggleMultiOrValue = <T extends string | number>(
  current: readonly T[] | undefined,
  value: T
): T[] => {
  const list = current ? [...current] : [];
  const idx = list.indexOf(value);
  if (idx >= 0) {
    list.splice(idx, 1);
    return list;
  }
  return [...list, value];
};

const expandGenreAliases = (
  rawToken: string,
  tmdbGenres: readonly TMDBGenreCatalogItem[] = []
): string[] => {
  const clean = rawToken.trim().toLowerCase();
  if (!clean) return [];

  const aliases = new Set<string>([clean]);

  if (/^\d+$/.test(clean)) {
    const numId = Number(clean);
    const catalogMatch = tmdbGenres.find((g) => g.id === numId);
    if (catalogMatch) {
      aliases.add(catalogMatch.name.trim().toLowerCase());
    }
    for (const grp of GENRE_SYNONYM_GROUPS) {
      if (grp.tvIds.includes(numId) || grp.movieIds.includes(numId)) {
        grp.names.forEach((n) => aliases.add(n));
      }
    }
  } else {
    for (const grp of GENRE_SYNONYM_GROUPS) {
      if (grp.names.includes(clean)) {
        grp.names.forEach((n) => aliases.add(n));
      }
    }
  }

  return Array.from(aliases);
};

export const matchesGenreFilterRule = (
  itemGenresCsv: string | null | undefined,
  rule: GenreFilterRule | undefined,
  tmdbGenres: readonly TMDBGenreCatalogItem[] = []
): boolean => {
  if (!isGenreFilterActive(rule) || !rule) return true;

  const itemTokens = (itemGenresCsv || '')
    .split(',')
    .map((g) => g.trim().toLowerCase())
    .filter(Boolean);

  const tokenMatchesItem = (filterToken: string): boolean => {
    const aliases = expandGenreAliases(filterToken, tmdbGenres);
    return itemTokens.some((it) => aliases.includes(it));
  };

  if (rule.exclude.length > 0) {
    const hasExcluded = rule.exclude.some((ex) => tokenMatchesItem(ex));
    if (hasExcluded) return false;
  }

  if (rule.include.length > 0) {
    if (itemTokens.length === 0) return false;
    if (rule.mode === 'AND') {
      return rule.include.every((inc) => tokenMatchesItem(inc));
    }
    return rule.include.some((inc) => tokenMatchesItem(inc));
  }

  return true;
};

export const resolveGenreTokenToTMDBIds = (
  rawToken: string,
  tmdbGenres: readonly TMDBGenreCatalogItem[],
  mediaType: 'tv' | 'movie'
): number[] => {
  const clean = rawToken.trim();
  if (!clean) return [];
  if (/^\d+$/.test(clean)) return [Number(clean)];

  const lower = clean.toLowerCase();
  const exactCatalog = tmdbGenres.find((g) => g.name.trim().toLowerCase() === lower);
  if (exactCatalog) return [exactCatalog.id];

  const ids = new Set<number>();
  for (const grp of GENRE_SYNONYM_GROUPS) {
    if (grp.names.includes(lower)) {
      const targetIds = mediaType === 'tv' ? grp.tvIds : grp.movieIds;
      targetIds.forEach((id) => ids.add(id));
      for (const syn of grp.names) {
        const synMatch = tmdbGenres.find((g) => g.name.trim().toLowerCase() === syn);
        if (synMatch) ids.add(synMatch.id);
      }
    }
  }
  return Array.from(ids);
};

export const buildTMDBGenreParams = (
  rule: GenreFilterRule | undefined,
  tmdbGenres: readonly TMDBGenreCatalogItem[],
  mediaType: 'tv' | 'movie'
): { with_genres?: string; without_genres?: string } => {
  if (!rule) return {};

  const includeIds = Array.from(
    new Set(
      rule.include.flatMap((tok) => resolveGenreTokenToTMDBIds(tok, tmdbGenres, mediaType))
    )
  );
  const excludeIds = Array.from(
    new Set(
      rule.exclude.flatMap((tok) => resolveGenreTokenToTMDBIds(tok, tmdbGenres, mediaType))
    )
  );

  const result: { with_genres?: string; without_genres?: string } = {};
  if (includeIds.length > 0) {
    const sep = rule.mode === 'AND' ? ',' : '|';
    result.with_genres = includeIds.join(sep);
  }
  if (excludeIds.length > 0) {
    result.without_genres = excludeIds.join('|');
  }
  return result;
};

export const mapSortByToTMDB = (
  sortBy: string | undefined,
  mediaType: 'tv' | 'movie'
): string => {
  switch (sortBy) {
    case 'rating_desc':
      return 'vote_average.desc';
    case 'name_asc':
      return mediaType === 'tv' ? 'name.asc' : 'title.asc';
    case 'name_desc':
      return mediaType === 'tv' ? 'name.desc' : 'title.desc';
    case 'release_date_desc':
      return mediaType === 'tv' ? 'first_air_date.desc' : 'primary_release_date.desc';
    case 'release_date_asc':
      return mediaType === 'tv' ? 'first_air_date.asc' : 'primary_release_date.asc';
    default:
      return 'popularity.desc';
  }
};

export const formatGenreFilterSummary = (
  rule: GenreFilterRule | undefined,
  options: readonly FilterSelectOption[],
  allLabel: string
): string => {
  if (!rule || !isGenreFilterActive(rule)) return allLabel;

  const getLabel = (val: string) =>
    options.find((o) => o.value === val)?.label || val;

  const inc = rule.include.map(getLabel);
  const exc = rule.exclude.map(getLabel);
  const totalCount = inc.length + exc.length;

  if (inc.length === 1 && exc.length === 0) return inc[0];
  if (inc.length === 0 && exc.length === 1) return `- ${exc[0]}`;
  return `${totalCount} selezionati`;
};

export const formatMultiSelectSummary = (
  values: readonly string[] | undefined,
  options: readonly FilterSelectOption[],
  allLabel: string,
  overrideLabel?: string
): string => {
  if (overrideLabel) return overrideLabel;
  if (!values || values.length === 0) return allLabel;

  const getLabel = (val: string) =>
    options.find((o) => o.value === val)?.label || val;

  if (values.length === 1) return getLabel(values[0]);
  return `${values.length} selezionati`;
};

export const matchesYearMultiFilter = (
  dateStr: string | null | undefined,
  years: readonly string[] | undefined
): boolean => {
  if (!years || years.length === 0) return true;
  if (!dateStr) return false;
  return years.some((yr) => dateStr.startsWith(yr));
};
