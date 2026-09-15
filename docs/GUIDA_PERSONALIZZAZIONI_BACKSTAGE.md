# 🎨 Guida alle Personalizzazioni "Backstage" (Asset, Timbri, Seed & Config)

Questo documento spiega in modo chiaro e pratico come gestire, aggiungere o modificare gli elementi statici, i timbri grafici, le citazioni, le categorie di default e le configurazioni di sistema che compongono il "dietro le quinte" (backstage) di **Smart Agenda**.

---

## 📑 Indice dei Contenuti

1. [🎯 1. Timbri del Bingo Annuale (`stamps`)](#1-timbri-del-bingo-annuale-stamps)
   - [A. Dove si trovano le immagini](#a-dove-si-trovano-le-immagini)
   - [B. Come aggiungere un nuovo timbro standard](#b-come-aggiungere-un-nuovo-timbro-standard)
   - [C. Come configurare timbri speciali (Easter Egg) o percentuali](#c-come-configurare-timbri-speciali-easter-egg-o-percentuali)
2. [📜 2. Citazioni & Aforismi Giornalieri (`quotes.csv`)](#2-citazioni--aforismi-giornalieri-quotescsv)
3. [🎭 3. Categorie Utente & Mood Predefiniti (`user_categories.csv`)](#3-categorie-utente--mood-predefiniti-user_categoriescsv)
4. [⚙️ 4. Codici di Sistema & Unità di Misura (`config_codes.csv` e `config.csv`)](#4-codici-di-sistema--unit%C3%A0-di-misura-config_codescsv-e-configcsv)
5. [🖼️ 5. Icone SVG & Favicon](#5-icone-svg--favicon)
6. [🚀 6. Come Applicare e Propagare le Modifiche (Web & APK Android)](#6-come-applicare-e-propagare-le-modifiche-web--apk-android)

---

## 1. 🎯 Timbri del Bingo Annuale (`stamps`)

Il modulo **Bingo Annuale** (griglia 5x5 degli obiettivi) appone un timbro grafico quando l'utente segna una casella come completata.

### A. Dove si trovano le immagini
Tutte le immagini dei timbri risiedono nella cartella:
📂 [`frontend/public/stamps/`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/public/stamps/)

Attualmente sono presenti:
- `stamp-star.png` (Stella)
- `stamp-flower.png` (Fiore)
- `stamp-fourleaf.png` (Quadrifoglio)
- `stamp-grape.png` (Uva)
- `stamp-ladybug.png` (Coccinella)
- `stamp-clown.png` (Pagliaccio - Easter Egg raro 1%)

> **Specifiche consigliate per le immagini**:
> - **Formato**: PNG con sfondo trasparente.
> - **Dimensioni**: da 256x256 px a 512x512 px (rapporto 1:1, quadrato).
> - **Stile**: Grafica ad alta leggibilità con contorni netti, effetto timbro o sticker.

---

### B. Come aggiungere un nuovo timbro standard

1. **Copia il file immagine**:
   Salva la nuova immagine in [`frontend/public/stamps/`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/public/stamps/) con nome parlante, ad esempio:
   `stamp-rocket.png`

2. **Registra il timbro nel file di configurazione**:
   Apri il file [`frontend/src/config/bingoStamps.ts`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/config/bingoStamps.ts) e aggiungi l'identificativo all'array `STANDARD_STAMPS`:

   ```typescript
   export const STANDARD_STAMPS = [
     'stamp-star',
     'stamp-flower',
     'stamp-fourleaf',
     'stamp-grape',
     'stamp-ladybug',
     'stamp-rocket', // <--- Nuovo timbro aggiunto!
   ] as const;
   ```

3. **Fatto!**  
   Il sistema estrarrà automaticamente anche il nuovo timbro con probabilità equamente suddivisa tra tutti i timbri standard registrati.

---

### C. Come configurare timbri speciali (Easter Egg) o percentuali

All'interno di [`frontend/src/config/bingoStamps.ts`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/config/bingoStamps.ts):

```typescript
export const getRandomStamp = (): string => {
  const rand = Math.random() * 100;
  // 1% di probabilità per l'Easter Egg clown
  if (rand < 1.0) {
    return EASTER_EGG_STAMP;
  }
  // Il restante 99% viene diviso equamente tra i timbri standard
  const standardIndex = Math.floor(Math.random() * STANDARD_STAMPS.length);
  return STANDARD_STAMPS[standardIndex];
};
```

Puoi personalizzare la soglia dell'Easter Egg (es. `rand < 5.0` per portarlo al 5%) o aggiungere ulteriori condizioni speciali.

---

## 2. 📜 Citazioni & Aforismi Giornalieri (`quotes.csv`)

La schermata principale dell'applicazione mostra ogni giorno un aforisma o pensiero motivazionale diverso.

- **File**: [`frontend/public/quotes.csv`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/public/quotes.csv)
- **Formato**: CSV delimitato da punto e virgola (`;`) con intestazione `id;author;text`

### Esempio:
```csv
id;author;text
1;Lucio Anneo Seneca;Non è perché le cose sono difficili che non osiamo, è perché non osiamo che sono difficili.
2;Marco Aurelio;Fai ogni cosa nella vita come se fosse l'ultima.
3;Mark Twain;Il segreto per andare avanti è iniziare.
```

### Come aggiungere una nuova citazione:
1. Apri `quotes.csv`.
2. Aggiungi una nuova riga in fondo incrementando l'`id`:
   ```csv
   53;Albert Camus;Nel bel mezzo dell'inverno ho scoperto che vi era in me un'invincibile estate.
   ```
3. L'algoritmo calcola l'aforisma del giorno in base al giorno dell'anno, ciclando sull'elenco completo.

---

## 3. 🎭 Categorie Utente & Mood Predefiniti (`user_categories.csv`)

Quando viene creato un nuovo account utente, il sistema effettua il bootstrap delle categorie iniziali prendendole da questo file seed:

- **File**: [`backend/seeds/user_categories.csv`](file:///c:/Users/user/Documents/PYTHON/VxAme14/backend/seeds/user_categories.csv) o [`backend/seeds/user_categories.csv`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/backend/seeds/user_categories.csv)
- **Formato**: `id;category_name;colore;genre`

### Significato del campo `genre`:
- **`genre = 3`**: Categorie standard per Task, Calendario ed Eventi (es. *Lavoro, Famiglia, Salute, Studio*).
- **`genre = 4`**: Mood / Stati d'animo per il monitoraggio giornaliero (es. *Gioia, Tristezza, Rabbia, Disgusto, Paura*).

### Esempio:
```csv
id;category_name;colore;genre
1;Lavoro;#5e7aff;3
2;Famiglia;#ffd966;3
3;Salute;#ff7676;3
4;Studio;#93c47d;3
5;Gioia;#ffea00;4
6;Tristezza;#0059ff;4
7;Rabbia;#ff0000;4
8;Disgusto;#59bc01;4
9;Paura;#9000e7;4
```

> 💡 **Nota**: Le categorie aggiunte o modificate in questo CSV avranno effetto per tutti i **nuovi utenti** creati successivamente o nei database rigenerati da zero. Gli utenti esistenti possono creare e modificare categorie direttamente dall'interfaccia.

---

## 4. ⚙️ Codici di Sistema & Unità di Misura (`config_codes.csv` e `config.csv`)

Il sistema usa tabelle di codici tipizzati per unità di misura, stati delle liste spesa, ruoli dei gruppi e costanti applicative.

### A. Unità di Misura e Codici Registro
- **File**: [`backend/seeds/config_codes.csv`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/backend/seeds/config_codes.csv)
- **Campi**: `code_type;code_value;code_name;description;active;sort_order`

Esempi di unità di misura della spesa (`shopping_unit`):
```csv
shopping_unit;kg;KG;Chilogrammi;True;70
shopping_unit;lt;LT;Litri;True;80
shopping_unit;pz;PZ;Pezzi;True;90
shopping_unit;conf;CONF;Confezione;True;10
```

Se desideri aggiungere una nuova unità (es. `barattolo` o `vaschetta`), basta aggiungere una riga al file CSV o inserirla direttamente da interfaccia tramite il **Pannello Amministrazione** (`/admin`).

### B. Configurazioni Globali di Sistema
- **File**: [`backend/seeds/config.csv`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/backend/seeds/config.csv)
- Include parametri come la profondità massima dei sotto-task (`max_subtask_depth`), giorni di lookback per le statistiche dei prezzi, ecc.

---

## 5. 🖼️ 5. Icone SVG & Favicon

- **Icone generali / sprite**: [`frontend/public/icons.svg`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/public/icons.svg)
- **Icona del sito / PWA**: [`frontend/public/favicon.svg`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/public/favicon.svg)

Le icone vettoriali Lucide React utilizzate nei componenti React vengono importate direttamente dai pacchetti `lucide-react`. I file SVG in `public/` servono per asset statici, loghi o icone caricate via HTML `<use href="/icons.svg#id">`.

---

## 6. 🚀 Come Applicare e Propagare le Modifiche (Web & APK Android)

Dopo aver aggiunto nuovi timbri o modificato file in `public/` o `config/`:

### 🌐 Per l'ambiente Web / Desktop (PC & NAS)
1. Esegui la compilazione del frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Oppure esegui lo script di deploy per il PC/NAS:
   ```powershell
   .\deploy_build_pc.ps1
   ```
   Tutti i file in `public/` (inclusi i nuovi timbri in `stamps/`) vengono copiati automaticamente nella cartella di produzione `dist/`.

---

### 📱 Per l'Applicazione Android (APK)
Per far sì che i nuovi timbri o asset siano incorporati dentro l'APK dello smartphone:

1. Esegui semplicemente lo script PowerShell dalla radice del progetto:
   ```powershell
   .\build_apk.ps1
   ```
2. **Cosa fa lo script**:
   - Compila l'interfaccia mobile con Vite.
   - Esegue `npx cap sync android` copiando automaticamente i nuovi file da `public/stamps/` a `android/app/src/main/assets/public/stamps/`.
   - Ricompila l'APK finale e lo salva nella cartella [`apk/`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/apk/) (`apk/smartagenda.apk` e `apk/smartagenda-vX.Y.Z.apk`).
3. Installa il nuovo APK sullo smartphone: i nuovi timbri saranno subito utilizzabili anche offline!
