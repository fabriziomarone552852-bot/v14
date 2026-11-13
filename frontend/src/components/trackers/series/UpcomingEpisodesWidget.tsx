import { EmptyState } from '@/components/shared/utils/EmptyState';
import { useUpcomingEpisodes } from '@/hooks/queries/useTrackersQueries';
import type { UpcomingEpisode } from '@/types/trackers';

interface UpcomingProps {
  openSeriesDetail: (series: { tmdb_id: number; title: string; poster_path?: string | null }) => void;
}

export const UpcomingEpisodesWidget = ({ openSeriesDetail }: UpcomingProps) => {
  const today = new Date();
  const startDateStr = new Date(today.getFullYear(), today.getMonth() - 2, 1).toISOString().split('T')[0];
  const endDateStr = new Date(today.getFullYear(), today.getMonth() + 3, 0).toISOString().split('T')[0];
  const { data: upcomingData } = useUpcomingEpisodes(startDateStr, endDateStr);
  
  const todayStr = today.toISOString().split('T')[0];
  const upcoming = upcomingData ? upcomingData.filter((ep: UpcomingEpisode) => ep.air_date >= todayStr).sort((a: UpcomingEpisode, b: UpcomingEpisode) => {
    const dateCmp = a.air_date.localeCompare(b.air_date);
    if (dateCmp !== 0) return dateCmp;
    const titleCmp = (a.series_title || '').localeCompare(b.series_title || '');
    if (titleCmp !== 0) return titleCmp;
    if (a.season_number !== b.season_number) return a.season_number - b.season_number;
    return a.episode_number - b.episode_number;
  }) : [];

  return (
    <div className="flex flex-col h-full overflow-visible justify-center w-full">
      <div className="flex gap-5 overflow-x-auto pt-4 pb-4 px-4 snap-x items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {upcoming.length > 0 ? upcoming.map((ep: UpcomingEpisode) => (
          <div key={ep.episode_id} onClick={() => openSeriesDetail({ tmdb_id: ep.series_tmdb_id, title: ep.series_title, poster_path: ep.series_poster_path })} className="w-[110px] flex flex-col shrink-0 snap-start cursor-pointer hover:scale-110 hover:z-20 transition-all duration-300">
            <div className="aspect-[2/3] bg-gray-100 rounded-xl overflow-hidden shadow-sm relative border-2 border-transparent hover:border-blue-400 transition-colors group">
              <img src={ep.series_poster_path ? `https://image.tmdb.org/t/p/w500${ep.series_poster_path}` : "/no-poster.png"} alt="" className="w-full h-full object-cover opacity-50" />
              
              {/* TOP: Date */}
              <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent pt-2 pb-5 px-1">
                <p className="text-[10px] text-blue-400 font-extrabold uppercase text-center drop-shadow-md">{new Date(ep.air_date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</p>
              </div>

              {/* BOTTOM: Text overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-100 flex flex-col justify-end p-2 transition-opacity">
                <p className="text-white font-extrabold text-[11px] leading-tight line-clamp-2 drop-shadow-md">{ep.series_title}</p>
                <p className="text-blue-300 font-bold text-[9px] mt-0.5 tracking-wider">{`S${String(ep.season_number).padStart(2, '0')}E${String(ep.episode_number).padStart(2, '0')}`}</p>
              </div>
            </div>
          </div>
        )) : (
          <div className="w-full flex justify-center items-center h-[165px]">
            <EmptyState message="Nessuna uscita programmata." />
          </div>
        )}
      </div>
    </div>
  );
};
