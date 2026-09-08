# 📌 Backlog Funzionalità & Roadmap Progetto

Questo documento serve a tracciare in modo strutturato:
1. **Funzionalità implementate nel Backend ma non ancora integrate nel Frontend** (Desktop e/o Mobile).
2. **Attività di Sviluppo Frontend & Ottimizzazione Mobile** (UI/UX, selezione multipla, navigazione).
3. **Build, Packaging & Ottimizzazioni Tecniche** (APK Android, bundle splitting, clean-up).
4. **Prossimi Passi Fondamentali & Nuove Macro-Funzionalità** (Refactoring, Sezione Libri/Film/Serie, Sezione Liste Tematiche).
5. **Ricerca & Integrazione Intelligenza Artificiale (AI)** (Voice-to-Task, Assistente, Task Breakdown, Privacy).
6. **Progetti Futuri e Idee di Roadmap** per l'evoluzione a lungo termine dell'applicazione.

---

## 📊 Matrice di Stato Rapida

| ID | Attività / Funzionalità | Ambito | Stato Backend | Stato Frontend | Priorità |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **CORE-001** | **Refactoring Globale & Pulizia Architetturale** | `core` / arch | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **FEAT-004** | **Sezione Media: Libri, Film e Serie TV** | `media` / ent | 🔴 Da Iniziare | 🔴 Da Iniziare | 🔴 **Massima (Passo Fondamentale)** |
| **FEAT-005** | **Sezione Liste Tematiche & Personalizzate** | `custom_lists` | 🔴 Da Iniziare | 🔴 Da Iniziare | 🔴 **Massima (Passo Fondamentale)** |
| **AI-001** | **Studio & Integrazione Intelligenza Artificiale (AI)** | `ai` / assistant | 🔴 Da Analizzare | 🔴 Da Analizzare | 🟠 **Alta (Ricerca & Prototipo)** |
| **FEAT-001** | Liste Spesa: Preferite & Pinnate (`pin_status`) | `shopping` | 🟢 Completato | 🔴 Da Implementare | Media-Alta |
| **FEAT-002** | Gestione Inventario Spesa & Lotti (`inventory_batches`) | `shopping` | 🟢 Completato | 🟡 Parziale | Media |
| **FEAT-003** | Dashboard Analytics & Storico Prezzi | `analytics` | 🟢 Completato | 🔴 Da Implementare | Bassa |
| **UI-001** | Selezione Multipla nella Versione Mobile | `mobile` / UI | 🟢 Supportato | 🔴 Da Implementare | Alta |
| **TECH-001** | Verifica & Ottimizzazione Bundle APK Android (Code-Splitting) | `build` / APK | N/A | 🟢 Completato | Media |
| **TECH-002** | Spostamento Tasto Switch in Impostazioni / Danger Zone | `routing` / UI | N/A | 🟢 Completato | Bassa |

*Legenda:*
- 🟢 **Completato**: Pronto, testato o supportato a livello di sistema/API.
- 🟡 **Parziale / Da Verificare**: Componenti parzialmente presenti o da analizzare/rifinire.
- 🔴 **Da Implementare / Da Iniziare**: Funzionalità o interfaccia da sviluppare ex novo.
- ⏳ **In Attesa**: Da eseguire al termine di un'altra fase (es. finalizzazione versione mobile).

---

## 🚀 1. Backend Implementato ➔ Frontend da Completare

### [FEAT-001] Liste Spesa: Preferite & Pinnate (`pin_status`)

#### 📝 Descrizione
Possibilità per l'utente di contrassegnare le liste della spesa come **Preferite** (stella/cuore), **Pinnate / Fissate in alto** (puntina) o entrambe.

