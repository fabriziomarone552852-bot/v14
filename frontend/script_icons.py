import re

def update_icons(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import if missing
    if "import { EditIcon, TrashIcon }" not in content:
        content = content.replace("import { StarRating } from './StarRating';", "import { StarRating } from './StarRating';\nimport { EditIcon, TrashIcon } from '@/components/shared/utils/Icons';")
        if "import { EditIcon, TrashIcon }" not in content:
            # fallback if StarRating is not found
            content = content.replace("import { useState } from 'react';", "import { useState } from 'react';\nimport { EditIcon, TrashIcon } from '@/components/shared/utils/Icons';")

    old_edit_svg = '<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>'
    new_edit_svg = '<EditIcon className="w-5 h-5" />'

    old_trash_svg = '<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>'
    new_trash_svg = '<TrashIcon className="w-5 h-5" />'

    content = content.replace(old_edit_svg, new_edit_svg)
    content = content.replace(old_trash_svg, new_trash_svg)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_icons(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\EpisodeDetailView.tsx')
update_icons(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\SeriesReviewTab.tsx')

