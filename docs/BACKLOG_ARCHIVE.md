# ðŸ—„ï¸� Backlog Archivio (Task Completati)

Questo file contiene i task storici che sono stati completati e rimossi dal `BACKLOG.md` principale per mantenere il documento snello.

---

### [SHOPPING-008] Refactoring Catalogo Prodotti, Tabella Ponte Brand N:N con Note & Compattazione DB (✅ Completato)

#### 📋 Descrizione
Disaccoppiamento del modello catalogo prodotti (shopping_products) per renderlo asettico e privo di duplicazioni (un solo record per tipo prodotto, es. una sola 'farina'). Creazione della tabella ponte molti-a-molti shopping_product_brands tra prodotti e marchi/fornitori con supporto a note e commenti qualitativi persistenti nel tempo (es. 'ottimo', 'da evitare'), con compattazione del database e integrazione UI desktop e mobile.

#### ⚙️ Dettagli Implementazione & Funzionalità Raggiunte
- **Catalogo Canonico Puro (shopping_products)**: Rimosso il campo rand_id e la relazione 1-a-1 diretta con i fornitori; applicato vincolo di unicità UNIQUE su 
ame_normalized (uq_shopping_products_name_normalized).
- **Tabella Ponte N:N (shopping_product_brands)**: Creata con i campi id, product_id (FK CASCADE), rand_id (FK CASCADE), 
otes (TEXT), created_at, updated_at e vincolo UNIQUE (product_id, brand_id).
- **Compattazione & Deduplicazione Automatica DB**: Procedura SQL transazionale eseguita all'avvio (ensure_database_schema_compat) e via migrazione Alembic (
3o4p5q6r7s8) che riassegna le chiavi esterne di liste e lotti/acquisti al record prodotto canonico ed elimina i record duplicati orfani.
- **Repository, Service & API REST**:
  - POST /shopping/products/{product_id}/brands: endpoint per associare o aggiornare le note del brand.
  - DELETE /shopping/products/{product_id}/brands/{brand_id}: endpoint per dissociare il brand.
  - Ricerca, filtri e seeder aggiornati per popolare e utilizzare la tabella ponte.
- **Frontend & UI/UX (Desktop & Mobile)**:
  - **Autocomplete Prodotti**: L'utente visualizza un catalogo pulito senza duplicati.
  - **Form Inserimento / Modifica Articolo** (ShoppingItemModal.tsx e MobileShoppingItemForm.tsx): Box interattivo 💡 Note e marchi già provati che mostra i brand già recensiti con le relative note storiche; cliccando su un badge viene selezionato direttamente quel brand.
  - **Dropdown Brand** (ShoppingBrandAutocomplete.tsx): Mostra il badge *Consigliato* e le note qualitative associate sotto ciascun marchio.

---


### [FEAT-002] Gestione Avanzata Inventario, Prezzi Rapidi & Lotti Spesa (âœ… Completato)

#### ðŸ“� Descrizione
Modulo completo per l'inserimento rapido dei prezzi a catalogo, tracciamento storico prezzi (SEED & utente), modifica ed eliminazione rilevazioni personali e selezione/creazione supermercati.