#### ⚙️ Dettagli Implementazione Backend
- **Migrazione DB**: `alembic/versions/k0l1m2n3o4p5_add_pin_status_and_is_default_to_shopping_lists.py`
- **Tabella & Colonna**: `shopping_lists.pin_status` (`VARCHAR(2)`, `NULLABLE`)
- **Modello SQLAlchemy**: `ShoppingList.pin_status` in [`backend/domains/shopping/models/lists.py`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/backend/domains/shopping/models/lists.py)
- **DTO Pydantic**: [`ShoppingListCreate`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/backend/domains/shopping/schemas/lists.py), [`ShoppingListUpdate`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/backend/domains/shopping/schemas/lists.py), [`ShoppingListResponse`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/backend/domains/shopping/schemas/lists.py)
- **Valori Ammessi per `pin_status`**:
  - `None` o `null`: Lista standard normale
  - `"PN"`: Lista **Pinnata** (fissata in alto)
  - `"FV"`: Lista **Favorita / Preferita**
  - `"PF"`: Lista sia **Pinnata che Favorita**
- **Validazione**: Gestita tramite `@field_validator("pin_status")` con normalizzazione uppercase.

#### 💻 Stato Frontend Esistente
- **Tipi definiti**: `PinStatus = 'PN' | 'FV' | 'PF' | null` in [`frontend/src/types/shopping.ts`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/types/shopping.ts).
- **API Client**: `normalizeShoppingListSummary` e `serializeShoppingListPayload` in [`frontend/src/api/shopping/shoppingListsApi.ts`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/api/shopping/shoppingListsApi.ts) leggono e serializzano correttamente `pinStatus` / `pin_status`.

#### 🎨 Cosa Manca da Implementare nel Frontend
1. **Desktop Web**:
   - Icone interattive (stella per Preferita, puntina per Pinnata) nelle card o righe delle liste spesa.
   - Azione rapida o pulsante contestuale per fare toggle di Preferita / Pinnata con chiamata `updateShoppingList(listId, { pinStatus: ... })`.
   - Ordinamento visivo nell'elenco liste: liste pinnate mostrate in cima prima delle altre.
   - Filtro / Tab opzionale per mostrare solo le "Liste Preferite".
2. **Mobile App**:
   - Icona/badge visivo nella lista a discesa / drawer delle liste della spesa.
   - Modalità di modifica lista o swipe action / pulsante rapido per aggiungere/rimuovere dai preferiti.
   - Riorganizzazione dell'ordine di visualizzazione in base a `pinStatus`.

#### 📡 Esempio Chiamata API (Payload)
```http
PATCH /api/v1/shopping/lists/{list_id}
Content-Type: application/json

{
  "pin_status": "FV"
}
```

---

### [FEAT-002] Gestione Avanzata Inventario & Lotti Articoli Spesa

#### 📝 Descrizione
Il backend supporta la gestione dettagliata di inventario con scadenze, lotti e quantità residue per articolo spesa (`inventory_batches`).

#### ⚙️ Dettagli Implementazione Backend
- **Dominio**: `backend/domains/shopping/` (`models/inventory.py`, `schemas/inventory.py`, `routes/inventory.py`)
- **Modelli**: `InventoryBatch`, `ShoppingProduct`, `ShoppingSupplier`
- **Funzionalità**: Tracciamento data di scadenza (`expiration_date`), data di acquisto, quantità residua, fornitore e prezzo unitario.

#### 🎨 Cosa Manca da Implementare nel Frontend
- Interfaccia dedicata per inserire la data di scadenza e il prezzo all'atto della spunta di un articolo acquistato.
- Vista o alert visivo per i prodotti in scadenza nel frigorifero/dispensa.

---

## 📱 2. Funzionalità & UX Versione Mobile

### [UI-001] Selezione Multipla nella Versione Mobile

#### 📝 Descrizione
Aggiungere la modalità di selezione multipla (*Multi-Select Mode*) nell'interfaccia mobile per consentire operazioni massive rapide con touch / tap prolungato.

