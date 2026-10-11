import os
import json

src_path = 'frontend/src/data/changelogData.ts'
with open(src_path, 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('improvements: [')
if idx != -1:
    insert_idx = content.find('[', idx) + 1
    new_improvement = "\n      'Refactoring Architetturale Modulare Frontend: Smantellamento dei macro-file React nella sezione Trackers (SeriesDetailModal, TVSeriesPage, ecc) e NotificationsSidebar (file divisi per separazione logica-visiva, peso ridotto sotto i 20KB).',"
    content = content[:insert_idx] + new_improvement + content[insert_idx:]

with open(src_path, 'w', encoding='utf-8') as f:
    f.write(content)
