import re

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\SeasonsTab.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if "import { StarRating }" not in content:
    content = content.replace("import { EpisodeDetailView } from './EpisodeDetailView';", "import { EpisodeDetailView } from './EpisodeDetailView';\nimport { StarRating } from './StarRating';")

old_rating = r'''                  \{averageRating && \(
                    <div className="flex items-center gap-1 text-yellow-500" title=\{\Media basata su \$\{ratedEpisodesCount\} episodi valutati\\}>
                      <span className="font-bold text-sm">\{averageRating\}</span>
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9\.049 2\.927c\.3-\.921 1\.603-\.921 1\.902 0l1\.07 3\.292a1 1 0 00\.95\.69h3\.462c\.969 0 1\.371 1\.24\.588 1\.81l-2\.8 2\.034a1 1 0 00-\.364 1\.118l1\.07 3\.292c\.3\.921-\.755 1\.688-1\.54 1\.118l-2\.8-2\.034a1 1 0 00-1\.175 0l-2\.8 2\.034c-\.784\.57-1\.838-\.197-1\.539-1\.118l1\.07-3\.292a1 1 0 00-\.364-1\.118L2\.98 8\.72c-\.783-\.57-\.38-1\.81\.588-1\.81h3\.461a1 1 0 00\.951-\.69l1\.07-3\.292z" /></svg>
                    </div>
                  \}'''

new_rating = '''                  {averageRating && (
                    <div title={Media basata su  episodi valutati}>
                      <StarRating value={parseFloat(averageRating)} readonly iconClassName="w-4 h-4" />
                    </div>
                  )}'''

content = re.sub(old_rating, new_rating, content, flags=re.MULTILINE)

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\SeasonsTab.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