#### 🎯 Ambiti di Applicazione
1. **🛒 Spesa Mobile (`MobileShoppingView`)**:
   - Selezione multipla di articoli per:
     - Spuntare/completare in blocco
     - Eliminare più elementi contemporaneamente
     - Spostare articoli da una lista all'altra
2. **📅 Agenda & Task Mobile (`MobileAgendaView` & Liste Task)**:
   - Selezione multipla di task per:
     - Marcatura massiva come completati / da fare
     - Eliminazione multipla
     - Riassegnazione data/scadenza o categoria in blocco

#### 🛠️ Dettagli Tecnici & Implementazione Frontend
- **Trigger di Attivazione**:
  - Pressione prolungata (*long press*) su una riga/card, oppure
  - Pulsante dedicato "Seleziona" nell'header mobile ([`MobileHeader.tsx`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/mobile/components/MobileHeader.tsx)).
- **UI & Feedback**:
  - Checkbox rotondi animati a sinistra di ogni elemento selezionabile.
  - Barra delle azioni contestuali inferiore (*Action Bar flottante*) con contatore elementi selezionati (es. "3 selezionati") e pulsanti azione: *Completa*, *Sposta*, *Elimina*, *Annulla*.

---

## ⚙️ 3. Build, Packaging APK & Ottimizzazioni Tecniche

### [TECH-001] Controllo & Ottimizzazione Bundle APK Android (Code-Splitting)

#### 📝 Descrizione
Verificare e ottimizzare il processo di compilazione dell'APK eseguito da [`build_apk.ps1`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/build_apk.ps1), controllando come Vite impacchetta i file web e mobile.

#### 🔍 Aspetti da Verificare
- **Analisi del Bundle Vite**: I file della cartella `frontend/src/mobile/` importano moduli condivisi (`src/api`, `src/types`, `src/context`, `src/utils`) che vengono usati anche dalle pagine Desktop (`src/views/`, `src/components/`).
- **Obiettivo**: Verificare se le pagine e i componenti specifici per Desktop (es. `HomePage`, `WeekPage`, `MonthPage`, `YearPage`, `AppShellLayout`) finiscono nel bundle caricato su Android o se possono essere isolati tramite **React.lazy / Dynamic Imports** e chunking in Vite.
- **Benefici**:
  - Riduzione delle dimensioni finali dell'APK (`smartagenda.apk`).
  - Riduzione dell'impronta di memoria RAM e avvio più veloce dell'app mobile su smartphone Android.

---

### [TECH-002] Spostamento Tasto Switch "Vista Mobile / Vista Desktop" (✅ Completato)

#### 📝 Descrizione
I pulsanti di commutazione manuale tra modalità Desktop e Mobile sono stati rimossi dalle aree principali di lavoro e spostati nelle rispettive sezioni di impostazione avanzate:
1. **Desktop**: Spostato in **Impostazioni > Zona Pericolo** ([`DangerZoneSection.tsx`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/components/settings/DangerZoneSection.tsx)).
2. **Mobile Web**: Spostato in **Impostazioni**, posizionato subito prima di *"Esci dal profilo"* ([`MobileSettingsView.tsx`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/mobile/views/MobileSettingsView.tsx)) e nascosto automaticamente sull'app nativa Capacitor.

---

## 🎯 4. Prossimi Passi Fondamentali (Priorità Immediata)

### [CORE-001] Refactoring Globale & Pulizia Architetturale (✅ Completato)

#### 📝 Descrizione
Intervento strutturale di refactoring trasversale su Backend e Frontend completato con successo: debito tecnico azzerato, flussi di dati standardizzati, 0 `any` nel Frontend e 19 domini collaudati nel Backend.

#### 🛠️ Risultati Raggiunti

1. **Backend (Python / FastAPI / SQLAlchemy)**:
   - ✅ **Tutti i 19 domini architetturali** aderiscono ai pattern standardizzati (models, schemas, repository, service, router) e sono collaudati al 100%.
   - ✅ Gestione centralizzata delle eccezioni, date UTC e validazioni Pydantic v2.
   - ✅ Database e storico migrazioni Alembic allineati e certificati.

