// src/utils/platformFilterUtils.ts
import type { UserStreamingProvider } from '@/types/auth';
import type { Movie } from '@/types/movies';
import type { TVSeries } from '@/types/trackers';

export interface TMDBProviderCatalogEntry {
  provider_id: number;
  provider_name: string;
}

const PLATFORM_ALIAS_GROUPS: ReadonlyArray<ReadonlyArray<string>> = [
  ['netflix', 'netflix standard with ads', 'netflix basic with ads'],
  ['amazon prime video', 'amazon prime video with ads', 'prime video', 'amazon video'],
  ['disney plus', 'disney+'],
  ['apple tv+', 'apple tv plus', 'apple tv'],
  ['paramount+', 'paramount plus'],
  ['now', 'sky', 'sky atlantic', 'sky go', 'hbo'],
  ['raiplay', 'rai play', 'rai 1', 'rai 2', 'rai 3'],
  ['mediaset infinity', 'infinity+', 'canale 5', 'italia 1'],
  ['timvision', 'tim vision'],
  ['crunchyroll'],
  ['mubi'],
];

const FALLBACK_IT_PROVIDER_IDS: ReadonlyArray<{
  aliases: ReadonlyArray<string>;
  ids: ReadonlyArray<number>;
}> = [
  { aliases: ['netflix', 'netflix standard with ads', 'netflix basic with ads'], ids: [8, 1796] },
  { aliases: ['amazon prime video', 'amazon prime video with ads', 'prime video', 'amazon video'], ids: [119, 2100] },
  { aliases: ['disney plus', 'disney+'], ids: [337] },
  { aliases: ['apple tv+', 'apple tv plus', 'apple tv'], ids: [350] },
  { aliases: ['paramount+', 'paramount plus'], ids: [531] },
  { aliases: ['now', 'sky', 'sky atlantic', 'sky go', 'hbo'], ids: [39, 29] },
  { aliases: ['raiplay', 'rai play'], ids: [222] },
  { aliases: ['mediaset infinity', 'infinity+'], ids: [359, 110] },
  { aliases: ['timvision', 'tim vision'], ids: [109] },
  { aliases: ['crunchyroll'], ids: [283] },
  { aliases: ['mubi'], ids: [11] },
];

export const expandPlatformNames = (raw: string): string[] => {
  const clean = raw.trim().toLowerCase();
  if (!clean) return [];
  for (const group of PLATFORM_ALIAS_GROUPS) {
    if (group.includes(clean)) {
      return [...group];
    }
  }
  return [clean];
};

const SAME_BRAND_ALIAS_GROUPS: ReadonlyArray<ReadonlyArray<string>> = [
  ['netflix', 'netflix standard with ads', 'netflix basic with ads'],
  ['amazon prime video', 'amazon prime video with ads', 'prime video', 'amazon video'],
  ['disney plus', 'disney+'],
  ['apple tv+', 'apple tv plus', 'apple tv'],
  ['paramount+', 'paramount plus'],
  ['raiplay', 'rai play'],
  ['timvision', 'tim vision'],
];

export const getBrandCanonicalKey = (raw: string): string => {
  const clean = raw.trim().toLowerCase();
  if (!clean) return '';
  for (const group of SAME_BRAND_ALIAS_GROUPS) {
    if (group.includes(clean)) {
      return group[0];
    }
  }
  return clean;
};

export const deduplicatePlatformOptions = (
  primaryNames: string[],
  fallbackNames: string[] = []
): Array<{ value: string; label: string }> => {
  const byKey = new Map<string, string>();

  for (const raw of [...primaryNames, ...fallbackNames]) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = getBrandCanonicalKey(trimmed);
    if (key && !byKey.has(key)) {
      byKey.set(key, trimmed);
    }
  }

  return Array.from(byKey.values())
    .sort((a, b) => a.localeCompare(b, 'it'))
    .map((name) => ({ value: name, label: name }));
};

export const buildMyPlatformsArray = (
  userProviders: readonly UserStreamingProvider[],
  availableOptions?: ReadonlyArray<{ value: string; label: string }>
): string[] => {
  if (!userProviders || userProviders.length === 0) return [];

  const deduped = deduplicatePlatformOptions(userProviders.map((p) => p.provider_name));
  if (!availableOptions || availableOptions.length === 0) {
    return deduped.map((d) => d.value);
  }

  return deduped.map((d) => {
    const key = getBrandCanonicalKey(d.value);
    const matchedOpt = availableOptions.find(
      (opt) => getBrandCanonicalKey(opt.value) === key || getBrandCanonicalKey(opt.label) === key
    );
    return matchedOpt ? matchedOpt.value : d.value;
  });
};

export const isMyPlatformsArray = (
  selectedValues: readonly string[] | undefined,
  userProviders: readonly UserStreamingProvider[]
): boolean => {
  if (!selectedValues || selectedValues.length === 0 || !userProviders || userProviders.length === 0) {
    return false;
  }

  const userKeys = new Set(
    userProviders
      .flatMap((p) => [getBrandCanonicalKey(p.provider_name), String(p.provider_id)])
      .filter(Boolean)
  );
  const targetUserBrandCount = new Set(
    userProviders.map((p) => getBrandCanonicalKey(p.provider_name)).filter(Boolean)
  ).size;

  const selectedBrandKeys = new Set(
    selectedValues.map((v) => getBrandCanonicalKey(v)).filter(Boolean)
  );

  if (selectedBrandKeys.size !== targetUserBrandCount) return false;
  return selectedValues.every((v) => {
    const key = getBrandCanonicalKey(v);
    return userKeys.has(key) || userKeys.has(v.trim());
  });
};