#### âš™ï¸� Dettagli Implementazione & FunzionalitÃ  Raggiunte
- **Autocomplete Spesa Mobile**: Suggerimenti in tempo reale nella barra di aggiunta rapida della spesa su mobile.
- **Visualizzazione Prezzi SEED**: Rettificata la visibilitÃ  dei prezzi SEED e di catalogo nello storico prezzi dei prodotti per tutti gli utenti.
- **Conversione Decimale Prezzi**: Auto-conversione al volo della virgola `,` in punto `.` nei campi prezzo su mobile e desktop.
- **Modifica ed Eliminazione Rilevazioni**: Modale dedicato `ShoppingEditBatchModal` ed icona cestino affiancata alla matita nello storico prezzi.
- **DatePicker & Menu Negozi Standard**: Integrato il `DatePicker` dell'applicazione ed il componente `ShoppingSupplierSelect` (con auto-fetch dei negozi) nel modale di modifica del prezzo.
- **Portal Overlay ed Eliminazione Scrollbar**: Renderizzato `ShoppingSupplierSelect` tramite React Portal su `document.body` (`usePortal=true`) con posizionamento sincrono per evitare che la lista estenda l'altezza dei modali causando la comparsa della scrollbar laterale.
- **Centratura Overlay su Mobile**: Configurati `DatePicker` (`overlay={isMobile}`) e `ShoppingSupplierSelect` (`asModal={isMobile}`) per aprirsi come finestre modali modellate al centro dello schermo su dispositivi mobile.
- **Inserimento Rapido Prezzi Desktop & Mobile**: Modale espanso `max-w-5xl` senza scrollbar orizzontale, campo quantitÃ  fino a 3+ cifre, pulsante `+` nel titolo colonna Negozio e menu a tendina "Associa a Lista Spesa (Opzionale)" in alto con visualizzazione del nome del gruppo (es. `ðŸ‘¥ Famiglia`).
- **Layout Modale a 2 Finestre Affiancate (`sidePanel`)**: Riprogettate le modali di modifica articolo acquistato e rilevazione prezzo in 2 finestre affiancate (stile albero delle task): pannello sinistro per *Dettagli Acquisto* (Prezzo Unitario, Prezzo Totale, Valuta, Negozio, Data Acquisto, Offerta) e pannello principale per *ProprietÃ  Prodotto* (Nome, Marca, Lista, QuantitÃ , UnitÃ  di Misura, Note).
- **Simmetria Visiva QuantitÃ  & UnitÃ **: Allineati simmetricamente i campi QuantitÃ  e UnitÃ  di Misura con etichette visive superiori uniformi.
- **Modifica Completa nello Storico Prezzi Archivi**: Estesa la modale a 2 finestre alla modifica dello Storico Prezzi (`ShoppingEditBatchModal`), consentendo la modifica contestuale sia del prezzo che dei dettagli prodotto (Nome, Marca, Lista, QuantitÃ , UnitÃ , Note).
- **Protezione Dati SEED & Permessi Batch**: I dati del primo inserimento (lotti SEED `id <= 41`) non mostrano i tasti di modifica/eliminazione agli utenti standard (visibili solo a SuperUser). I lotti non associati a liste (`list_item_id is None`) creati da un utente sono visibili unicamente dall'autore e dagli Admin, impedendo l'accesso e la modifica ad altri utenti fuori dal gruppo.
- **Persistenza Salvataggio Prezzi & Batch Utente**: Risolto un disallineamento nell'invio del prezzo totale di acquisto al backend ed estesa la gestione di `update_inventory_batch` in `service.py` per collegare/creare l'elemento di lista e persistere note, unitÃ  e lista selezionata anche per i rilevamenti prezzo nati senza `list_item_id`.
- **Pre-selezione Lista & Gestione Ruoli Gruppo nello Storico Prezzi**: Inclusi `shopping_list_id` e `unit_id` nella risposta API e pre-selezionata la lista nel modale di modifica. Applicata la verifica dei ruoli del gruppo (`owner`, `admin`, `editor`, `reader`): per gli utenti con ruolo Lettore (`reader`), i tasti di modifica/eliminazione vengono nascosti (sola visualizzazione) e bloccati con risposta HTTP 403 Forbidden dal server backend.
- **Fix Z-Index Negozio Mobile**: Modale di selezione e creazione negozio portati a `z-[20000]` per sovrapporsi correttamente alla modale rapida mobile.
- **Invarianza Case-Insensitive Gruppi**: Invito membri nei gruppi spesa reso totalmente case-insensitive lato backend.
- **[SHOPPING-006] Ordinamento Intuitivo UnitÃ  di Misura Spesa (âœ… Completato)**: Riorganizzato l'elenco delle unitÃ  di misura (`ShoppingUnitSelect`) nei form di inserimento/modifica articolo e archivio prezzi. Mantenuti invariati in testa i primi 3 gruppi canonici (Pesi/Masse, Liquidi/Volumi, Lunghezze) seguiti da una linea di confine divisoria e da tutte le altre unitÃ  (imballaggi, contenitori, porzioni) raggruppate in stretto ordine alfabetico con ordinamento dinamico per eventuali nuove unitÃ  inserite a sistema.

---

### [UI-001] Selezione Multipla nella Versione Mobile (âœ… Completato)