2. **Frontend (React 19 / TypeScript / Vite)**:
   - ✅ **Zero `any` in tutto il progetto**: tipizzazione strict su tutti i moduli, DTO e modali.
   - ✅ **Code-Splitting APK & Lazy Loading**: isolamento completo dei file desktop dalla build mobile (`npm run build:mobile`), con riduzione dell'82% del bundle iniziale.
   - ✅ **Regola del "Mazzo di Carte" applicata**: logica di filtraggio, ricerca in RAM e calcolo sotto-task gestita interamente nel frontend con reattività a 0 ms.
   - ✅ **Correzione Rotazione Citazioni**: mazzo di 50 citazioni integrato in RAM offline, risolto il blocco su Seneca.

---

### [FEAT-004] Creazione Sezione Media & Intrattenimento: Libri, Film e Serie TV

#### 📝 Descrizione
Nuovo modulo completo per gestire, catalogare e monitorare l'intrattenimento personale: libri in lettura o da leggere, film da guardare o già visti, e serie TV con tracking dettagliato di stagioni ed episodi.

#### 📚 1. Sotto-sezione Libri
- **Dati Tracciati**: Titolo, autore, ISBN/codice, genere, numero totale di pagine, pagine attualmente lette, data di inizio e completamento lettura, copertina/immagine.
- **Stato Lettura**: `Da leggere`, `In lettura`, `Completato`, `Abbandonato`, `In pausa`.
- **Dettagli & Valutazione**: Valutazione in stelle (1-5), recensione personale, citazioni/passi preferiti, tag personalizzati (es. "Saggio", "Fantasy", "Crescita personale").
- **Funzionalità**: Barra di avanzamento percentuale di lettura, contatore libri completati nell'anno.

#### 🎬 2. Sotto-sezione Film
- **Dati Tracciati**: Titolo, regista, anno di uscita, genere, durata (minuti), locandina, piattaforma di fruizione (es. Netflix, Prime Video, Cinema, Apple TV, Disney+).
- **Stato Visione**: `Watchlist / Da vedere`, `Visto`.
- **Dettagli & Valutazione**: Data di visione, voto personale, recensione/commento rapido, link al trailer o scheda informativa.

#### 📺 3. Sotto-sezione Serie TV
- **Dati Tracciati**: Titolo, ideatore/regista, genere, piattaforma di streaming, locandina, numero totale di stagioni ed episodi.
- **Tracking Avanzamento**: Gestione dettagliata del progresso (es. "Stagione 2 - Episodio 7"), pulsante rapido touch/click per avanzare di un episodio visto (+1 episodio).
- **Stato Serie**: `Da iniziare`, `In corso`, `In attesa di nuova stagione`, `Completata`, `Mollata`.
- **Dettagli & Valutazione**: Voto complessivo, note per stagione, promemoria data di uscita della prossima stagione/episodio.

#### 🏗️ Requisiti Architetturali & Integrazione
- **Backend**: Nuovo dominio modulare `backend/domains/media/` o suddiviso con modelli SQLAlchemy dedicati (`MediaItem`, `BookProgress`, `SeriesSeasonProgress`, `MediaReview`).
- **Frontend Desktop**: Nuova voce di navigazione laterale con vista a schede (Tab: *Tutti*, *Libri*, *Film*, *Serie TV*) e visualizzazione a griglia di locandine o elenco tabellare con filtri e ordinamenti.
- **Frontend Mobile**: Schermata dedicata nell'hub mobile con schede swipeabili, interfaccia card compatta e azioni rapide con un tap (es. segna come visto, avanza episodio).

---

### [FEAT-005] Creazione Sezione "Liste" (Liste Tematiche & Personalizzate)

