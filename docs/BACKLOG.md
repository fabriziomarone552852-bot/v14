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
| **MEDIA-001** | **Upload Foto Dispositivo, Caching URL, GIF As-Is & WebP** | `media` / storage | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **CAL-001** | **Sincronizzazione Timezone Google Calendar & Data Mobile DayPage** | `calendar` / `mobile` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **FEAT-004** | **Sezione Media: Libri, Film e Serie TV** | `media` / ent | 🔴 Da Iniziare | 🔴 Da Iniziare | 🔴 **Massima (Passo Fondamentale)** |
| **FEAT-005** | **Sezione Liste Tematiche & Personalizzate** | `custom_lists` | 🔴 Da Iniziare | 🔴 Da Iniziare | 🔴 **Massima (Passo Fondamentale)** |
| **FEAT-006** | **Hub Spesa, Ricettario, Meal Prep & Wishlist Oggetti** | `shopping` / food | 🔴 Da Strutturare | 🔴 Da Implementare | 🔴 **Massima (Passo Fondamentale)** |
| **FEAT-007** | **Sistema Amicizie & Condivisione Recensioni (Social/Sharing)** | `social` / media | 🔴 Da Strutturare | 🔴 Da Implementare | 🟠 **Alta (Passo Fondamentale)** |
| **FEAT-008** | **Sistema Segnalazione Errori, Feedback & Bug Report** | `support` / feedback | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **OFFLINE-001** | **Modalità Offline-First & Sincronizzazione Differita (Outbox Sync)** | `sync` / mobile | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **FEAT-009** | **Restyling & Rifinitura Grafica Schermate SuperUser (Admin Panel)** | `admin` / UI | 🟢 Supportato | 🔴 Da Implementare | 🟠 **Alta** |
| **FEAT-010** | **Database & Sincronizzazione Centralizzata Citazioni Giornaliere (Quotes)** | `core` / quotes | 🔴 Da Implementare | 🔴 Da Implementare | Media |
| **AI-001** | **Studio & Integrazione Intelligenza Artificiale (AI)** | `ai` / assistant | 🔴 Da Analizzare | 🔴 Da Analizzare | 🟠 **Alta (Ricerca & Prototipo)** |
| **FEAT-011** | **Sezione Lavoro & Gestione Turni di Lavoro** | `work` / `shifts` | 🔴 Da Definire | 🔴 Da Definire | 🟠 **Alta (Punto da definire con Daniela)** |
| **FEAT-001** | Liste Spesa: Preferite & Pinnate (`pin_status`) | `shopping` | 🟢 Completato | 🔴 Da Implementare | Media-Alta |
| **FEAT-002** | Gestione Inventario Spesa, Inserimento Prezzi & Lotti (`inventory_batches`) | `shopping` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **FEAT-003** | **Dashboard Analytics & Storico Prezzi** | `analytics` | 🟢 Completato | 🔴 Da Implementare | Bassa |
| **UI-001** | **Selezione Multipla nella Versione Mobile** | `mobile` / UI | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **TECH-001** | **Verifica & Ottimizzazione Bundle APK Android (Code-Splitting)** | `build` / APK | N/A | 🟢 Completato | Media |
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
- **Inserimento Rapido Prezzi Desktop**: Modale espanso `max-w-5xl` senza scrollbar orizzontale, campo quantità fino a 3+ cifre e pulsante `+` nel titolo colonna Negozio.
- **Fix Z-Index Negozio Mobile**: Modale di selezione e creazione negozio portati a `z-[20000]` per sovrapporsi correttamente alla modale rapida mobile.
- **Invarianza Case-Insensitive Gruppi**: Invito membri nei gruppi spesa reso totalmente case-insensitive lato backend.

---

## 📱 2. Funzionalità & UX Versione Mobile

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

### [FEAT-009] Restyling & Rifinitura Grafica Schermate SuperUser (Admin Panel)

#### 📝 Descrizione
Rifinire, armonizzare e modernizzare visivamente tutte le schermate e sezioni accessibili dal pannello SuperUser / Amministratore (`/admin`), adattandole al design system pulito e moderno dell'applicazione:
- Dashboard Amministrazione (Statistiche e KPI server).
- Gestione Utenti, Ruoli e Permessi.
- Gestione Database, Pulizia Cache e Diagnostica.
- Sezione Feedback, Segnalazioni e Bug Report.

---

### [FEAT-010] Database & Sincronizzazione Centralizzata Citazioni Giornaliere (Quotes)

#### 📝 Descrizione
Centralizzare le citazioni giornaliere (Quotes) tramite tabella database dedicata nel backend, in modo che tutti gli utenti e tutti i dispositivi visualizzino la stessa identica citazione del giorno in modo sincronizzato e consistente.

#### 🎯 Obiettivi
1. Creazione modello/tabella `quotes` (id, quote_text, author, category, scheduled_date/active).
2. Endpoint API REST per la restituzione della citazione odierna del server.
3. Hook frontend sincronizzato con cache TanStack Query.

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