#### ðŸ“� Descrizione
ModalitÃ  di selezione multipla (*Multi-Select Mode*) integrata e attiva nell'interfaccia mobile per consentire operazioni massive rapide con touch / tap prolungato e barra azioni contestuali.

#### ðŸŽ¯ Ambiti di Applicazione Integrati
1. **ðŸ›’ Spesa Mobile (`MobileShoppingView`)**:
   - Selezione multipla di articoli per completamento in blocco, eliminazione, archiviazione o spostamento liste/gruppi.
2. **ðŸ“… Agenda, Task & Eventi Mobile (`MobileHomeView`, `MobileDayView`)**:
   - Selezione multipla e azioni batch per task, eventi di calendario e log abitudini/routine.

#### ðŸ› ï¸� Dettagli Tecnici Raggiunti
- **Contesto Globale Mobile**: Gestito tramite [`MobileSelectionContext.tsx`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/mobile/context/MobileSelectionContext.tsx).
- **Trigger & UI**: Long press e pulsanti dedicati nell'header mobile ([`MobileHeader.tsx`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/mobile/components/MobileHeader.tsx)), checkbox rotondi e action bar contestuale.

---

### [OFFLINE-001] ModalitÃ  Offline-First con Caching Locale & Sincronizzazione Differita (Outbox Queue) (âœ… Completato)

#### ðŸ“� Descrizione
Consentire l'utilizzo completo dell'applicazione (lettura, inserimento, modifica ed eliminazione di task, note, liste spesa, abitudini ed eventi) anche quando lo smartphone Ã¨ offline o non ha ancora stabilito il tunnel Tailscale VPN. Al ripristino della connettivitÃ , tutte le modifiche accumulate in locale vengono inviate automaticamente e in modo trasparente al backend (*Sync Queue / Outbox Pattern*).

#### ðŸŽ¯ Obiettivi & Casi d'Uso Chiave Raggiunti
1. **DisponibilitÃ  Immediata (Zero Latenza)**:
   - All'apertura dell'app, i dati (agenda, spesa, note, abitudini) vengono caricati istantaneamente dallo storage locale (IndexedDB), senza attendere la risposta di rete.
2. **Modifiche Offline Senza Blocchi**:
   - Spunta articoli al supermercato (anche in zone senza copertura cellulare).
   - Creazione rapida di task, appunti o cambio stato abitudini durante spostamenti offline.
3. **Sincronizzazione Differita Automatica**:
   - Rilevamento automatico dello stato online/offline (`navigator.onLine` e ping Tailscale).
   - Svuotamento sequenziale della coda delle mutazioni verso il backend al ripristino del collegamento.

#### ðŸ› ï¸� Dettagli Architetturali & Tecnologici Implementati
- **1. Storage Locale Persistente**:
  - Persistenza della cache API tramite **TanStack Query Persist** (`@tanstack/react-query-persist-client`) con driver **IndexedDB** (`idb-keyval`) in [`indexedDbPersister.ts`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/offline/indexedDbPersister.ts).
  - Retention locale a 7 giorni (`gcTime: 7d`) per navigazione offline prolungata.
- **2. Coda delle Mutazioni (Outbox Pattern)**:
  - Modulo [`outboxStore.ts`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/offline/outboxStore.ts) (Zustand + IndexedDB) per registrare operazioni mutative in assenza di rete.
  - Intercettazione trasparente in [`api/client.ts`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/api/client.ts) con risposta ottimistica positiva.
- **3. Sync Engine Sequenziale**:
  - Modulo [`syncEngine.ts`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/offline/syncEngine.ts) con svuotamento FIFO e gestione retry/backoff.
- **4. UI & Indicatori di Stato**:
  - Modale di ispezione e forzatura sincronizzazione manuale [`OfflineQueueModal.tsx`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/components/shared/offline/OfflineQueueModal.tsx).

---

### [TECH-002] Spostamento Tasto Switch "Vista Mobile / Vista Desktop" (âœ… Completato)

