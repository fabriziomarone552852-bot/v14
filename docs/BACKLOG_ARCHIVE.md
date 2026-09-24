# 🗄️ Backlog Archivio (Task Completati)

Questo file contiene i task storici che sono stati completati e rimossi dal `BACKLOG.md` principale per mantenere il documento snello.

---

### [FEAT-002] Gestione Avanzata Inventario, Prezzi Rapidi & Lotti Spesa (✅ Completato)

#### 📝 Descrizione
Modulo completo per l'inserimento rapido dei prezzi a catalogo, tracciamento storico prezzi (SEED & utente), modifica ed eliminazione rilevazioni personali e selezione/creazione supermercati.

#### ⚙️ Dettagli Implementazione & Funzionalità Raggiunte
- **Autocomplete Spesa Mobile**: Suggerimenti in tempo reale nella barra di aggiunta rapida della spesa su mobile.
- **Visualizzazione Prezzi SEED**: Rettificata la visibilità dei prezzi SEED e di catalogo nello storico prezzi dei prodotti per tutti gli utenti.
- **Conversione Decimale Prezzi**: Auto-conversione al volo della virgola `,` in punto `.` nei campi prezzo su mobile e desktop.
- **Modifica ed Eliminazione Rilevazioni**: Modale dedicato `ShoppingEditBatchModal` ed icona cestino affiancata alla matita nello storico prezzi.
- **DatePicker & Menu Negozi Standard**: Integrato il `DatePicker` dell'applicazione ed il componente `ShoppingSupplierSelect` (con auto-fetch dei negozi) nel modale di modifica del prezzo.
- **Portal Overlay ed Eliminazione Scrollbar**: Renderizzato `ShoppingSupplierSelect` tramite React Portal su `document.body` (`usePortal=true`) con posizionamento sincrono per evitare che la lista estenda l'altezza dei modali causando la comparsa della scrollbar laterale.
- **Centratura Overlay su Mobile**: Configurati `DatePicker` (`overlay={isMobile}`) e `ShoppingSupplierSelect` (`asModal={isMobile}`) per aprirsi come finestre modali modellate al centro dello schermo su dispositivi mobile.
- **Inserimento Rapido Prezzi Desktop & Mobile**: Modale espanso `max-w-5xl` senza scrollbar orizzontale, campo quantità fino a 3+ cifre, pulsante `+` nel titolo colonna Negozio e menu a tendina "Associa a Lista Spesa (Opzionale)" in alto con visualizzazione del nome del gruppo (es. `👥 Famiglia`).
- **Layout Modale a 2 Finestre Affiancate (`sidePanel`)**: Riprogettate le modali di modifica articolo acquistato e rilevazione prezzo in 2 finestre affiancate (stile albero delle task): pannello sinistro per *Dettagli Acquisto* (Prezzo Unitario, Prezzo Totale, Valuta, Negozio, Data Acquisto, Offerta) e pannello principale per *Proprietà Prodotto* (Nome, Marca, Lista, Quantità, Unità di Misura, Note).
- **Simmetria Visiva Quantità & Unità**: Allineati simmetricamente i campi Quantità e Unità di Misura con etichette visive superiori uniformi.
- **Modifica Completa nello Storico Prezzi Archivi**: Estesa la modale a 2 finestre alla modifica dello Storico Prezzi (`ShoppingEditBatchModal`), consentendo la modifica contestuale sia del prezzo che dei dettagli prodotto (Nome, Marca, Lista, Quantità, Unità, Note).
- **Protezione Dati SEED & Permessi Batch**: I dati del primo inserimento (lotti SEED `id <= 41`) non mostrano i tasti di modifica/eliminazione agli utenti standard (visibili solo a SuperUser). I lotti non associati a liste (`list_item_id is None`) creati da un utente sono visibili unicamente dall'autore e dagli Admin, impedendo l'accesso e la modifica ad altri utenti fuori dal gruppo.
- **Persistenza Salvataggio Prezzi & Batch Utente**: Risolto un disallineamento nell'invio del prezzo totale di acquisto al backend ed estesa la gestione di `update_inventory_batch` in `service.py` per collegare/creare l'elemento di lista e persistere note, unità e lista selezionata anche per i rilevamenti prezzo nati senza `list_item_id`.
- **Pre-selezione Lista & Gestione Ruoli Gruppo nello Storico Prezzi**: Inclusi `shopping_list_id` e `unit_id` nella risposta API e pre-selezionata la lista nel modale di modifica. Applicata la verifica dei ruoli del gruppo (`owner`, `admin`, `editor`, `reader`): per gli utenti con ruolo Lettore (`reader`), i tasti di modifica/eliminazione vengono nascosti (sola visualizzazione) e bloccati con risposta HTTP 403 Forbidden dal server backend.
- **Fix Z-Index Negozio Mobile**: Modale di selezione e creazione negozio portati a `z-[20000]` per sovrapporsi correttamente alla modale rapida mobile.
- **Invarianza Case-Insensitive Gruppi**: Invito membri nei gruppi spesa reso totalmente case-insensitive lato backend.
- **[SHOPPING-006] Ordinamento Intuitivo Unità di Misura Spesa (✅ Completato)**: Riorganizzato l'elenco delle unità di misura (`ShoppingUnitSelect`) nei form di inserimento/modifica articolo e archivio prezzi. Mantenuti invariati in testa i primi 3 gruppi canonici (Pesi/Masse, Liquidi/Volumi, Lunghezze) seguiti da una linea di confine divisoria e da tutte le altre unità (imballaggi, contenitori, porzioni) raggruppate in stretto ordine alfabetico con ordinamento dinamico per eventuali nuove unità inserite a sistema.

