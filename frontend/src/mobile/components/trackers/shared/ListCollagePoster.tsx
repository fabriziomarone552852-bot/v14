// src/mobile/components/trackers/shared/ListCollagePoster.tsx
import React, { useMemo } from 'react';
import type { MediaList, TrackerMediaType } from '@/types/trackers';
import {
  filterListItemsByMediaType,
  getMediaListItemTargetId,
  getMediaListItemFallbackPoster,
  resolveTrackerPosterUrl,
} from '@/utils/trackerListUtils';

export interface ListCollagePosterProps {
  list: MediaList;
  mediaType: TrackerMediaType;
  posterByMediaId?: ReadonlyMap<number | string, string | null | undefined>;
}

export const getListRecentPosters = (
  list: MediaList,
  mediaType: TrackerMediaType,
  posterByMediaId?: ReadonlyMap<number | string, string | null | undefined>
): string[] => {
  const matchingItems = filterListItemsByMediaType(list, mediaType);
  if (matchingItems.length === 0) return [];

  const sorted = [...matchingItems].sort(
    (a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
  );

  const posters: string[] = [];
  const seenIds = new Set<string>();

  for (const item of sorted) {
    const targetId = getMediaListItemTargetId(item, mediaType);
    if (!targetId) continue;

    const mediaKey = `${mediaType}-${targetId}`;
    if (seenIds.has(mediaKey)) continue;
    seenIds.add(mediaKey);

    const catalogPoster = posterByMediaId?.get(targetId);
    const resolvedPoster =
      catalogPoster ||
      resolveTrackerPosterUrl(getMediaListItemFallbackPoster(item, mediaType), 'w200');

    if (resolvedPoster) {
      posters.push(resolvedPoster);
    }

    if (posters.length === 4) break;
  }

  return posters;
};

export const ListCollagePoster: React.FC<ListCollagePosterProps> = ({
  list,
  mediaType,
  posterByMediaId,
}) => {
  const posters = useMemo(
    () => getListRecentPosters(list, mediaType, posterByMediaId),
    [list, mediaType, posterByMediaId]
  );

  return (
    <div
      className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-indigo-50/50 border border-gray-200/80 shadow-2xs pointer-events-none shrink-0"
      title={list.name}
    >
      {/* 0 POSTER: LISTA VUOTA */}
      {posters.length === 0 && (
        <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center text-indigo-400">
          <span className="text-base leading-none">📁</span>
          <span className="text-[8px] font-bold text-gray-400 mt-0.5">Vuota</span>
        </div>
      )}

      {/* 1 POSTER: LOCANDINA SINGOLA A PIENO SPAZIO */}
      {posters.length === 1 && (
        <img
          src={posters[0]}
          alt={list.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* 2 POSTER: SPLIT A DUE COLONNE AFFIANCATE */}
      {posters.length === 2 && (
        <div className="grid grid-cols-2 w-full h-full gap-[1px] bg-black/20">
          <img
            src={posters[0]}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <img
            src={posters[1]}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* 3 POSTER: HERO IN ALTO E DUE POSTER SOTTO */}
      {posters.length === 3 && (
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-[1px] bg-black/20">
          <div className="col-span-2 row-span-1 overflow-hidden">
            <img
              src={posters[0]}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="col-span-1 row-span-1 overflow-hidden">
            <img
              src={posters[1]}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="col-span-1 row-span-1 overflow-hidden">
            <img
              src={posters[2]}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* 4 POSTER: GRIGLIA COLLAGE 2X2 */}
      {posters.length >= 4 && (
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-[1px] bg-black/20">
          <img
            src={posters[0]}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <img
            src={posters[1]}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <img
            src={posters[2]}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <img
            src={posters[3]}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Nome della lista SOPRA la card con gradiente nero sfumato (stile highlight) */}
      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/85 via-black/45 to-transparent pt-1 pb-3.5 px-1 z-10 flex items-center justify-center pointer-events-none">
        <span className="text-[9.5px] font-black text-white line-clamp-2 w-full text-center leading-tight drop-shadow-sm">
          {list.name}
        </span>
      </div>
    </div>
  );
};

export default ListCollagePoster;
