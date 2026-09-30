file_path = r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\data\changelogData.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to insert our improvements and fixes into the first entry (v15.0.0)
import re

improvements_str = """
      'Aggiunto calcolo automatico e sincronizzazione dello stato (In lista / In visione / Completata) per le Serie TV in base agli episodi visti.',
      'Ottimizzato il layout degli avatar degli amici nel modale della serie, ora posizionati in una riga dedicata sopra le liste.',"""

fixes_str = """
      'Aggiunto avatar di default (default_avatar.png) per gli amici senza immagine profilo.',"""

# Find improvements: [
content = re.sub(
    r'(improvements:\s*\[)',
    r'\1' + improvements_str,
    content,
    count=1
)

# Find fixes: [
content = re.sub(
    r'(fixes:\s*\[)',
    r'\1' + fixes_str,
    content,
    count=1
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Changelog updated!")