---

### [UI-001] Selezione Multipla nella Versione Mobile (✅ Completato)

#### 📝 Descrizione
Modalità di selezione multipla (*Multi-Select Mode*) integrata e attiva nell'interfaccia mobile per consentire operazioni massive rapide con touch / tap prolungato e barra azioni contestuali.

#### 🎯 Ambiti di Applicazione Integrati
1. **🛒 Spesa Mobile (`MobileShoppingView`)**:
   - Selezione multipla di articoli per completamento in blocco, eliminazione, archiviazione o spostamento liste/gruppi.
2. **📅 Agenda, Task & Eventi Mobile (`MobileHomeView`, `MobileDayView`)**:
   - Selezione multipla e azioni batch per task, eventi di calendario e log abitudini/routine.

#### 🛠️ Dettagli Tecnici Raggiunti
- **Contesto Globale Mobile**: Gestito tramite [`MobileSelectionContext.tsx`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/mobile/context/MobileSelectionContext.tsx).
- **Trigger & UI**: Long press e pulsanti dedicati nell'header mobile ([`MobileHeader.tsx`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/mobile/components/MobileHeader.tsx)), checkbox rotondi e action bar contestuale.

---

### [OFFLINE-001] Modalità Offline-First con Caching Locale & Sincronizzazione Differita (Outbox Queue) (✅ Completato)

#### 📝 Descrizione
Consentire l'utilizzo completo dell'applicazione (lettura, inserimento, modifica ed eliminazione di task, note, liste spesa, abitudini ed eventi) anche quando lo smartphone è offline o non ha ancora stabilito il tunnel Tailscale VPN. Al ripristino della connettività, tutte le modifiche accumulate in locale vengono inviate automaticamente e in modo trasparente al backend (*Sync Queue / Outbox Pattern*).

#### 🎯 Obiettivi & Casi d'Uso Chiave Raggiunti
1. **Disponibilità Immediata (Zero Latenza)**:
   - All'apertura dell'app, i dati (agenda, spesa, note, abitudini) vengono caricati istantaneamente dallo storage locale (IndexedDB), senza attendere la risposta di rete.
2. **Modifiche Offline Senza Blocchi**:
   - Spunta articoli al supermercato (anche in zone senza copertura cellulare).
   - Creazione rapida di task, appunti o cambio stato abitudini durante spostamenti offline.
3. **Sincronizzazione Differita Automatica**:
   - Rilevamento automatico dello stato online/offline (`navigator.onLine` e ping Tailscale).
   - Svuotamento sequenziale della coda delle mutazioni verso il backend al ripristino del collegamento.

#### 🛠️ Dettagli Architetturali & Tecnologici Implementati
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

### [TECH-002] Spostamento Tasto Switch "Vista Mobile / Vista Desktop" (✅ Completato)

#### 📝 Descrizione
I pulsanti di commutazione manuale tra modalità Desktop e Mobile sono stati rimossi dalle aree principali di lavoro e spostati nelle rispettive sezioni di impostazione avanzate:
1. **Desktop**: Spostato in **Impostazioni > Zona Pericolo** ([`DangerZoneSection.tsx`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/components/settings/DangerZoneSection.tsx)).
2. **Mobile Web**: Spostato in **Impostazioni**, posizionato subito prima di *"Esci dal profilo"* ([`MobileSettingsView.tsx`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/mobile/views/MobileSettingsView.tsx)) e nascosto automaticamente sull'app nativa Capacitor.

---

### [TECH-003] Persistenza Volume Uploads su Docker NAS (✅ Completato)

