# Vita (ex Smart Agenda) - Regole per Agenti AI e Sviluppatori

Questo file definisce le istruzioni e le convenzioni operative obbligatorie per qualsiasi assistente AI o sviluppatore che lavora su questa codebase.

---

## 📌 1. Regola di Versioning, Changelog & Multi-Chat Workflow

Ogni volta che vengono apportate modifiche, nuove funzionalità o bug fix rilevanti:

### A. Controllo dello Stato di Pubblicazione (`published`)
L'assistente deve controllare la prima voce in cima a `CHANGELOG_HISTORY` in `frontend/src/data/changelogData.ts`.
> ⚠️ **Controllo Live su Disco Obbligatorio**: Prima di modificare `package.json` o `changelogData.ts`, l'assistente deve **rileggere TASSATIVAMENTE il file reale su disco** (`view_file`). Non fidarsi MAI della memoria pregressa della conversazione, poiché l'utente potrebbe aver eseguito uno script di build o deploy (`deploy_build_pc.ps1` o `build_apk.ps1`) che ha marcato la versione come pubblicata (`published: true`).

1. **Se `published: false` (Versione ancora in sviluppo / non ancora rilasciata)**:
   - **NON creare un nuovo numero di versione** e **NON modificare `package.json`**.
   - **Unisci/aggiungi** semplicemente i nuovi punti salienti (`highlights`, `features`, `improvements`, `fixes`) all'interno della voce draft esistente in cima a `CHANGELOG_HISTORY`.
   - Questo permette a **più chat o sessioni contemporanee** di accumulare modifiche nella stessa versione senza frammentare i numeri.