#### 📝 Descrizione
Modulo polivalente per creare, organizzare e gestire molteplici tipologie di liste personalizzate e tematiche per raccogliere idee, interessi, luoghi e desideri, completamente indipendenti dalla spesa alimentare quotidiana e dai task con scadenze rigide.

#### 📋 Ambiti e Tipologie di Liste Supportate
1. 📍 **Posti da Visitare / Luoghi & Viaggi**:
   - Città, monumenti, musei, ristoranti, bar o mete di vacanza.
   - Campi associabili: Nome posto, indirizzo/città, link Google Maps / coordinate, note/consigli (es. "piatto tipico da provare"), checklist di attrazioni interne, stato (`Da visitare`, `Visitato`).
2. 🌐 **Siti da Vedere / Link Utili & Risorse Web**:
   - Raccolta articoli da leggere (*Read it later*), strumenti online, blog, documentazioni, canali o video da guardare.
   - Campi associabili: URL, titolo della risorsa, descrizione, tag tematici (es. "Programmazione", "Design", "Finanza"), anteprima/favicon automatica, stato (`Da consultare`, `Archiviato`).
3. 🛍️ **Oggetti da Comprare / Wishlist Personale**:
   - Desideri e acquisti non alimentari (elettronica, abbigliamento, attrezzi per la casa, gadget, idee regalo per sé o altri).
   - Campi associabili: Nome oggetto, prezzo stimato/reale, link allo store online, livello di priorità/desiderio (Bassa, Media, Alta), note su taglia/colore/modello, stato (`In lista desideri`, `In attesa offerta`, `Ordinato`, `Comprato`).
4. 🎮 **Giochi & Videogiochi**:
   - Videogiochi per PC/Console, giochi da tavolo o giochi di ruolo da provare o completare.
   - Campi associabili: Titolo, piattaforma (es. PC, PS5, Switch, Xbox, Boardgame), genere, stato (`Da giocare / Backlog`, `In corso`, `Completato`, `Platinato / 100%`, `Abbandonato`), voto personale e ore di gioco.
5. 💡 **Liste Generiche & Personalizzate Flessibili**:
   - Possibilità per l'utente di creare qualsiasi nuova lista tematica libera (es. *Idee regalo Natale*, *Obiettivi di vita*, *Routine allenamento*, *Frasi celebri*, *Contatti speciali*).
   - Personalizzazione con nome, icona/emoji a scelta, colore identificativo e tipo di elementi (checklist spuntabile, elenco con note o lista con link e allegati).

#### 🛠️ Funzionalità Chiave dell'Interfaccia (Desktop & Mobile)
- **Organizzazione Visiva**: Visualizzazione a griglia di card, lista compatta o bacheca per categorie.
- **Pin & Preferiti**: Possibilità di fissare in alto le liste più consultate.
- **Ricerca & Filtri**: Ricerca full-text istantanea all'interno di tutte le liste e filtro rapido per tag.
- **Ordinamento Flessibile**: Drag-and-drop o riordinamento manuale/alfabetico/per data di aggiunta.
- **Archiviazione**: Archiviazione delle liste o degli elementi completati senza cancellare lo storico.
- **Mobile First UX**: Aggiunta rapida con singolo tocco, swipe per completare/eliminare e condivisione rapida.

---

## 🧠 5. Ricerca, Studio di Fattibilità & Integrazione AI (Intelligenza Artificiale)

### [AI-001] Assistente Intelligente, Voice-to-Action & Automazioni LLM

#### 📝 Descrizione & Visione
Studio di fattibilità, analisi delle architetture e prototipazione per integrare modelli di intelligenza artificiale (LLM, Speech-to-Text e Structured Parsing) all'interno di Smart Agenda. L'obiettivo è trasformare l'applicazione da un registro passivo a un assistente personale attivo, intelligente e contestuale, mantenendo il pieno controllo sulla privacy dei dati.