#### 📝 Descrizione
Aggiunta del flag per i volumi Docker in `deploy_nas.sh` e `docker-compose.yml` per mappare la cartella `/app/uploads` del backend su una cartella fisica del NAS (`/share/CACHEDEV1_DATA/Container/uploads`). Questo previene la perdita permanente delle immagini caricate dagli utenti (e altre risorse multimediali) ogni volta che il container viene aggiornato o riavviato tramite il processo di build automatizzato.

---

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
   - ✅ **Snellimento e Scomposizione Modulare**: Scomposti e snelliti tutti i file di grandi dimensioni (`AdminFeedbackSection`, `FeedbackModal`, `MobileFeedbackModal`, `useMobileDayLogic`, `MobileDayView`, `useShoppingItemsColumn`, `useYearEntries`) in sotto-hook e componenti grafici dedicati (riduzione fino al 90% delle righe, rispetto assoluto del principio DRY).
   - ✅ **Code-Splitting APK & Lazy Loading**: isolamento completo dei file desktop dalla build mobile (`npm run build:mobile`), con riduzione dell'82% del bundle iniziale.
   - ✅ **Regola del "Mazzo di Carte" applicata**: logica di filtraggio, ricerca in RAM e calcolo sotto-task gestita interamente nel frontend con reattività a 0 ms.
   - ✅ **Correzione Rotazione Citazioni**: mazzo di 50 citazioni integrato in RAM offline, risolto il blocco su Seneca.

---

### [MEDIA-001] Upload Foto Dispositivo, Caching URL, GIF As-Is & WebP (✅ Completato)

#### 📝 Descrizione
Sistema centralizzato per la gestione dei media visivi dell'applicazione (Routine, Countdown, ecc.): salvataggio su disco anziché su database (per azzerare l'impatto sul DB), upload da dispositivo (PC o smartphone), caching automatico da link URL web, supporto nativo a GIF animate (as-is) e conversione WebP a 960px per foto statiche.

#### 🛠️ Risultati Raggiunti
1. **Backend FastAPI**:
   - ✅ Nuovo dominio `backend/domains/media/` con endpoint `POST /media/upload` (multipart) e `POST /media/fetch-url` (download asincrono con `httpx`).
   - ✅ Pipeline intelligente con `Pillow`: le GIF animate vengono preservate byte-for-byte con loop e fotogrammi intatti; le foto statiche (JPG, PNG) vengono ridimensionate proporzionalmente a max 960px e convertite in `.webp` (~30-50 KB).
   - ✅ Serving statico sicuro montato su `/uploads` con persistenza garantita su cartella del server.
2. **Frontend Desktop & Mobile**:
   - ✅ Pulsante compatto con icona foto nei form di Routine e Countdown (Desktop e Mobile) per upload immediato da dispositivo o fotocamera.
   - ✅ Download e caching trasparente su blur quando viene incollato un link web esterno.
   - ✅ Utility `resolveImageUrl` per gestire in modo trasparente URL relativi `/uploads/...` sia su Web sia su Mobile (Capacitor/Tailscale).

---

### [CAL-001] Sincronizzazione Timezone Google Calendar & Preselezione Data Mobile DayPage (✅ Completato)

#### 📝 Descrizione
Risolti due problemi critici di sincronizzazione e usabilità relativi al modulo Calendario ed Eventi:
1. **Sfasamento Orario Google Calendar (+2h)**: Risolto il problema per cui la sincronizzazione con Google Calendar alterava l'orario di inizio e fine evento di +2 ore rispetto all'orario salvato nell'app (dovuto all'interpretazione UTC dell'API v3 di Google per payload privi di `timeZone`).
2. **Pre-selezione Data Corrente su Mobile DayPage**: Cliccando su "Nuovo Evento" dal menu veloce (+) in Mobile DayView mentre si osserva un giorno specifico (es. 20/09), il form di creazione ora si apre pre-impostato su quel giorno anziché forzare la data odierna.

#### 🛠️ Risultati Raggiunti
1. **Backend (`backend/domains/google_calendar/service.py`)**:
   - ✅ Rilevamento automatico e fallback resiliente del fuso orario del calendario Google (`get_calendar_timezone`, default `Europe/Rome`).
   - ✅ Formattazione ISO naive locale con associazione esplicita del parametro `"timeZone": time_zone` sia su `start` che su `end` nel payload evento, evitando doppi offset e conversioni arbitrarie verso UTC.
   - ✅ Parsing bidirezionale accurato (`_parse_google_datetime`) sia per timestamp ISO con offset esplicito (+02:00) sia per timestamp UTC (`Z`), convertendoli nel corretto orario locale prima del salvataggio nel database locale.
2. **Frontend (`frontend/src/mobile/hooks/useMobileHeaderLogic.ts`)**:
   - ✅ `handleNewEvent` integrato con `DayContext` (`useDayOptional`), passando la data visualizzata corrente a `openEventForm(null, dateStr)` in rotta `/giorno`.