#### 🔄 4. Analisi Integrazioni Esterne & Sincronizzazione (Goodreads, Fable, TV Time)
- **Fattibilità Sincronizzazione Piattaforme Esterne**:
  - **Goodreads, Fable & TV Time**: Piattaforme chiuse / senza API pubbliche attive con permessi di scrittura (Goodreads ha chiuso il programma sviluppatori nel 2020; Fable e TV Time sono sistemi proprietari chiusi). La **sincronizzazione bidirezionale automatica** (lettura e scrittura diretta nei due sensi) **non è realizzabile**.
  - **Goodreads Feed RSS (Sincronizzazione Monodirezionale in Sola Lettura)**: Goodreads mette a disposizione per ciascun utente un **Feed RSS pubblico**. Inserendo l'URL del proprio Feed RSS nelle impostazioni di Smart Agenda, l'app può leggere periodicamente i libri aggiunti/modificati su Goodreads (`to-read`, `currently-reading`, `read`) e popolare la libreria in automatico (Goodreads ➔ Smart Agenda).
- **Servizi Aperti e Gratuiti per Ricerca Libri, Copertine & Metadati**:
  - **Google Books API**: Gratuita e immediata. Permette la ricerca per titolo, autore o ISBN recuperando in automatico copertina, descrizione/trama, autore, numero pagine e data di pubblicazione.
  - **Open Library API**: Database gratuito e open-source gestito da Internet Archive.
  - **Hardcover API**: Piattaforma moderna per lettori con API pubblica per metadati e catalogazione.
  - **TMDB API (The Movie Database)**: Ricerca automatica di locandine, trame, cast e tracking stagioni/episodi per Film e Serie TV.

#### 📐 5. Struttura Dati & Tipizzazione TypeScript (Strict - Zero `any`)
Standardizzazione rigorosa delle interfacce per la ricerca libri e la sincronizzazione RSS:
```typescript
// --- Google Books API ---
export interface BookImages {
  smallThumbnail?: string;
  thumbnail?: string;
}

export interface BookVolumeInfo {
  title: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  imageLinks?: BookImages;
}

export interface BookItem {
  id: string;
  volumeInfo: BookVolumeInfo;
}

export interface GoogleBooksResponse {
  totalItems: number;
  items?: BookItem[];
}

export interface BookSearchState {
  books: BookItem[];
  isLoading: boolean;
  errorMessage: string | null;
}

// --- Sincronizzazione Goodreads Feed RSS ---
export type ReadingStatus = 'to-read' | 'currently-reading' | 'read';

export interface GoodreadsBook {
  id: string;
  title: string;
  author: string;
  userRating: number; // 0..5
  userReview: string;
  bookLink: string;
  imageUrl: string;
  status: ReadingStatus;
  dateAdded: string;
}

export interface GoodreadsSyncState {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  rssUrl: string;
  importedBooks: GoodreadsBook[];
  errorMessage: string | null;
}
```

#### 🏗️ Requisiti Architetturali & Integrazione
- **Backend**: Nuovo dominio modulare `backend/domains/media/` o suddiviso con modelli SQLAlchemy dedicati (`MediaItem`, `BookProgress`, `SeriesSeasonProgress`, `MediaReview`, `MediaExternalSync`).
- **Frontend Desktop**: Nuova voce di navigazione laterale con vista a schede (Tab: *Tutti*, *Libri*, *Film*, *Serie TV*) e visualizzazione a griglia di locandine o elenco tabellare con filtri, ricerca Google Books e import RSS.
- **Frontend Mobile**: Schermata dedicata nell'hub mobile con schede swipeabili, interfaccia card compatta, azioni rapide con un tap (es. segna come visto, avanza episodio, aggiorna pagina libro).

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

### [FEAT-006] Riorganizzazione Hub Spesa, Ricettario, Meal Prep & Wishlist Oggetti

#### 📝 Descrizione
Evoluzione della sezione Spesa in un ecosistema integrato e modulare per la gestione completa dell'alimentazione, della pianificazione pasti, della spesa e dei desideri di acquisto non alimentari.

#### 🍳 1. Ricettario Personale (Cookbook)
- **Gestione Ricette**: Titolo, foto/copertina del piatto, tempo di preparazione/cottura, porzioni/dosi, categoria (Primi, Secondi, Contorni, Dolci, Salse), passaggi di preparazione e note personali.
- **Ingredienti Strutturati**: Ogni ricetta include una lista di ingredienti con quantità e unità di misura (es. 300g pasta, 2 spicchi aglio, 50ml olio).
- **Azione Rapida "Aggiungi alla Lista Spesa"**: Pulsante touch/click con modale interattiva che permette di selezionare gli ingredienti desiderati (deselezionando quelli già presenti in dispensa) e aggiungerli direttamente nella lista della spesa prescelta.

