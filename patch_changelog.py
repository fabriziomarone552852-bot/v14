import re
with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\data\changelogData.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Add to fixes
if "'Risolto bug di visualizzazione delle serie aggiunte (dati non venivano mostrati).'" not in content:
    content = content.replace(
        "fixes: [\n",
        "fixes: [\n      'Risolto bug di visualizzazione delle serie aggiunte (dati non venivano mostrati).',\n"
    )

with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\data\changelogData.ts", "w", encoding="utf-8") as f:
    f.write(content)