#### ðŸ“� Descrizione
I pulsanti di commutazione manuale tra modalitÃ  Desktop e Mobile sono stati rimossi dalle aree principali di lavoro e spostati nelle rispettive sezioni di impostazione avanzate:
1. **Desktop**: Spostato in **Impostazioni > Zona Pericolo** ([`DangerZoneSection.tsx`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/components/settings/DangerZoneSection.tsx)).
2. **Mobile Web**: Spostato in **Impostazioni**, posizionato subito prima di *"Esci dal profilo"* ([`MobileSettingsView.tsx`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/mobile/views/MobileSettingsView.tsx)) e nascosto automaticamente sull'app nativa Capacitor.

---

### [TECH-003] Persistenza Volume Uploads su Docker NAS (âœ… Completato)

#### ðŸ“� Descrizione
Aggiunta del flag per i volumi Docker in `deploy_nas.sh` e `docker-compose.yml` per mappare la cartella `/app/uploads` del backend su una cartella fisica del NAS (`/share/CACHEDEV1_DATA/Container/uploads`). Questo previene la perdita permanente delle immagini caricate dagli utenti (e altre risorse multimediali) ogni volta che il container viene aggiornato o riavviato tramite il processo di build automatizzato.

---

### [CORE-001] Refactoring Globale & Pulizia Architetturale (âœ… Completato)

#### ðŸ“� Descrizione
Intervento strutturale di refactoring trasversale su Backend e Frontend completato con successo: debito tecnico azzerato, flussi di dati standardizzati, 0 `any` nel Frontend e 19 domini collaudati nel Backend.

#### ðŸ› ï¸� Risultati Raggiunti

1. **Backend (Python / FastAPI / SQLAlchemy)**:
   - âœ… **Tutti i 19 domini architetturali** aderiscono ai pattern standardizzati (models, schemas, repository, service, router) e sono collaudati al 100%.
   - âœ… Gestione centralizzata delle eccezioni, date UTC e validazioni Pydantic v2.
   - âœ… Database e storico migrazioni Alembic allineati e certificati.

2. **Frontend (React 19 / TypeScript / Vite)**:
   - âœ… **Zero `any` in tutto il progetto**: tipizzazione strict su tutti i moduli, DTO e modali.
   - âœ… **Snellimento e Scomposizione Modulare**: Scomposti e snelliti tutti i file di grandi dimensioni (`AdminFeedbackSection`, `FeedbackModal`, `MobileFeedbackModal`, `useMobileDayLogic`, `MobileDayView`, `useShoppingItemsColumn`, `useYearEntries`) in sotto-hook e componenti grafici dedicati (riduzione fino al 90% delle righe, rispetto assoluto del principio DRY).
   - âœ… **Code-Splitting APK & Lazy Loading**: isolamento completo dei file desktop dalla build mobile (`npm run build:mobile`), con riduzione dell'82% del bundle iniziale.
   - âœ… **Regola del "Mazzo di Carte" applicata**: logica di filtraggio, ricerca in RAM e calcolo sotto-task gestita interamente nel frontend con reattivitÃ  a 0 ms.
   - âœ… **Correzione Rotazione Citazioni**: mazzo di 50 citazioni integrato in RAM offline, risolto il blocco su Seneca.

---

### [MEDIA-001] Upload Foto Dispositivo, Caching URL, GIF As-Is & WebP (âœ… Completato)

#### ðŸ“� Descrizione
Sistema centralizzato per la gestione dei media visivi dell'applicazione (Routine, Countdown, ecc.): salvataggio su disco anzichÃ© su database (per azzerare l'impatto sul DB), upload da dispositivo (PC o smartphone), caching automatico da link URL web, supporto nativo a GIF animate (as-is) e conversione WebP a 960px per foto statiche.

#### ðŸ› ï¸� Risultati Raggiunti
1. **Backend FastAPI**:
   - âœ… Nuovo dominio `backend/domains/media/` con endpoint `POST /media/upload` (multipart) e `POST /media/fetch-url` (download asincrono con `httpx`).
   - âœ… Pipeline intelligente con `Pillow`: le GIF animate vengono preservate byte-for-byte con loop e fotogrammi intatti; le foto statiche (JPG, PNG) vengono ridimensionate proporzionalmente a max 960px e convertite in `.webp` (~30-50 KB).
   - âœ… Serving statico sicuro montato su `/uploads` con persistenza garantita su cartella del server.