export const getPlatformMultiDisplayLabel = (
  selectedValues: readonly string[] | undefined,
  userProviders: readonly UserStreamingProvider[]
): string | undefined => {
  if (!selectedValues || selectedValues.length === 0) return undefined;
  if (selectedValues.length > 1) {
    return `${selectedValues.length} selezionati`;
  }
  if (isMyPlatformsArray(selectedValues, userProviders) && userProviders.length > 0) {
    return userProviders[0].provider_name;
  }
  return undefined;
};

export const buildTMDBWatchProvidersParam = (
  selectedValues: readonly string[] | undefined,
  tmdbProviders: readonly TMDBProviderCatalogEntry[] = [],
  userProviders: readonly UserStreamingProvider[] = []
): string | undefined => {
  if (!selectedValues || selectedValues.length === 0) return undefined;

  const ids = new Set<number>();

  for (const raw of selectedValues) {
    const token = raw.trim();
    if (!token || token === 'all') continue;

    if (/^\d+$/.test(token)) {
      ids.add(Number(token));
      continue;
    }

    const aliases = expandPlatformNames(token);
    const brandKey = getBrandCanonicalKey(token);

    for (const p of tmdbProviders) {
      const pLower = p.provider_name.trim().toLowerCase();
      const pKey = getBrandCanonicalKey(p.provider_name);
      if (aliases.includes(pLower) || (brandKey && pKey === brandKey)) {
        ids.add(p.provider_id);
      }
    }

    for (const up of userProviders) {
      const upLower = up.provider_name.trim().toLowerCase();
      const upKey = getBrandCanonicalKey(up.provider_name);
      if (aliases.includes(upLower) || (brandKey && upKey === brandKey)) {
        ids.add(up.provider_id);
      }
    }

    for (const fb of FALLBACK_IT_PROVIDER_IDS) {
      if (fb.aliases.some((a) => aliases.includes(a))) {
        fb.ids.forEach((id) => ids.add(id));
      }
    }
  }

  return ids.size > 0 ? Array.from(ids).join('|') : undefined;
};

const normalizePlatformTokens = (
  filterInput: string | readonly string[] | undefined
): string[] => {
  if (!filterInput) return [];
  if (typeof filterInput === 'string') {
    if (filterInput === 'all') return [];
    return filterInput
      .split('|')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return filterInput
    .flatMap((item) => item.split('|'))
    .map((t) => t.trim())
    .filter((t) => Boolean(t) && t !== 'all');
};

export const matchesMoviePlatformFilter = (
  movie: Movie | undefined | null,
  filterValue: string | readonly string[] | undefined
): boolean => {
  const rawTokens = normalizePlatformTokens(filterValue);
  if (rawTokens.length === 0) return true;
  if (!movie) return false;

  return rawTokens.some((token) => {
    const aliases = expandPlatformNames(token);

    const matchesWatchProvider = movie.watch_providers?.some((wp) => {
      if (String(wp.provider_id) === token) return true;
      const wpLower = wp.provider_name.trim().toLowerCase();
      return aliases.some((alias) => wpLower === alias || wpLower.includes(alias));
    });
    if (matchesWatchProvider) return true;

    const matchesLogPlatform = movie.logs?.some((log) => {
      const logPlat = log.viewing_platform_name?.trim().toLowerCase();
      if (!logPlat) return false;
      return aliases.some((alias) => logPlat === alias || logPlat.includes(alias));
    });

    return Boolean(matchesLogPlatform);
  });
};

export const matchesSeriesPlatformFilter = (
  series: TVSeries | undefined | null,
  filterValue: string | readonly string[] | undefined
): boolean => {
  const rawTokens = normalizePlatformTokens(filterValue);
  if (rawTokens.length === 0) return true;
  if (!series) return false;

  const seriesNetworks = (series.networks || '')
    .split(',')
    .map((n) => n.trim().toLowerCase())
    .filter(Boolean);

  return rawTokens.some((token) => {
    const aliases = expandPlatformNames(token);

    const matchesWatchProvider = series.watch_providers?.some((wp) => {
      if (String(wp.provider_id) === token) return true;
      const wpLower = wp.provider_name.trim().toLowerCase();
      return aliases.some((alias) => wpLower === alias || wpLower.includes(alias));
    });
    if (matchesWatchProvider) return true;

    const matchesNetwork = seriesNetworks.some((net) =>
      aliases.some((alias) => net === alias || net.includes(alias) || alias.includes(net))
    );
    if (matchesNetwork) return true;

    const matchesEpisodeLog = series.episodes?.some((ep) =>
      ep.logs?.some((log) => {
        const logPlat = log.viewing_platform_name?.trim().toLowerCase();
        if (!logPlat) return false;
        return aliases.some((alias) => logPlat === alias || logPlat.includes(alias));
      })
    );

    return Boolean(matchesEpisodeLog);
  });
};
