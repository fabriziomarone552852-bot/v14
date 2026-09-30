import codecs

with codecs.open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\data\changelogData.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if "'UI Commenti: Indicatori minimalisti inline nelle card per non sprecare spazio verticale.'," in line:
        new_lines.append("      'Migliorato il sistema di recensioni: conversione accurata in stelle 1-5, e inserite azioni rapide di Modifica/Elimina direttamente in testa alla finestra di lettura.',\n")
        new_lines.append("      'Segnalatore visivo (pallino rosso) costante sul bottone delle citazioni per le puntate che ne contengono gi.',\n")
    if "'Risolto definitivamente il problema di visualizzazione degli episodi anche per le serie in anteprima" in line:
        new_lines.append("      'Risolta la sparizione delle citazioni e dei rating durante il ricaricamento degli episodi, integrandole nella query DB globale.',\n")
        new_lines.append("      'Fixato il calcolo del rating medio delle stagioni (ora scalato correttamente a 5 stelle).',\n")

with codecs.open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\data\changelogData.ts', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
