import re

# 1. OverviewTab.tsx
with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\OverviewTab.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "{ tmdb_id: 1, title: 'Serie Simile 1', poster_path: null }",
    "{ id: 1, tmdb_id: 1, title: 'Serie Simile 1', poster_path: null }"
)
content = content.replace(
    "{ tmdb_id: 2, title: 'Serie Simile 2', poster_path: null }",
    "{ id: 2, tmdb_id: 2, title: 'Serie Simile 2', poster_path: null }"
)
content = content.replace(
    "{ tmdb_id: 3, title: 'Serie Simile 3', poster_path: null }",
    "{ id: 3, tmdb_id: 3, title: 'Serie Simile 3', poster_path: null }"
)

with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\OverviewTab.tsx", "w", encoding="utf-8") as f:
    f.write(content)

# 2. SeasonsTab.tsx
with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\SeasonsTab.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "{ id: 1, user_id: 1, episode_id: 101, review_visibility: 'private', watched_at: new Date().toISOString() }",
    "{ id: 1, user_id: 1, episode_id: 101, tmdb_id: 101, season_number: 1, episode_number: 1, review_visibility: 'private', watched_at: new Date().toISOString() }"
)
content = content.replace(
    "{ id: 2, user_id: 1, episode_id: 102, review_visibility: 'private', watched_at: new Date().toISOString() }",
    "{ id: 2, user_id: 1, episode_id: 102, tmdb_id: 102, season_number: 1, episode_number: 2, review_visibility: 'private', watched_at: new Date().toISOString() }"
)

with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\SeasonsTab.tsx", "w", encoding="utf-8") as f:
    f.write(content)

# 3. TVSeriesPage.tsx
with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\TVSeriesPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("import { SeriesDetailModal } from './components/SeriesDetailModal';", "import { SeriesDetailModal, type TabType } from './components/SeriesDetailModal';\nimport type { TMDBEpisode } from '../../types/trackers';")

# In TVSeriesPage it was: const TVSeriesPage: React.FC = () => {
state_str = """  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailModalSeries, setDetailModalSeries] = useState<any>(null);
  const [detailModalTab, setDetailModalTab] = useState<TabType>('overview');
  const [detailModalEpisode, setDetailModalEpisode] = useState<TMDBEpisode | undefined>(undefined);

  const openSeriesDetail = (series: any, tab: TabType = 'overview', episode?: TMDBEpisode) => {
    setDetailModalSeries(series);
    setDetailModalTab(tab);
    setDetailModalEpisode(episode);
    setDetailModalOpen(true);
  };
"""
# make sure not to duplicate
if "setDetailModalOpen" not in content:
    content = content.replace("const TVSeriesPage: React.FC = () => {\n", "const TVSeriesPage: React.FC = () => {\n" + state_str)

# replace modal properly if it isn't there
if "<SeriesDetailModal" not in content:
    modal = """      {detailModalSeries && (
        <SeriesDetailModal 
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          series={detailModalSeries}
          initialTab={detailModalTab}
          initialEpisode={detailModalEpisode}
          onToggleTrack={(tmdbId: number, isTracked: boolean) => {
            if (!isTracked) {
              addSeries.mutate({ tmdb_id: tmdbId, status: 'to_watch' } as any);
            }
          }}
        />
      )}
    </div>
  );
};

export default TVSeriesPage;"""
    content = content.replace('    </div>\n  );\n};\n\nexport default TVSeriesPage;', modal)

# replace the mock
content = content.replace(
    'onEpisodeClick={(ep: any) => {/* TODO */}}', 
    'onEpisodeClick={(ep: any) => { const mockSeries = { tmdb_id: ep.id, title: ep.seriesName, status: "watching" }; const mockEpisode: any = { id: ep.id, series_tmdb_id: ep.id, season_number: parseInt(ep.episode.split("E")[0].replace("S", "")), episode_number: parseInt(ep.episode.split("E")[1]), title: `Episodio di ${ep.seriesName}` }; openSeriesDetail(mockSeries, "seasons", mockEpisode); }}'
)

with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\TVSeriesPage.tsx", "w", encoding="utf-8") as f:
    f.write(content)