---

### [FEAT-008] Sistema di Segnalazione Errori, Feedback & Bug Report (✅ Completato)

#### 📝 Descrizione
Un sistema integrato end-to-end che consente agli utenti dell'applicazione (sia da Desktop sia da Smartphone Android) di inviare segnalazioni su bug riscontrati, problemi di layout, anomalie o proporre suggerimenti. Il sistema include la raccolta automatica del contesto tecnico (versione app, piattaforma, route corrente, stacktrace ed eventuali errori API recenti) per azzerare lo sforzo dell'utente e facilitare la risoluzione immediata da parte degli sviluppatori e amministratori.

#### 🛠️ Risultati Raggiunti

1. **Backend FastAPI (`backend/domains/feedback/`)**:
   - ✅ Modello SQLAlchemy `FeedbackReport` con campi: `report_type` (`bug`, `visual`, `feature_request`, `other`), `severity` (`low`, `medium`, `high`, `critical`), `status` (`new`, `in_progress`, `resolved`, `dismissed`), `app_version`, `platform`, `current_route`, `error_context` (JSON), `screenshot_url` e `admin_notes`.
   - ✅ DTO Pydantic v2 strict con validazioni e relazioni utente eager-loaded (`user_username`, `user_email`).
   - ✅ Endpoint REST completi: `POST /feedback/reports` (creazione segnalazione), `GET /feedback/reports` (elenco completo con filtri riservato a SuperUser), `GET /feedback/reports/{id}`, `PATCH /feedback/reports/{id}` (modifica stato/note admin), `DELETE /feedback/reports/{id}` e `GET /feedback/my-reports`.
   - ✅ Migrazione Alembic `m2n3o4p5q6r7_add_feedback_reports_table.py` e allineamento idempotente in `ensure_database_schema_compat()`.

2. **Frontend Desktop & Mobile**:
   - ✅ **Telemetria in RAM (`telemetry.ts`)**: buffer circolare per gli ultimi 15 errori API e crash applicativi, con helper `getDiagnosticContext()` che raccoglie versione app, piattaforma, route, risoluzione schermo e user agent.
   - ✅ **Intercettore Axios**: registrazione automatica degli errori HTTP nel buffer di telemetria.
   - ✅ **Modale Universale `FeedbackModal.tsx`**: modale responsive per inviare segnalazioni categorizzate, con selettore di gravità, upload screenshot (formato WebP ottimizzato via endpoint `/media/upload`), e toggle/ispettore per il contesto diagnostico.
   - ✅ **Integrazione nei 4 Punti Chiave**:
     - *Changelog Modal & Mobile Changelog*: pulsante footer per segnalare anomalie sulla versione installata.
     - *Impostazioni Utente & Mobile Settings*: voce dedicata per invio rapido di feedback e segnalazioni.
     - *Error Boundary (`AppErrorBoundary.tsx`)*: cattura dei crash React con registrazione automatica dello stacktrace e tasto rapido di segnalazione precompilata.
     - *Schermate di Errore (`PageErrorState.tsx`)*: pulsante per inviare segnalazione direttamente dalla schermata di errore.

3. **Pannello Amministratore (`/admin`)**:
   - ✅ Nuova scheda **"Feedback & Bug Report"** in `AdminPage.tsx` con KPI (totale, nuove da gestire, in lavorazione, risolte), filtri per stato/gravità/tipologia e ricerca full-text.
   - ✅ Modale di ispezione e gestione: visualizzatore screenshot ad alta risoluzione con zoom fullscreen, ispettore del contesto tecnico JSON, dropdown per cambio stato e textarea per salvare note interne di risoluzione.

---

#### [REBRAND-001] Rebranding App con Nome "Vita" e Cambio Icona (✅ Completato)
- **Descrizione**: Rebranding dell'applicazione con la nuova denominazione "Vita" e sostituzione dell'icona applicativa (sia per la versione Web/Favicon che per l'APK Android nativo con Capacitor).
- **Stato**: 🟢 Completato.

#### [TRACKERS-003] Fix Visualizzazione Serie & Restyling Modale (Settembre 2026)
- **Descrizione**: Risolto il bug di visualizzazione causato dall'errata lettura delle properties piatte (invece che nested) e implementati accorgimenti al modale SeriesDetailModal.
- **Da completare (Feedback Utente)**: Rimuovere riga verticale colonna sinistra, unire tutto, ridurre testo trama/titolo, spostare serie consigliate a destra e farle card piccole, limitare scorrimento orizzontale cast, aggiunta liste personalizzate e tasto incrocio amici.
- **Stato**: 🟢 Completato.
