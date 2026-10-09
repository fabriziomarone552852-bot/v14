import os

path = 'c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/data/changelogData.ts'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'features: [' in line:
        lines.insert(i+1, "      'Ricerca Globale TMDB: Implementato motore di ricerca esteso tramite filtri dinamici (Genere, Piattaforme, Anno) dal modale.',\n      'Filtri Rapidi Interattivi (Serie TV): I badge dei generi e delle piattaforme sono ora cliccabili per filtrare istantaneamente la griglia.',\n")
        break

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
