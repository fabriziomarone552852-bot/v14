with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\TVSeriesPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "import RandomSeriesModal from './components/RandomSeriesModal';",
    "import RandomSeriesModal from './components/RandomSeriesModal';\nimport { SeriesDetailModal, type TabType } from './components/SeriesDetailModal';\nimport type { TMDBEpisode } from '../../types/trackers';"
)

with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\TVSeriesPage.tsx", "w", encoding="utf-8") as f:
    f.write(content)