#### 🥗 2. Meal Prep & Pianificazione Pasti
- **Planner Settimanale / Calendario Pasti**: Griglia settimanale e giornaliera suddivisa in fasce orarie (*Colazione, Pranzo, Cena, Snack/Spuntini*).
- **Assegnazione Ricette o Piatti Liberi**: Possibilità di trascinare o selezionare ricette dal ricettario oppure scrivere piatti al volo.
- **Generatore Automatico Lista Spesa**: Funzione intelligente che esamina i pasti pianificati per i giorni selezionati (es. "Prossimi 7 giorni"), raggruppa e somma tutti gli ingredienti necessari (es. 200g farina + 300g farina = 500g farina) e genera automaticamente una lista della spesa pronta per gli acquisti.

#### 🛍️ 3. Wishlist Oggetti & Desideri (Acquisti Non Alimentari)
- **Separazione Netta dalla Spesa Alimentare**: Spazio dedicato per salvare e ricordare oggetti, elettronica, libri, vestiti, attrezzi o idee regalo che si intende acquistare in futuro.
- **Dati Tracciati**: Nome oggetto, prezzo stimato o attuale, link allo store online / e-commerce, livello di priorità/desiderio (*Bassa, Media, Alta*), immagini e note descrittive (es. taglia, colore, codice modello).
- **Stato Oggetto**: `In lista desideri`, `In attesa offerta/sconto`, `Ordinato`, `Acquistato`.

#### 🏠 4. Dashboard / Homepage Riassuntiva Shopping (Valutazione UX)
- **Hub Panoramico**: Valutazione se creare una vista principale di riepilogo con:
  - Widget liste spesa attive con barra di avanzamento articoli spuntati.
  - Box "Cosa si mangia oggi" (pasti del giorno estratti dal Meal Prep).
  - Alert prodotti in scadenza in dispensa/frigorifero.
  - Accesso rapido a Ricettario, Meal Prep, Fornitori e Wishlist.

---

### [FEAT-007] Sistema di Amicizie & Condivisione Recensioni (Social & Sharing Network)

#### 📝 Descrizione
Studio e architettura di un sistema di connessione tra utenti (*Amicizie / Family & Friends Network*) per consentire la condivisione sociale di contenuti personali, con priorità iniziale per le recensioni e valutazioni della sezione Media (Libri, Film, Serie TV), ed estendibile a ricette e liste.

#### 👥 1. Architettura delle Relazioni & Amicizie
- **Ricerca & Connessione Utenti**: Ricerca per username o email, invio richiesta di amicizia, gestione stati (`pending`, `accepted`, `rejected`, `blocked`), lista amici attiva.
- **Livelli di Privacy & Visibilità**: Configurazione granulare dei permessi per ogni contenuto creato:
  - `Privato` (visibile solo all'autore).
  - `Solo Amici` (visibile agli utenti confermati nella propria lista amici).
  - `Gruppo/Famiglia` (visibile ai membri di un gruppo condiviso).

#### 🍿 2. Condivisione Recensioni & Valutazioni Media (Film, Serie TV, Libri)
- **Feed Attività Amici**: Timeline/Bacheca per visualizzare in tempo reale cosa stanno leggendo, guardando o valutando i propri amici (es. *"Marco ha votato 5 stelle e recensito 'Dune - Parte Due'"*).
- **Schede Titolo Arricchite con Recensioni Amici**: Quando si visualizza la pagina di dettaglio di un film, serie o libro, mostrare in evidenza i commenti, i voti e le note lasciate dai propri amici.
- **Consigli Diretti**: Pulsante rapido per raccomandare un titolo specifico a un amico con una nota personalizzata.

#### 🌐 3. Estensioni Future del Sistema Social
- Condivisione ricette preferite dal proprio Ricettario verso il ricettario di un amico.
- Condivisione wishlist desideri per facilitare regali di compleanno, festività o occasioni speciali.
- Condivisione collaborativa di liste tematiche (es. "Ristoranti consigliati", "Posti da visitare").

---

### [FEAT-011] Sezione Lavoro & Gestione Turni di Lavoro

#### 📝 Descrizione
Nuovo modulo dedicato alla gestione delle attività lavorative, tracciamento degli orari e organizzazione dei turni di lavoro.

#### ❓ Punti da Definire & Note Operative
- ⚠️ **Da chiedere a Daniela**: Pianificare un confronto con Daniela per stabilire i requisiti e l'impostazione ideale della sezione:
  - Tipologia e modello dei turni (turni rotanti, riposi, orari spezzati, reperibilità, straordinari).
  - Modalità di visualizzazione grafica (vista calendario turni dedicata, badge nei giorni dell'agenda o prospetto mensile).
  - Tracciamento delle ore lavorate, note sui singoli turni e calcoli/statistiche periodiche.

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
- [ ] **Integrazione API Esterne per Media**: Ricerca automatica di copertine, trame, autori e metadati per libri (Google Books API, Open Library, Hardcover) e film/serie TV (TMDB).
- [ ] **Sincronizzazione Feed RSS Goodreads**: Import automatico monodirezionale periodico dei libri (`to-read`, `currently-reading`, `read`) dal Feed RSS pubblico utente.
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

