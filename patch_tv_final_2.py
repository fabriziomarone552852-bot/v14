import re
with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\TVSeriesPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("import { TMDBSearchModal } from './components/TMDBSearchModal';", "import { SeriesDetailModal, type TabType } from './components/SeriesDetailModal';\nimport type { TMDBEpisode } from '../../types/trackers';")
content = content.replace("import type { TMDBSeries, TMDBEpisode } from '../../types/trackers';", "")

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
content = content.replace("const TVSeriesPage: React.FC = () => {\n", "const TVSeriesPage: React.FC = () => {\n" + state_str)

content = re.sub(r'(label="Ultima aggiunta"[\s\S]*?posterPath={lastAdded\?\.poster_path \|\| null})', r'\1 onClick={() => lastAdded && openSeriesDetail(lastAdded)}', content)
content = re.sub(r'(label="Continua a guardare"[\s\S]*?posterPath={lastWatched\?\.poster_path \|\| null})', r'\1 onClick={() => lastWatched && openSeriesDetail(lastWatched)}', content)
content = re.sub(r'(label="Completata!"[\s\S]*?posterPath={lastCompleted\?\.poster_path \|\| null})', r'\1 onClick={() => lastCompleted && openSeriesDetail(lastCompleted)}', content)
content = content.replace('onClick={() => {/* TODO: apri modal serie */}}', 'onClick={() => openSeriesDetail(s)}')

modal = """      {detailModalSeries && (
        <SeriesDetailModal 
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          series={detailModalSeries}
          initialTab={detailModalTab}
          initialEpisode={detailModalEpisode}
          onToggleTrack={(tmdbId: number, isTracked: boolean) => {
            if (!isTracked) {
              addSeriesMutation.mutate({ tmdb_id: tmdbId, status: 'to_watch' } as any);
            }
          }}
        />
      )}
    </div>
  );
};

export default TVSeriesPage;"""
content = content.replace('    </div>\n  );\n};\n\nexport default TVSeriesPage;', modal)
content = content.replace("// TODO: implementare modale serie\n          console.log('Apri modale serie per:', series);", "setRandomModalOpen(false);\n          openSeriesDetail(series);")

with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\TVSeriesPage.tsx", "w", encoding="utf-8") as f:
    f.write(content)
