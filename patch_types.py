import re
with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\types\trackers.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("watched_at: string;", "watched_at: string;\n  notes?: string;\n  review_visibility?: string;")
content = content.replace("poster_path?: string | null;", "poster_path?: string | null;\n  tmdb_id?: number;\n  title?: string;")
content = content.replace("updated_at?: string | null;", "updated_at?: string | null;\n  notes?: string;\n  review_visibility?: string;")

with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\types\trackers.ts", "w", encoding="utf-8") as f:
    f.write(content)