2. **Frontend Desktop & Mobile**:
   - âœ… Pulsante compatto con icona foto nei form di Routine e Countdown (Desktop e Mobile) per upload immediato da dispositivo o fotocamera.
   - âœ… Download e caching trasparente su blur quando viene incollato un link web esterno.
   - âœ… Utility `resolveImageUrl` per gestire in modo trasparente URL relativi `/uploads/...` sia su Web sia su Mobile (Capacitor/Tailscale).

---

### [CAL-001] Sincronizzazione Timezone Google Calendar & Preselezione Data Mobile DayPage (âœ… Completato)

#### ðŸ“� Descrizione
Risolti due problemi critici di sincronizzazione e usabilitÃ  relativi al modulo Calendario ed Eventi:
1. **Sfasamento Orario Google Calendar (+2h)**: Risolto il problema per cui la sincronizzazione con Google Calendar alterava l'orario di inizio e fine evento di +2 ore rispetto all'orario salvato nell'app (dovuto all'interpretazione UTC dell'API v3 di Google per payload privi di `timeZone`).
2. **Pre-selezione Data Corrente su Mobile DayPage**: Cliccando su "Nuovo Evento" dal menu veloce (+) in Mobile DayView mentre si osserva un giorno specifico (es. 20/09), il form di creazione ora si apre pre-impostato su quel giorno anzichÃ© forzare la data odierna.

#### ðŸ› ï¸� Risultati Raggiunti
1. **Backend (`backend/domains/google_calendar/service.py`)**:
   - âœ… Rilevamento automatico e fallback resiliente del fuso orario del calendario Google (`get_calendar_timezone`, default `Europe/Rome`).
   - âœ… Formattazione ISO naive locale con associazione esplicita del parametro `"timeZone": time_zone` sia su `start` che su `end` nel payload evento, evitando doppi offset e conversioni arbitrarie verso UTC.
   - âœ… Parsing bidirezionale accurato (`_parse_google_datetime`) sia per timestamp ISO con offset esplicito (+02:00) sia per timestamp UTC (`Z`), convertendoli nel corretto orario locale prima del salvataggio nel database locale.
2. **Frontend (`frontend/src/mobile/hooks/useMobileHeaderLogic.ts`)**:
   - âœ… `handleNewEvent` integrato con `DayContext` (`useDayOptional`), passando la data visualizzata corrente a `openEventForm(null, dateStr)` in rotta `/giorno`.

---

### [FEAT-008] Sistema di Segnalazione Errori, Feedback & Bug Report (âœ… Completato)

#### ðŸ“� Descrizione
Un sistema integrato end-to-end che consente agli utenti dell'applicazione (sia da Desktop sia da Smartphone Android) di inviare segnalazioni su bug riscontrati, problemi di layout, anomalie o proporre suggerimenti. Il sistema include la raccolta automatica del contesto tecnico (versione app, piattaforma, route corrente, stacktrace ed eventuali errori API recenti) per azzerare lo sforzo dell'utente e facilitare la risoluzione immediata da parte degli sviluppatori e amministratori.

#### ðŸ› ï¸� Risultati Raggiunti

1. **Backend FastAPI (`backend/domains/feedback/`)**:
   - âœ… Modello SQLAlchemy `FeedbackReport` con campi: `report_type` (`bug`, `visual`, `feature_request`, `other`), `severity` (`low`, `medium`, `high`, `critical`), `status` (`new`, `in_progress`, `resolved`, `dismissed`), `app_version`, `platform`, `current_route`, `error_context` (JSON), `screenshot_url` e `admin_notes`.
   - âœ… DTO Pydantic v2 strict con validazioni e relazioni utente eager-loaded (`user_username`, `user_email`).
   - âœ… Endpoint REST completi: `POST /feedback/reports` (creazione segnalazione), `GET /feedback/reports` (elenco completo con filtri riservato a SuperUser), `GET /feedback/reports/{id}`, `PATCH /feedback/reports/{id}` (modifica stato/note admin), `DELETE /feedback/reports/{id}` e `GET /feedback/my-reports`.
   - âœ… Migrazione Alembic `m2n3o4p5q6r7_add_feedback_reports_table.py` e allineamento idempotente in `ensure_database_schema_compat()`.