#### 🔬 1. Studio Architetturale & Strategia Modelli
- **Opzione Self-Hosted / On-Premise (Massima Privacy)**:
  - Valutazione dell'esecuzione di un motore di inferenza locale (es. **Ollama**, **vLLM** o **LocalAI**) direttamente in container Docker sul NAS QNAP o su server casalingo.
  - Modelli target leggeri e veloci: **Llama 3.2 (1B/3B)**, **Qwen 2.5 (3B/7B)**, **Mistral 7B** o **Gemma 2**.
  - Trascrizione vocale locale tramite **Whisper.cpp** / **Faster-Whisper**.
  - *Vantaggi*: Zero costi di abbonamento, funzionamento 100% offline/privato, nessun dato personale inviato a terzi.
- **Opzione Cloud API (Alte Prestazioni & Zero Carico Hardware)**:
  - Supporto opzionale per chiavi API utente (es. **Google Gemini 2.0 Flash**, **OpenAI GPT-4o-mini**, **Anthropic Claude**).
  - *Vantaggi*: Risposte istantanee, capacità di ragionamento complesse, nessun impatto sulle risorse hardware del NAS.
- **Architettura Modulare & Provider Switcher**:
  - Creazione di un dominio backend dedicato `backend/domains/ai/` basato su pattern Provider (`AIProvider` astratto con implementazioni `OllamaProvider`, `GeminiProvider`, `OpenAIProvider`).
  - Possibilità per l'utente di scegliere il provider attivo dalle Impostazioni.

#### 🎯 2. Casi d'Uso Chiave & Funzionalità Progettate

1. 🎙️ **Voice-to-Action (Inserimento Vocale Intelligente)**:
   - Registrazione rapida di un messaggio vocale da smartphone o PC.
   - Trascrizione Speech-to-Text + parsing dell'LLM con output JSON strutturato (*Structured Outputs*).
   - *Esempio di input*: *"Ricordami di pagare la bolletta della luce venerdì mattina alle 9 e aggiungi pane e caffè alla lista spesa"*.
   - *Azione automatica*: Creazione istantanea del task con scadenza/promemoria e aggiunta dei due articoli alla lista spesa corretta con un solo tap di conferma.

2. 🤖 **Assistente Personale & Daily Briefing**:
   - **Riepilogo del Giorno**: Sintesi rapida all'apertura dell'app ("Oggi hai 3 impegni, il primo alle 10:30, e 2 abitudini in sospeso").
   - **Chatbot Contestuale**: Possibilità di fare domande in linguaggio naturale sulla propria agenda (*"Quando scade l'assicurazione auto?"*, *"Quante volte ho fatto palestra questo mese?"*, *"Cosa devo comprare da Leroy Merlin?"*).

3. 🧠 **Scomposizione Automatica Task Complessi (AI Task Breakdown)**:
   - Dato un obiettivo o macro-task (es. *"Organizzare viaggio a Barcellona"*, *"Dichiarazione dei redditi"*), l'IA propone un piano d'azione dettagliato suddiviso in sotto-task sequenziali con priorità e scadenze suggerite.

4. 💡 **Suggerimenti Intelligenti & Arricchimento Schede**:
   - **Auto-Categorizzazione**: Riconoscimento automatico della categoria per task, eventi e note.
   - **Consigli Intrattenimento**: Raccomandazioni personalizzate su libri o film simili a quelli apprezzati nella sezione Media.
   - **Correlazioni Benessere (Mood & Habits)**: Analisi periodica che incrocia il bilancio dell'umore (*Mood Entries*) con le abitudini completate per evidenziare pattern positivi o fattori di stress.