2. **Se `published: true` (L'ultima versione è già stata rilasciata/pubblicata)**:
   - Determina l'incremento di versione (`MAJOR.MINOR.PATCH`):
     - **PATCH** (`14.0.X`): Correzioni di bug, fix di layout (UI/UX), piccoli aggiustamenti e refactoring minori invisibili all'utente.
     - **MINOR** (`14.X.0`): Nuove funzionalità aggiunte a *sezioni già esistenti*, nuovi componenti, nuove viste secondarie o aggiunte importanti ma retrocompatibili all'interno di moduli attuali.
     - **MAJOR** (`X.0.0`): **Intere nuove MACRO-SEZIONI o moduli portanti** (es. l'aggiunta del modulo Shopping, della sezione Media/Serie TV, ecc. definiti come "Passo Fondamentale" nel Backlog), grandi riscritture architetturali o breaking changes. Se si introduce un intero nuovo dominio nell'app, è SEMPRE Major.
   - Aggiorna `"version": "X.Y.Z"` in `frontend/package.json`.
   - Inserisci in cima a `CHANGELOG_HISTORY` in `frontend/src/data/changelogData.ts` la nuova voce con `published: false`, data e dettagli:
   ```typescript
   {
     id: 'vX.Y.Z',
     version: 'X.Y.Z',
     date: 'Mese Anno', // es. 'Settembre 2026'
     title: 'Titolo sintetico dell\'aggiornamento',
     isLatest: true,
     published: false, // Diventerà true in automatico al momento di build APK / deploy
     highlights: [
       'Punto saliente 1...',
     ],
     features: [
       'Nuova funzionalità...',
     ],
     improvements: [
       'Miglioramento...',
     ],
     fixes: [
       'Correzione bug...',
     ],
   }
   ```

### B. Verifica Compilazione
- Eseguire sempre `npm run build` dentro `frontend/` per verificare che non ci siano errori TypeScript prima di concludere.

---

## 🚀 2. Finalizzazione e Pubblicazione Automatica
- **Quando si esegue `.\build_all.ps1`, `.\build_apk.ps1` o `.\deploy_build_pc.ps1`**:
  - Gli script rilevano automaticamente se la versione corrente ha `published: false` e la contrassegnano automaticamente come **`published: true`**.
  - `build_all.ps1` unifica in un solo comando la build dei container per il NAS e dell'APK Android, allineando sia `version` sia `apkVersion` in `version.json`.
  - Da quel momento, le successive modifiche in qualsiasi chat apriranno un nuovo ciclo di versione (`published: false`).

Per la guida completa e dettagliata, fare riferimento a [`docs/VERSIONING_GUIDE.md`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/docs/VERSIONING_GUIDE.md).

---

## 🏁 3. Protocollo di Chiusura Sessione (Trigger Parola Chiave "fine")

Quando l'utente scrive **"fine"** (o frasi equivalenti come *"abbiamo finito"*, *"concludi sessione"*, *"chiudi"*), l'assistente AI deve eseguire **automaticamente e senza eccezioni** le seguenti azioni preimpostate:

1. **📋 Sincronizzazione & Aggiornamento Backlog ([`docs/BACKLOG.md`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/docs/BACKLOG.md) e [`docs/BACKLOG_ARCHIVE.md`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/docs/BACKLOG_ARCHIVE.md))**:
   - Controllare le modifiche e le decisioni prese durante la sessione.
   - Segnare come 🟢 **Completato** tutte le voci e gli ID completati nella tabella riassuntiva.
   - **IMPORTANTE**: Spostare le descrizioni estese di tutti i task completati in `docs/BACKLOG_ARCHIVE.md`, mantenendo nel `BACKLOG.md` principale solo i progetti in corso o futuri per preservarne la leggibilità.
   - Inserire o aggiornare eventuali nuove funzionalità, idee o note emerse nella discussione nel `BACKLOG.md`.

2. **📝 Aggiornamento Changelog & Versioning ([`frontend/src/data/changelogData.ts`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/data/changelogData.ts))**:
   - Se ci sono state modifiche al codice o alle funzionalità, applicare la regola di versioning (Sezione 1):
     - Se `published: false`: integrare `highlights`, `features`, `improvements`, `fixes` nella voce bozza in cima. Effettuare un check del changelog per accorpare e riassumere i punti principali se la lista sta diventando troppo lunga o dispersiva.
     - Se `published: true`: incrementare la versione in `package.json` e creare la nuova voce con `published: false`.

3. **🧪 Verifica Compilazione & Type-Check**:
   - Eseguire `npm run build` all'interno di `frontend/` per verificare che non vi siano errori di compilazione TypeScript o problemi di bundling.

4. **📊 Report Finale di Chiusura per l'Utente**:
   - Fornire un riassunto finale conciso che elenca:
     - Le modifiche registrate nel Backlog.
     - Le voci aggiunte al Changelog.
     - L'esito del controllo di compilazione.

---

## 🔔 4. Regola Generale sulle Notifiche
- **Tutte le notifiche generate dal sistema** (es. inviti ai gruppi spesa, alert di sistema, richieste di amicizia) devono essere **sempre considerate permanenti e storicizzate** di default. Non devono autodistruggersi (logica "Burn After Reading" / `EPHEMERAL_MSG`) una volta aperte o lette, a meno che l'utente non lo richieda esplicitamente per uno specifico tipo.
- Fanno eccezione solo i "Messaggi Effimeri" veri e propri, che hanno una logica di autodistruzione immediata (`TTL=0`) predefinita.
- Le notifiche nella sidebar (Notifiche regolari) devono essere sempre mostrate in **ordine cronologico decrescente** (dalla più recente in alto alla più remota in basso).

---

## 🛠️ 5. Regole di Sviluppo: Mock Data & Migrazioni Database
1. **Nessun Dato Mock**: Evitare categoricamente l'utilizzo di dati mock (dati finti codificati nel frontend), in quanto complicano l'integrazione e il mantenimento. Utilizzare piuttosto dati/stati vuoti (es. liste vuote, stati di caricamento temporanei) o procedere il prima possibile con il collegamento reale alle API del backend.
2. **Migrazioni Alembic, Idempotenza & Doppio Ambiente (Test vs NAS Produzione)**:
   - **Idempotenza Assoluta e Sicurezza DDL**: Le migrazioni Alembic non devono MAI fallire su database che contengono già strutture parziali o indici preesistenti:
     - Su ogni `op.drop_index(...)` o `op.drop_table(...)`, specificare TASSATIVAMENTE `if_exists=True`.
     - Nelle istruzioni SQL o create dirette, utilizzare sempre clausole difensive (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).
     - Ispezionare SEMPRE il file generato da `--autogenerate` prima di confermarlo: rimuovere categoricamente qualsiasi `drop_table` o `drop_column` accidentale generato da modelli non ancora registrati in memoria nei metadati.
   - **Verifica Multi-Ambiente (Test e Produzione NAS)**:
     - Usare `alembic-test.bat` per generare e testare le migrazioni sull'ambiente di test (`test-smart`).
     - Verificare e applicare l'allineamento sul database reale di produzione del NAS (`family-smart` su `192.168.11.20`) eseguendo `alembic-prod.bat upgrade head` per garantire che il backend in produzione non fallisca con errori 500 (colonne mancanti).
3. **Allineamento Rotte Nginx & Reverse Proxy**: Ogni nuova rotta API creata nel backend (o in `vite.config.ts`) deve essere TASSATIVAMENTE registrata anche nel reverse proxy di `frontend/nginx.conf`. Lo script `frontend/scripts/checkSync.js` (eseguito automaticamente da `npm run build` e `deploy_build_pc.ps1`) bloccherà il processo segnalando immediatamente qualsiasi rotta mancante.

---

## 🏛️ 6. Regole Architetturali d'Oro (Frontend-First & Gestione Dati)

1. **La Regola del "Mazzo di Carte" (Tutto nel Frontend)**:
   - I dati scaricati dal server sono da considerare come un "mazzo di carte" caricato nella memoria del client (RAM) all'avvio.
   - **Il Backend è solo un archivio passivo**: FastAPI/Python gestisce solo operazioni CRUD (Create, Read, Update, Delete), permessi e controlli di sicurezza. Può applicare solo filtri macro iniziali (es. dati degli ultimi N giorni o per utente).
   - **Tutta la logica interattiva vive in React**: Filtri, cambi di ordinamento, visibilità categorie, ricerche testuali, aggregazioni e gerarchie di sottotask avvengono **esclusivamente nel frontend**. Non si interroga continuamente il server per rimescolare o filtrare dati già presenti.

2. **Gestione "Peso Piuma" per gli Allegati**:
   - Per file, immagini o documenti si utilizzano **esclusivamente URL/link testuali**.
   - Non salvare MAI file fisici, base64 o blob all'interno del database relazionale e non caricarli massivamente nella memoria del dispositivo.

3. **Memoria Strategica ("Caldo" vs "Freddo")**:
   - I dati "caldi" (di uso quotidiano e immediato) sono sempre pronti in RAM.
   - Per i dati "freddi" (storico, mesi/anni passati, archivi), utilizzare il caricamento su richiesta (**Lazy Loading**), scaricandoli dal server solo se e quando l'utente li richiede esplicitamente.

4. **Regola d'Oro Mobile UI: Modali Centrali per Selettori e Menu a Discesa**:
   - Su smartphone / viste mobile, **NON utilizzare MAI menu a tendina aperti inline o popover a discesa libera** (che provocano tagli, clipping da overflow, problemi di z-index o difficoltà di tocco).
   - Utilizzare **esclusivamente un piccolo modale centrato a finestra con backdrop oscurato** (`SelectModalDialog` o `MobileModalSelect`):
     - Finestra centrata e contenuta (`max-w-sm`), con titolo esplicito della selezione e pulsante `X` per chiudere.
     - Elenco opzioni verticale touch-friendly (`py-3`), con evidenziazione dell'opzione attiva in blu e spunta (`CheckCircleIcon`).
     - Al tocco di un'opzione, la selezione si aggiorna istantaneamente e il modale si chiude in automatico.
     - Applicare questo standard a tutti i selettori di liste personali, categorie, generi, network, stati di produzione o criteri di ordinamento nelle pagine mobile.

5. **Regola d'Oro Campi Decimali: Accettazione Universale di Virgola (`,`) e Punto (`.`) sia Web che Mobile**:
   - In tutti i campi di input dell'applicazione che accettano o elaborano numeri con decimali (prezzi, importi, quantità, pesature, misure, percentuali, ecc.), **NON utilizzare mai `<input type="number">` standard**.
   - **Motivo**: L'elemento HTML nativo `<input type="number">` delega il parsing alla lingua del browser. Nei browser impostati con locale italiano (`it-IT`), l'evento di battitura del punto (`.`) — presente tipicamente sul tastierino numerico/numpad o sulla tastiera fisica — viene intercettato e scartato a monte dal browser prima ancora di poter raggiungere React, bloccando l'utente.
   - **Standard Obbligatorio di Implementazione**:
     - Utilizzare **sempre** `type="text"` combinato con l'attributo `inputMode="decimal"` (che su smartphone apre in automatico il tastierino numerico con separatore decimale).
     - Gestire la digitazione e il parsing importando gli helper centralizzati da [`frontend/src/utils/decimalUtils.ts`](file:///c:/Users/user/Documents/PYTHON/VxAme14/frontend/src/utils/decimalUtils.ts):
       - `sanitizeDecimalString(val)`: consente solo cifre, virgola e punto, ripulendo caratteri non validi e prevenendo doppi separatori consecutivi (es. `12..5` o `12,,5`) durante la digitazione.
       - `parseDecimalValue(val, defaultValue)`: converte in modo sicuro e trasparente qualsiasi stringa contenente sia `,` che `.` in un float JavaScript standard (`number`) per i calcoli in RAM o per l'invio via API al database.
     - Nei componenti con editing in linea (es. Data Grid), mantenere uno stato locale di stringa per consentire all'utente di digitare senza interruzioni anche cifre intermedie (es. `1,` o `1.`) senza che l'input venga cancellato o riformattato prematuramente prima che la digitazione sia conclusa.

6. **Regola d'Oro dell'Aggiornamento Ottimistico (0ms Latency & Optimistic UI)**:
   - Per tutte le interazioni dell'utente ad alta frequenza o risposta immediata (es. spunte completato/visto di episodi o task, contatori rewatch, cambio ordinamento, citazioni, note rapide, rating, pin/unpin):
     - **Aggiornamento Istantaneo in RAM (0ms)**: Al tocco/click, lo stato locale visivo e la cache di React Query (`onMutate`) DEVONO aggiornarsi istantaneamente prima ancora che la richiesta di rete al server venga completata. L'interfaccia non deve MAI attendere il ciclo HTTP per mostrare il cambio di stato.
     - **Rollback Sicuro in caso di Errore**: Nel callback `onError`, ripristinare sempre lo snapshot precedente salvato prima della mutazione (`context.previousData`) e mostrare un toast discreto e non invasivo all'utente.
     - **Riconciliazione Silenziosa**: Nel callback `onSettled`, invalidare le query interessate (`invalidateQueries`) per allineare silenziosamente i dati con la verità del server/NAS.
     - **Nessun Blocco Modale Nativo**: Vietato l'uso di `alert()` o `confirm()` nativi del browser durante le azioni rapide: utilizzare sempre toast leggeri auto-scomparenti o feedback visivo integrato.

---

## 📐 7. Standard di Qualità del Codice & TypeScript Rigido

1. **Eliminazione Assoluta di `any` (TypeScript Strict)**:
   - È severamente vietato l'uso del tipo `any`. Nessuna scorciatoia di comodo.
   - Se si incontra un dato non tipizzato, analizzarne la struttura e ricostruire la sua identità esatta creando `interface` o `type` dedicati, anche se annidati o complessi.
   - Spiegare sempre sinteticamente quali tipi sono stati definiti e perché.

2. **Principio DRY (Don't Repeat Yourself) & Estrazione**:
   - Individuare duplicazioni logiche, funzionali o visive.
   - Estrarre logiche condivise in funzioni helper (`utils/`), **Custom Hooks** di React o componenti UI atomici riutilizzabili.
   - Mantenere un'unica fonte di verità per ogni meccanismo.

3. **Separazione Logica / UI, File Snelli & Monitoraggio Dimensioni**:
   - Evitare file monolitici o con troppe responsabilità. Se un componente o file supera la dimensione ottimale o fa troppe cose, spezzarlo.
   - Separare nettamente la **logica applicativa e stato** (in custom hook dedicati) dalla **logica di visualizzazione** (componente visivo/JSX puro).
   - **Avviso e Riduzione Automatica File Troppo Grandi**: Se durante la programmazione viene creato o modificato un file che risulta eccessivamente grande (indicativamente oltre 300-400 righe o con troppe logiche accorpate):
     - L'assistente deve **segnalare immediatamente e in modo esplicito il problema all'utente nel messaggio successivo**.
     - L'assistente deve **intervenire per ridurne la dimensione**, spezzando il file ed estraendo sotto-componenti visivi, custom hooks per lo stato, helper in `utils/` o definizioni di tipi dedicati.

4. **Armonia, Coerenza e Nomenclatura**:
   - Mantenere nomenclature coerenti in tutto il progetto (italiano o convenzioni già consolidate).
   - Rispettare la struttura logica e modulare delle cartelle del progetto.

---

## 💬 8. Stile di Comunicazione & Spiegazioni con l'Utente

1. **Spiegazioni Chiare, Semplici e Passo-Passo**:
   - Spiegare le modifiche e le scelte architetturali in modo chiaro, amichevole e comprensibile anche a chi non è un programmatore professionista.
   - Evitare tecnicismi astratti o gergo informatico superfluo quando si illustrano le novità o i passaggi svolti.
2. **Codice Sempre Completo e Pronto**:
   - Fornire soluzioni complete, concrete e rifinite, evitando mezze implementazioni o frammenti con segnaposto non funzionanti.