2. **Frontend Desktop & Mobile**:
   - âœ… **Telemetria in RAM (`telemetry.ts`)**: buffer circolare per gli ultimi 15 errori API e crash applicativi, con helper `getDiagnosticContext()` che raccoglie versione app, piattaforma, route, risoluzione schermo e user agent.
   - âœ… **Intercettore Axios**: registrazione automatica degli errori HTTP nel buffer di telemetria.
   - âœ… **Modale Universale `FeedbackModal.tsx`**: modale responsive per inviare segnalazioni categorizzate, con selettore di gravitÃ , upload screenshot (formato WebP ottimizzato via endpoint `/media/upload`), e toggle/ispettore per il contesto diagnostico.
   - âœ… **Integrazione nei 4 Punti Chiave**:
     - *Changelog Modal & Mobile Changelog*: pulsante footer per segnalare anomalie sulla versione installata.
     - *Impostazioni Utente & Mobile Settings*: voce dedicata per invio rapido di feedback e segnalazioni.
     - *Error Boundary (`AppErrorBoundary.tsx`)*: cattura dei crash React con registrazione automatica dello stacktrace e tasto rapido di segnalazione precompilata.
     - *Schermate di Errore (`PageErrorState.tsx`)*: pulsante per inviare segnalazione direttamente dalla schermata di errore.

3. **Pannello Amministratore (`/admin`)**:
   - âœ… Nuova scheda **"Feedback & Bug Report"** in `AdminPage.tsx` con KPI (totale, nuove da gestire, in lavorazione, risolte), filtri per stato/gravitÃ /tipologia e ricerca full-text.
   - âœ… Modale di ispezione e gestione: visualizzatore screenshot ad alta risoluzione con zoom fullscreen, ispettore del contesto tecnico JSON, dropdown per cambio stato e textarea per salvare note interne di risoluzione.

---