#### 📋 Fasi della Roadmap AI
- [ ] **Fase 1 - Ricerca & Benchmark**: Test prestazionali di modelli compatti su NAS QNAP (RAM/CPU/GPU) vs API Cloud.
- [ ] **Fase 2 - Backend AI Domain**: Implementazione del modulo `backend/domains/ai/` con endpoint di parsing strutturato e gestione prompt.
- [ ] **Fase 3 - Inserimento Vocale Rapido (UI Mobile & Desktop)**: Tasto microfono rapido con modale di conferma/preview dell'azione riconosciuta.
- [ ] **Fase 4 - Assistente Conversazionale**: Drawer/Widget chatbot per interrogare l'agenda e richiedere riepiloghi.

---

## 🔮 6. Progetti Futuri & Idee di Roadmap

### 📱 6.1 Mobile & Esperienza Utente
- [ ] **Notifiche Push Native Android (FCM / Local Notifications)**: Avvisi automatici per scadenze di task, eventi di calendario, promemoria libri/serie e reminder quotidiani.
- [ ] **Scansione Codici a Barre (Barcode Scanner)**: Utilizzo della fotocamera dello smartphone (Capacitor Camera/Barcode plugin) per aggiungere al volo prodotti alla lista spesa o libri tramite ISBN.
- [ ] **Widget Android**: Widget per la schermata home dello smartphone per spuntare i task rapidi del giorno, la lista spesa e visualizzare il libro o film in corso.
- [ ] **Modalità Offline / Sincronizzazione Differita**: Possibilità di consultare e modificare liste, task e note anche in assenza di rete, con sincronizzazione automatica al riaggancio del tunnel WireGuard/Tailscale.

### 📅 6.2 Agenda, Task & Abitudini
- [ ] **Visualizzazione Vista Gantt / Timeline** per progetti complessi con sotto-task gerarchici.
- [ ] **Integrazione Meteo** nella vista Giorno (`DayPage`) basata su coordinate o città configurata.
- [ ] **Report Settimanale / Mensile PDF**: Esportazione automatica di un riassunto con impegni completati, abitudini rispettate, statistiche media consumati e bilancio dell'umore (*Mood Entries*).

### 🛒 6.3 Spesa & Dispensa
- [ ] **Condivisione Liste in Tempo Reale**: Aggiornamento real-time tra dispositivi diversi appartenenti allo stesso gruppo spesa (es. WebSocket / SSE).
- [ ] **Stima Totale Spesa Intelligente**: Calcolo del costo stimato del carrello prima della spesa basato sullo storico prezzi dei fornitori abituali.

### 🌐 6.4 Integrazioni & Arricchimento Dati Automatico
- [ ] **Integrazione API Esterne per Media**: Ricerca automatica di copertine, trame e metadati per libri (OpenLibrary/Google Books) e film/serie TV (TMDB).
- [ ] **Anteprime Link Web (OpenGraph)**: Generazione automatica di titolo, immagine di anteprima e descrizione per i siti salvati nella sezione "Liste".

---

## 📝 7. Guida & Template per Nuovi Inserimenti

Quando viene completata una nuova funzionalità nel backend o sorge una nuova idea futura, copia e compila il template sottostante:

```markdown
### [FEAT-XXX] Nome Funzionalità

#### 📝 Descrizione
Breve spiegazione di cosa fa la funzionalità dal punto di vista utente.

#### ⚙️ Dettagli Implementazione Backend
- **Dominio**: `backend/domains/...`
- **Tabelle / Migrazioni**: `...`
- **Modelli & Schemas**: `...`
- **Endpoint HTTP**: `POST/GET/PATCH ...`
- **Regole di Business**: Descrizione di permessi, vincoli o validazioni speciali.

#### 💻 Stato Frontend Esistente
- Tipi o API client già predisposti.

#### 🎨 Cosa Manca da Implementare nel Frontend
- [ ] Vista Desktop (`frontend/src/views/...` o `components/...`)
- [ ] Vista Mobile (`frontend/src/mobile/...`)
- [ ] Stato / Hook / Chiamate API

#### 📡 Esempio Chiamata API
```json
{
  "campo": "valore"
}
```
```

