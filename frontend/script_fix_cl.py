import codecs

with codecs.open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\data\changelogData.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
is_first = True
for i, line in enumerate(lines):
    if "'Risolta la sparizione delle citazioni durante il ricaricamento degli episodi, integrandole nella query DB globale.'," in line:
        if is_first:
            is_first = False
            # This is actually the first occurrence that got replaced everywhere.
            # Wait, the very first occurrence was correctly updated via python earlier with "Risolta la sparizione delle citazioni e dei rating..."
            pass # we skip this line entirely for older entries
        else:
            # remove it from older entries
            pass
    elif "'Risolta la sparizione delle citazioni e dei rating durante il ricaricamento degli episodi, integrandole nella query DB globale.'," in line:
        new_lines.append(line)
        is_first = False
    else:
        new_lines.append(line)

with codecs.open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\data\changelogData.ts', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