#### [REBRAND-001] Rebranding App con Nome "Vita" e Cambio Icona (âœ… Completato)
- **Descrizione**: Rebranding dell'applicazione con la nuova denominazione "Vita" e sostituzione dell'icona applicativa (sia per la versione Web/Favicon che per l'APK Android nativo con Capacitor).
- **Stato**: ðŸŸ¢ Completato.

#### [TRACKERS-003] Fix Visualizzazione Serie & Restyling Modale (Settembre 2026)
- **Descrizione**: Risolto il bug di visualizzazione causato dall'errata lettura delle properties piatte (invece che nested) e implementati accorgimenti al modale SeriesDetailModal.
- **Da completare (Feedback Utente)**: Rimuovere riga verticale colonna sinistra, unire tutto, ridurre testo trama/titolo, spostare serie consigliate a destra e farle card piccole, limitare scorrimento orizzontale cast, aggiunta liste personalizzate e tasto incrocio amici.
- **Stato**: ðŸŸ¢ Completato.


### [TRACKERS-001] Integrazione Backend per Recensioni, Commenti e Notifiche

#### Ã°Å¸â€œÂ� Descrizione
Implementare il salvataggio reale dei commenti e delle recensioni degli amici, rimuovendo i mock data, e collegare la creazione di un commento alle notifiche dell'inbox con deep-linking diretto. Cliccando la notifica, l'app dovrÃƒÂ  aprire automaticamente la serie e visualizzare il commento specifico.

#### Ã¢Å¡â„¢Ã¯Â¸Â� Dettagli Implementazione Backend
- **Tabelle / Migrazioni**: La tabella per i commenti esiste giÃƒÂ  (Interactions).
- **Endpoint HTTP**:
  - GET /trackers/series/{tmdb_id}/friends-reviews (Restituisce i log degli amici con i commenti associati)
  - GET /trackers/episodes/{episode_id}/friends-reviews (Idem per singoli episodi)
  - POST /interactions (Usato per creare il commento: interaction_type = "SERIES_REVIEW_COMMENT", 
eference_id = log_id)

#### Ã°Å¸â€™Â» Cosa Manca da Implementare nel Frontend
- [ ] **Data Fetching**: Sostituire MOCK_FRIENDS_SERIES_LOGS e MOCK_FRIENDS_LOGS in SeriesReviewTab.tsx e EpisodeDetailView.tsx con query React Query verso i nuovi endpoint.
- [ ] **Creazione Commento**: Legare la textarea dei commenti alla mutazione per chiamare POST /interactions.
- [ ] **Routing Notifiche (Deep-linking)**:
  - Aggiornare handleNotificationClick in NotificationsSidebar.tsx per supportare il tipo SERIES_REVIEW_COMMENT.
  - Fare in modo che navighi a /trackers/series?open_review={reference_id}&tmdb_id={serie_id}.
  - Modificare TVSeriesPage e le modali (SeriesDetailModal, EpisodeDetailView) per leggere questi parametri dall'URL e aprire automaticamente i tab corretti al caricamento.

- **Stato**: ðŸŸ¢ Completato (Settembre 2026)
### FIX: Ottimizzazione UI e Bugfix Dettaglio Serie (Settembre 2026)
- **Stato**: ?? Completato
- **Dettagli**: 
  - Risolto bug per cui le citazioni degli episodi svanivano al ricaricamento a causa di un mancato collegamento nella query globale del backend.
  - Fix per il rendering a 5 stelle della media voti nelle stagioni e nelle recensioni degli amici, che non convertiva il nuovo rating 1-10 del database.
  - Implementato un indicatore visivo persistente (pallino rosso) sul bottone per le citazioni dell'episodio se ce ne sono di salvate.
  - Inseriti comandi rapidi di "Modifica" ed "Elimina" recensione direttamente nell'intestazione del popup di lettura dei commenti della propria recensione, uniformati con le icone dell'app.

### [TRACKERS-001] Fix TMDB Ratings for trackers
- **Stato**: Completato (Aggiunta colonna vote_average al backend e integrata nel frontend)

### [TRACKERS-002] Fix friends status display in Series/Episode header
- **Stato**: Completato (Risolto con Outer Join su backend e aggiunta skeleton)

### [FEAT-007-EXT] Miglioramenti Sistema Social & Notifiche (Thread, Deep-Linking, UI)

#### ?? Descrizione
Perfezionamento del sistema di notifiche e interazioni sociali introdotto in FEAT-007, con un focus specifico sulle recensioni di Serie TV ed Episodi.

#### ?? Dettagli Implementazione
- **Sistema 1 (Iscrizione al Thread)**: Quando un utente partecipa a una discussione (commentando una recensione propria o altrui), riceve una notifica automatica ad ogni nuovo commento aggiunto al thread da altri utenti.
- **Deep-Linking Avanzato**: Cliccando su una notifica di un commento o di un thread, l'app ora supporta il routing profondo. Viene aperta la modale della serie corretta, selezionata la tab giusta e caricato direttamente il dettaglio della recensione commentata pronto per rispondere.
- **Prevenzione Notifiche Superflue**: L'autore di una recensione non riceve notifiche quando è lui stesso ad aggiungere un commento alla propria recensione.
- **Ripristino UI Commenti**: Sistemata l'etichetta visiva ("X commenti") nelle liste delle recensioni (sia proprie che degli amici) che era sparita durante il precedente refactoring.

#### ? Esito
**Stato**: ?? Completato (Settembre 2026)

### [FEAT-004] Sotto-task Sezione Media Completati (ðŸŸ¢ Completato)

- ðŸ“š **Liste Multimediali Personalizzate**: Creazione di sottoliste miste (es. "MCU", "Da vedere con la ragazza") in cui inserire film, serie o libri. (*UI di gestione liste completata*). Comportamento Homepage vs Sezioni gestito.
- ðŸ”Ž **Ricerca per Lista**: Aggiunta la possibilitÃ  di filtrare o cercare elementi in base all'appartenenza a specifiche liste.
- ðŸ’¬ **Commenti alle Recensioni & Menzioni**: Sistema per commentare le singole recensioni (tue, amici o pubbliche) con thread visuali a comparsa (chat bubble) e autocompletamento @menzioni.
- ðŸ”” **Sistema di Notifiche Avanzato**: Sistema per avvisare l'utente alla ricezione di inviti, commenti o menzioni dirette (@X) nei thread, con deep-linking diretto al commento in questione.
- ðŸ’¬ **Messaggistica Istantanea ed Effimera**: Integrazione di messaggi effimeri diretta tra amici.
- ðŸ“¡ **Rimozione Dati Mock & Integrazione API**: Sostituzione dei Dati Mock con fetch reali dal Database e logica TMDB / React Query per tutte le sezioni.
- ðŸŽ¨ **UI Schermata di Dettaglio Completata**: Design del modale di dettaglio della singola serie completato e rifinito (gestione cast, layout colonne, header integrato, status badge, e pannello liste).


---

### [SHOPPING-007] Inserimento Rapido Catalogo & Selezione Multipla Spesa (Sposta / Copia / Elimina) (🟢 Completato)

#### 📋 Descrizione
Implementazione completa su Web-App (Desktop) e Smartphone (Mobile) di due funzionalità cardine del modulo Shopping & Spesa:
1. **Inserimento Rapido da Catalogo Tabellare A-Z**: selezione rapida degli articoli frequenti del catalogo senza aprire form modali, con aggiunta/rimozione immediata e reattiva tramite checkbox quadrate.
2. **Selezione Multipla con Spostamento, Copia e Cancellazione Massiva**: gestione in blocco degli articoli con toolbar contestuale (Web) e header di selezione (Mobile), supporto per trasferimento verso altre liste, clonazione preservata da liste chiuse e protezione dello storico.

#### ⚙️ Dettagli Implementazione & Funzionalità Raggiunte
- **Trigger Invisibili & Zero Impatto Visivo**:
  - **Desktop (Web-App)**: Doppio click discreto (`onDoubleClick`) sul box del titolo *"Shopping & Spesa"* nell'header della pagina.
  - **Smartphone (Mobile)**: Pressione prolungata (*Long-press* ~450ms con vibrazione aptica) sull'icona della borsa blu nel selettore in alto della lista attiva.
  - Entrambi i trigger passano automaticamente alla lista di default (*"Senza lista"*) se la lista attiva corrente è differente.
- **Vista Tabellare A-Z & Checkbox Reattive**:
  - Ordinamento alfabetico A-Z dei prodotti del catalogo con separatori di lettere.
  - Barra di ricerca istantanea A-Z per nome o marca.
  - Checkbox quadrate reattive per inserimento/rimozione al volo dell'articolo dalla lista spesa con stato ottimistico.
  - Pulsante *"Fatto"* / *"Chiudi"* per ritornare alla vista standard della lista.
- **Selezione Multipla & Spostamento Rapido**:
  - Selezione multipla attivabile tramite click (Desktop) o Long-press (Mobile) sulla riga dell'articolo.
  - Checkbox quadrate dedicate a sinistra in modalità selezione per evitare interferenze con la funzione "Acquistato" (segna come comprato).
  - Checkbox master *"Seleziona tutti / Deseleziona tutti"* con gestione stato indeterminato (tri-state).
  - Pulsante **Sposta in...** (icona freccia blu `ForwardIcon`): apre il modale dedicato per trasferire gli articoli selezionati in un'altra lista aperta.
- **Copia Rapida & Protezione Liste Chiuse**:
  - Pulsante **Copia in...** (icona lista verde `TaskListIcon`): clona gli articoli selezionati creando nuovi record nella lista di destinazione prescelta (impostati come *da acquistare*).
  - **Protezione Liste Chiuse (`isCompleted: true`)**: quando si selezionano articoli da una lista completata/chiusa, i pulsanti *Sposta* ed *Elimina* vengono nascosti/disabilitati per preservare lo storico. Rimane attivo e pienamente fruibile il pulsante *Copia in...*.
- **Modale Scelta Lista Destinazione (`ShoppingMoveOrCopyModal.tsx`)**:
  - Ricerca integrata per nome lista o gruppo.
  - Suddivisione visiva tra *Liste Personali* e *Liste Condivise di Gruppo*.
  - Esclusione automatica delle liste chiuse come destinazione di sposta/copia.
- **Integrazione Completa Frontend Mobile**:
  - Esteso `MobileSelectionContext` con handler `onMove` e `onCopy`.
  - Aggiornato `MobileSelectionHeader` con icone dedicate per Sposta, Copia, Seleziona Tutto ed Elimina.
  - Collegato `MobileShoppingModalsContainer` con `ShoppingMoveOrCopyModal`.

#### 🏁 Esito
**Stato**: 🟢 Completato (Ottobre 2026)
