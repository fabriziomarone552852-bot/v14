// src/data/changelogData.ts

export interface ChangelogItem {
  id: string;
  version: string;
  date: string;
  title: string;
  isLatest?: boolean;
  published?: boolean;
  highlights?: string[];
  features?: string[];
  improvements?: string[];
  fixes?: string[];
}

export const CHANGELOG_HISTORY: ChangelogItem[] = [
  {
    id: 'v15.0.0',
    version: '15.0.0',
    date: 'Settembre 2026',
    title: 'Redesign UI Libreria Serie TV & Fix TMDB API',
    isLatest: true,
    published: false,
    highlights: [
      'Ridisegnata completamente la dashboard delle Serie TV con una nuova top bar a 3 schede e layout a scomparsa morbida.',
      'Risolto il crash del backend nella ricerca su TMDB dovuto a campi extra non permessi dalla validazione Pydantic.',
      'Risolto un bug che causava il crash dell\'applicazione (Errore 500 senza CORS) quando una Serie TV salvata nel tracking dell\'utente non aveva più i metadati corrispondenti nel catalogo (orfana).',
      'Corretto un bug nel motore di sincronizzazione offline che riprovava all\'infinito le richieste fallite con errori 4xx (es. "Hai già aggiunto questa serie"), intasando la console ad ogni avvio.',
      'Aggiunto un gestore globale degli errori 500 nel backend per scrivere i dettagli dei crash in un file diagnostico `error_500.log` ed evitare blocchi da parte dei browser dovuti alla mancanza di header CORS.',
    ],
    features: [
      'Backend Serie TV Completo: Nuova architettura DB a 5 tabelle con sincronizzazione Lazy Asincrona parallela tramite TMDB per velocità estrema.',
      'Pattern "Diario" (Rewatch): Il tracking degli episodi permette visioni multiple, memorizzando lo storico completo (date e note private).',
      'Privacy (Impostazioni Social): La visibilità delle recensioni delle Serie TV può essere limitata agli amici (friends_only).',
      'Nuovo layout "Prossime Uscite" a carousel orizzontale a fondo sidebar.',
      'Sostituita la card delle citazioni con un widget estetico a nuvoletta.',
      'Immagine di default (no-poster.png) locale come fallback automatico delle locandine.',
      'Implementato swap dinamico tra Calendario mensile e Carousel Locandine in base all\'espansione della citazione.',
    ],
    improvements: [
      'Sostituita la scrollbar primaria con uno scorrimento smussato a gradiente tramite CSS mask-image.',
      'Adottata la modal-scrollbar tenue per integrarsi perfettamente con il tema chiaro.',
      'Rimossi pulsanti ridondanti per preparare lo spazio alla futura integrazione di ricerca inline.',
      'Rifiniti spazi e margini interni della citazione espansa per una lettura più chiara.',
    ],
    fixes: [
      'Corretto problema in .gitignore che bloccava il caricamento del dominio media su GitHub.',
      'Corretto l\'errore 500 durante la chiamata `/search` API abbassando la restrizione StrictBaseModel (`extra="ignore"`) in `backend/domains/trackers/schemas.py`.',
      'Forzata la rimozione completa dei bottoni (frecce) nativi di Chrome sulle scrollbar personalizzate.',
    ],
  },
  {
    id: 'v14.2.12',
    version: '14.2.12',
    date: 'Settembre 2026',
    title: 'Persistenza Immagini su NAS & Fix Volumi Docker',
    isLatest: false,
    published: true,
    highlights: [
      'Risolto il problema di perdita delle immagini al riavvio/aggiornamento del server NAS aggiungendo la mappatura permanente dei volumi Docker per la cartella uploads.',
    ],
    features: [],
    improvements: [],
    fixes: [
      'Aggiunto il flag -v in deploy_nas.sh e configurato il volume in docker-compose.yml per preservare i file multimediali.',
    ],
  },
  {
    id: 'v14.2.11',
    version: '14.2.11',
    date: 'Settembre 2026',
    title: 'Rebranding in "Vita", Nuovo Logo V-Leaf & Refactoring Strict TypeScript',
    isLatest: false,
    published: true,
    highlights: [
      'Rebranding Ufficiale: l\'applicazione si chiama ora "Vita" con il nuovo logo e identità visiva V-Leaf.',
      'Eliminati tutti i cast doppi espliciti (as unknown as ...) sostituendoli con interfacce TypeScript rigorose e tipi nativi estesi.',
      'Semplificata la gestione delle mutazioni delle voci del diario tramite helper tipizzato riutilizzabile (DRY).',
      'Verificato il rispetto totale dei principi architetturali: gestione mazzo di carte in RAM, allegati esclusivamente via URL/link.',
    ],
    features: [
      'Nuovo Rebranding & Logo "Vita": aggiornati il titolo dell\'app, la favicon SVG, i manifesti Web/PWA, le configurazioni Capacitor Android e tutti i testi dell\'interfaccia.',
    ],
    improvements: [
      'Estesa l\'interfaccia Window in global.d.ts per integrare il tipo nativo Capacitor.',
      'Harmonizzate le interfacce temporali DailyEntry e DbMonthlyEntry con la proprietà opzionale dateStr per la massima compatibilità.',
      'apiService.ts: eliminato il pattern try/catch ripetuto 5 volte estraendo executeRequest<T> (DRY).',
      'habitUtils.ts: esportata findActivePeriod come primitiva unica — elimina 4 copie inline della stessa logica.',
      'queryCacheUtils.ts: aggiunta rollbackOnError utility per centralizzare il pattern di rollback ottimistico usato in 8+ mutation hook.',
      'useMonthlyEntryMutations.ts: allineato il tipo queryKey da string[] a QueryKey (coerenza con tutti gli altri hook).',
      'useTaskMutations.ts: rimosso il parametro _queryKey inutilizzato che creava confusione.',
      'dateUtils.ts: deprecata getMonday() con @deprecated, ora delega a getMondayOfCurrentWeek() che usa date-fns.',
      'UseModalResult<unknown> → UseModalResult<null> in CountdownsPageModals, HabitsPageModals, SuppliersPageModals.',
      'HabitsRoutinesSection.tsx: rimossa interfaccia SaveHabitData inutilizzata; corretti Promise<unknown> → Promise<void>.',
      'useRoutineManager.ts: corretti Promise<unknown> → Promise<void> in tutte e 4 le callback.',
      'useShoppingItemMutations.ts: corretta tipizzazione Promise<unknown>[] → Promise<void>[].',
    ],
    fixes: [
      'Rimossi cast ridondanti nel pannello della gerarchia task (TaskFamilyPanel) e nell\'archivio recensioni annuali.',
      'TailscaleGate.tsx: sostituiti 5 console.log/console.error diretti con il logger centralizzato (silenziato in produzione).',
      'HabitsPageModals.tsx: eliminata funzione wrapper handleSaveHabitDefault() inutile (restituiva la stessa funzione ricevuta).',
      'useNoteMutations.ts: rimossi 3 coppie di campi alias (text/testo, dateStr/data_riferimento, variant/tipo) da SaveNotePayload — interfaccia ora chiara e non ambigua.',
      'rruleUtils.ts: estratta setRruleUntil() da useEventMutations — la logica RFC 5545 sta ora in una utility testabile.',
      'useHabitDayMutations.ts: nuovo hook estratto da useAgendaDay (249→120 righe), gestisce tutte le 6 mutation habit/routine. Usa findActivePeriod() dalla utility condivisa.',
      'rollbackOnError() ora adottata concretamente in useNoteMutations, useDailyEntryMutations, useEventMutations, useMonthlyEntryMutations — eliminati 7 blocchi logger+setQueryData ripetuti.',
      'taskUtils.ts: rimossa la funzione privata getLocalDateStr duplicata (→ wrapper inline di formatDateString). File pulito.',
      'Migrazione completa da getLocalDateString (deprecated) a getLocalTodayStr in 8 file consumer: useHabitsPageLogic, NoteModal, HabitNewModal, RoutineNewModal, useEventFormLogic, MobileHabitNewModal, MobileNoteModal, useMobileRoutineFormLogic.',
      '[Mobile] useMobileBingoLogic.ts: fix bug critico — handleCollapse e handleDelete ora in try/catch con finally, cella non rimane più bloccata se il backend fallisce. void esplicito su onToggleDone.',
      '[Mobile] useMobileMoodEventColumnLogic.ts + useMobileDaySelection.ts: Promise<unknown> sostituisce Promise<void> dove i caller restituiscono tipi concreti (number, unknown).',
      '[Mobile] useMobileGoalsAndPrioritiesLogic.ts: listener outside click manuale (14 righe) sostituito con useOutsideClick hook già disponibile.',
      '[Mobile] useMobileSettingsLogic.ts: aggiunti logger.error + extractErrorMessage in tutti e 4 i blocchi catch — debug ora possibile in produzione.',
      '[Mobile] useMobileHomeLogic.ts: logger.error + extractErrorMessage nel catch Google Sync; today/todayStr consolidati in getLocalTodayStr().',
      '[Mobile] useMobileHeaderLogic.ts: formatDateString(new Date()) → getLocalTodayStr().',
      '[Mobile] useMobileDaySelection.ts: pattern batch-delete ripetuto 3 volte estratto in utility batchDelete() — da 3 × 12 righe a 3 × 1 riga + funzione condivisa.',
    ],
  },
  {
    id: 'v14.2.10',
    version: '14.2.10',
    date: 'Settembre 2026',
    title: 'Adattamento Mobile Modale Modifica Prezzo Archivi & Integrazione Roadmap',
    isLatest: false,
    published: true,
    highlights: [
      'Adattato il modale di modifica del prezzo nello storico archivi alla visualizzazione mobile nativa tramite MobileBaseModal (layout bottom-sheet con pulsanti sticky inferiori e sezioni touch-friendly).',
      'Aggiornato il Backlog con i nuovi task di roadmap (Refactoring Continuo CORE-002, Landing Page Predefinita FEAT-012, Filtro Ingranaggio Categorie CAL-002).',
    ],
    features: [],
    improvements: [
      'Migliorata la resa visiva dei form di modifica prezzo su smartphone e tablet, evitando sovrapposizioni e barre di scorrimento desktop.',
    ],
    fixes: [],
  },
  {
    id: 'v14.2.9',
    version: '14.2.9',
    date: 'Settembre 2026',
    title: 'Pre-selezione Liste & Gestione Ruoli (Reader/Editor/Owner) nello Storico Prezzi',
    isLatest: false,
    published: true,
    highlights: [
      'Pre-selezione automatica della lista di appartenenza e dell\'unità di misura all\'apertura del modale di modifica del prezzo nello storico dell\'archivio.',
      'Integrazione completa dei ruoli di gruppo (owner, admin, editor, reader) nel Frontend e Backend per la gestione dei permessi di modifica/eliminazione sui rilevamenti prezzo.',
    ],
    features: [],
    improvements: [
      'Nascosti i pulsanti di azione (matita/cestino) per gli utenti con ruolo Lettore (reader), mostrando i prezzi in sola visualizzazione come per i prodotti di primo inserimento SEED.',
      'Inclusi gli ID di lista e di unità di misura nei payload di risposta delle API dello storico prezzi.',
    ],
    fixes: [
      'Aggiunto il blocco di sicurezza backend (HTTP 403 Forbidden) per tentativi non autorizzati di modifica/eliminazione da parte dei lettori.',
    ],
  },
  {
    id: 'v14.2.8',
    version: '14.2.8',
    date: 'Settembre 2026',
    title: 'Persistenza Salvataggio Prezzi & Collegamento Voci di Lista',
    isLatest: false,
    published: true,
    highlights: [
      'Risolto il problema di mancata o errata persistenza del prezzo unitario durante il salvataggio nelle modali di modifica rilevazione prezzo.',
      'Sincronizzato il calcolo del prezzo totale di acquisto inviato all\'API rispetto al prezzo unitario inserito ed alla quantità acquistata.',
      'Aggiunto il collegamento automatico degli elementi di lista anche per i rilevamenti nati tramite inserimento rapido prezzi.',
    ],
    features: [],
    improvements: [
      'Migliorata la gestione delle note, dell\'unità di misura e della lista di destinazione nelle rilevazioni di prezzo trasversali.',
    ],
    fixes: [
      'Corretto un disallineamento nei payload delle modali di modifica prezzo che causava la ricalcolazione errata del prezzo unitario nel database backend.',
    ],
  },
  {
    id: 'v14.2.7',
    version: '14.2.7',
    date: 'Settembre 2026',
    title: 'Abilitazione Modifica Prezzi Rilevati per Utenti Standard e Gruppi Condivisi',
    isLatest: false,
    published: true,
    highlights: [
      'Abilitata la modifica e il salvataggio dei prezzi e dei lotti registrati nello storico prodotti per tutti gli utenti membri del gruppo e utenti standard dell\'applicazione (non più limitato al solo utente creante).',
      'Corretto il controllo dei permessi sul backend FastAPI per consentire la modifica dei rilevamenti prezzo anche per liste condivise nel medesimo gruppo.',
    ],
    features: [],
    improvements: [
      'Estesa la visibilità e il diritto di modifica dell\'icona matita nei dettagli del prezzo sia su Web Desktop che su Mobile per le rilevazioni non SEED.',
    ],
    fixes: [
      'Risolto un blocco di permessi che impediva agli utenti standard di salvare le modifiche ai prezzi salvati nello storico in ambiente di produzione.',
    ],
  },
  {
    id: 'v14.2.6',
    version: '14.2.6',
    date: 'Settembre 2026',
    title: 'Protezione Dati Seed/SuperUser e Filtro Prodotti Storico Prezzi',
    isLatest: false,
    published: true,
    highlights: [
      'I dati del primo inserimento (lotti/prezzi SEED da database iniziale) sono ora protetti da modifiche ed eliminazioni: i pulsanti di azione vengono mostrati solo agli utenti con privilegi SuperUser.',
      'La scheda Storico Prezzi nell\'archivio spesa mostra ora esclusivamente i prodotti che possiedono rilevazioni di prezzo registrate.',
      'Modale a 2 finestre affiancate (tipo albero delle task): pannello sinistro dedicato a "Dettagli Acquisto" e pannello principale per le proprietà ed etichette del prodotto.',
      'Simmetria visiva perfetta tra il campo Quantità e il campo Unità di Misura.',
      'Modifica completa di prodotti e rilevazioni prezzo nello Storico Prezzi dell\'Archivio (Nome, Marca, Lista, Quantità, Unità, Note, Prezzo, Negozio, Data, Offerta).',
    ],
    features: [
      'Implementata la struttura a due finestre affiancate (`sidePanel`) per i modali di modifica articolo acquistato e rilevazione prezzo.',
      'Aggiunta la possibilità di modificare nome prodotto, marca, lista di destinazione, unità di misura e note prodotto anche quando si modifica un prezzo nello Storico Prezzi dell\'Archivio.',
      'Aggiunto menu a tendina "Associa a Lista" nell\'header del modale di aggiunta rapida prezzi con il componente standard ShoppingListSelect (con apertura della finestra al centro dello schermo su mobile).',
      'Implementato il calcolo automatico bidirezionale tra Prezzo Unitario e Prezzo Totale in tutti i modali della spesa (Quantità × Unitario = Totale oppure Totale / Quantità = Unitario).',
    ],
    improvements: [
      'Adattata l\'altezza del pannello sinistro "Dettagli Acquisto" alla sua dimensione naturale (`h-fit` e `items-start`), eliminando lo spazio vuoto in eccesso sotto la data di acquisto.',
      'Rimosso il pulsante "Elimina" dal footer della modale di modifica del prezzo.',
      'Allineati simmetricamente i campi Quantità e Unità di Misura con etichette visive uniformi.',
      'Configurato l\'aggiornamento automatico e istantaneo in tempo reale dell\'intera applicazione (tabelle, grafici e modali aperte) ad ogni modifica o cancellazione di un prezzo nello storico.',
      'Aggiornato il contatore del badge della scheda "Storico" per calcolare con precisione il numero di prodotti attivi con rilevazioni di prezzo.',
      'Aggiunto il controllo di sicurezza sul backend FastAPI (errori 403 Forbidden) per bloccare tentativi di modifica/cancellazione dei dati SEED o dei lotti altrui da parte di utenti standard.',
    ],
    fixes: [
      'Corretto l\'algoritmo di identificazione dei dati SEED per consentire la piena modifica ed eliminazione di tutti i prezzi e lotti inseriti dagli utenti.',
      'Risolto il problema di condivisione indebita dei prezzi non associati a liste tra utenti non dello stesso gruppo.',
      'Nascosti i tasti di modifica ed eliminazione sui prezzi inseriti da altri utenti se non si è l\'autore o SuperUser.',
    ],
  },
  {
    id: 'v14.2.5',
    version: '14.2.5',
    date: 'Settembre 2026',
    title: 'Caricamento Automatico Prodotti & Lotti SEED Spesa all\'Avvio Backend',
    isLatest: false,
    published: true,
    highlights: [
      'Implementata la verifica ed il popolamento automatico ed idempotente dei prodotti, supermercati/marchi e lotti/prezzi SEED all\'avvio del server backend.',
    ],
    features: [],
    improvements: [
      'Garantita la disponibilità automatica dei prodotti e dello storico prezzi iniziale anche nel database di produzione e per tutti i nuovi utenti che si collegano online.',
    ],
    fixes: [
      'Risolta l\'assenza dei prodotti seed per gli utenti non-admin nella versione online dovuta alla mancata esecuzione automatica del popolamento iniziale sul database PostgreSQL di produzione.',
    ],
  },
  {
    id: 'v14.2.4',
    version: '14.2.4',
    date: 'Settembre 2026',
    title: 'Condivisione Storico Prezzi Admin & Seed per Tutti gli Utenti',
    isLatest: false,
    published: true,
    highlights: [
      'Abilitata la visibilità dei rilevamenti prezzo e lotti creati dall\'utente Admin/Seed (user_id = 1) nello storico prezzi di tutti gli utenti.',
    ],
    features: [
      'Estesi i filtri repository per consentire l\'accesso globale in sola lettura ai prezzi di sistema/seed per qualsiasi utente.',
    ],
    improvements: [],
    fixes: [],
  },
  {
    id: 'v14.2.3',
    version: '14.2.3',
    date: 'Settembre 2026',
    title: 'Miglioramenti Inserimento Rapido Prezzi (Mobile & Desktop), Prezzi SEED e Gestione Gruppi',
    isLatest: false,
    published: true,
    highlights: [
      'Aggiunto il suggerimento autocomplete in tempo reale nella barra di aggiunta rapida della spesa su mobile.',
      'Rettificata la visibilità dei prezzi SEED e di catalogo nello storico prezzi dei prodotti per tutti gli utenti.',
      'Standardizzazione del prezzo: auto-conversione della virgola in punto nei campi prezzo su mobile e desktop.',
    ],
    features: [
      'Aggiunta la possibilità di modificare ed eliminare le rilevazioni di prezzo personali dal modale dettaglio dell\'archivio prezzi.',
      'Aggiunto l\'icona "+" nell\'intestazione della colonna Negozio per creare al volo supermercati dal modale di inserimento rapido prezzi su desktop.',
    ],
    improvements: [
      'Riorganizzato il badge del ruolo (Owner, Admin, Editor) nella lista gruppi spesa desktop, posizionandolo sopra il conteggio delle liste aperte su due righe.',
    ],
    fixes: [
      'Risolto l\'errore "Lotto/Acquisto non trovato" durante la modifica o eliminazione di prezzi registrati da inserimento rapido o senza lista (sostituite le inner join con outerjoin in repo.get_batch).',
      'Integrato il DatePicker dell\'applicazione e la select standard dei negozi (`ShoppingSupplierSelect`) con caricamento automatico nel modale di modifica del prezzo (`ShoppingEditBatchModal`).',
      'Risolto il problema della schermata nera con "{"detail":"Not Found"}" al cambio scheda Chrome/focus finestra: aggiunta la gestione del bypass HTML per le rotte React Router in Vite dev proxy e Nginx.',
      'Resa case-insensitive la ricerca e l\'aggiunta dei membri nei gruppi della spesa (es. "Marcello" equivale a "marcello").',
      'Risolto il problema di Z-Index su mobile per il modale di selezione e creazione negozio nell\'aggiunta rapida dei prezzi.',
      'Ottimizzato il layout del modale inserimento rapido prezzi su desktop: eliminata la scrollbar orizzontale ed ampliato il campo quantità per accogliere numeri a 3+ cifre.',
    ],
  },
  {
    id: 'v14.2.2',
    version: '14.2.2',
    date: 'Settembre 2026',
    title: 'Ottimizzazione del Contesto Build Docker & Fix Crash Daemon Linux Engine',
    published: true,
    highlights: [
      'Introdotto .dockerignore nella radice del progetto per escludere file d\'archivio (.tar), venv e dipendenze dal contesto inviato a Docker Desktop.',
    ],
    fixes: [
      'Risolto il crash del demone Docker Desktop (500 Internal Server Error per dockerDesktopLinuxEngine) causato dal caricamento di oltre 4.5 GB di contesto durante il secondo deploy.',
    ],
  },
  {
    id: 'v14.2.1',
    version: '14.2.1',
    date: 'Settembre 2026',
    title: 'Fix Definitivo Sincronizzazione Orari Google Calendar (Prevenzione Doppio Offset)',
    published: true,
    highlights: [
      'Eliminata la doppia applicazione del fuso orario (+2h) su Google Calendar allineando la trasmissione al formato nativo di Google API v3.',
    ],
    fixes: [
      'Rimossa la combinazione conflittuale dell\'offset UTC (+02:00) con la proprietà timeZone nei payload per Google Calendar, risolvendo definitivamente lo slittamento di 2 ore nell\'orario degli impegni.',
    ],
  },
  {
    id: 'v14.2.0',
    version: '14.2.0',
    date: 'Settembre 2026',
    title: 'Upload Foto da Dispositivo, Caching Immagini Locale & Ottimizzazione WebP',
    published: true,
    highlights: [
      'Modalità Offline-First con caching locale su IndexedDB (TanStack Query Persist) e sincronizzazione automatica delle modifiche (Outbox Pattern).',
      'Caricamento istantaneo dell\'app con zero latenza e consultazione completa di task, eventi, note, abitudini e liste spesa anche senza rete o con Tailscale in riconnessione.',
      'Caricamento diretto di foto dal dispositivo (smartphone e PC) nei form di Routine e Countdown.',
      'Supporto completo e nativo per GIF animate, preservate al 100% fotogramma per fotogramma con loop continuo.',
      'Caching e download automatico sul server per le immagini inserite tramite URL web, evitando link rotti.',
      'Salvataggio su filesystem del server anziché su database, con riduzione del 95%+ dello spazio.',
      'Compressione e ridimensionamento a 960px in formato WebP per foto statiche, ultraleggere sui banner.',
      'Sistema integrato per la segnalazione errori, feedback e bug report con contesto diagnostico automatico e gestione SuperUser.',
      'Risolto lo sfasamento orario di 2 ore nella sincronizzazione degli eventi con Google Calendar.',
      'Pre-selezione automatica della data corrente visualizzata durante la creazione di eventi nella DayPage Mobile.',
    ],
    features: [
      'Architettura Offline-First: persistenza locale asincrona su IndexedDB tramite `@tanstack/react-query-persist-client` e `idb-keyval`.',
      'Coda Outbox per mutazioni offline: inserimento, modifica ed eliminazione di task, note e spesa eseguiti offline vengono sincronizzati automaticamente al ritorno online.',
      'Indicatore di stato connettività (Badge Online/Offline/Sincronizzazione) e modale di gestione/ispezione della coda.',
      'Nuovo pulsante "Foto" nei form Desktop e Mobile per selezionare un\'immagine dalla galleria o scattarla direttamente da smartphone.',
      'Nuovo dominio Media nel backend FastAPI con endpoint dedicati `/media/upload` (multipart) e `/media/fetch-url` (download asincrono).',
      'Nuova modale universale Feedback & Segnalazione Errori accessibile da Changelog, Impostazioni, Schermate di Errore ed Error Boundary.',
      'Nuova scheda "Feedback & Bug Report" nel pannello Amministratore (`/admin`) con filtri, visualizzazione screenshot e gestione stati/note.',
      'Gestione intelligente dei formati: salvataggio as-is per GIF animate e pipeline WebP con correzione EXIF per foto statiche.',
      'Serving statico della cartella `/uploads` direttamente dal backend con risoluzione trasparente degli URL per Web e App Mobile (Capacitor/Tailscale).',
    ],
    improvements: [
      'Cache retention locale a 7 giorni per mantenere disponibili i dati per consultazione offline prolungata.',
      'Aggiornamenti ottimistici e intercettazione automatica dei fallimenti di rete per non bloccare l\'utente durante l\'uso offline.',
      'Raccolta automatica del contesto tecnico e telemetria (versione app, piattaforma, log API recenti, risoluzione schermo) per agevolare il debug.',
      'Refactoring e snellimento modulare dell\'intero frontend: scomposizione di AdminFeedbackSection, FeedbackModal, MobileFeedbackModal, useMobileDayLogic, MobileDayView, useShoppingItemsColumn e useYearEntries in sotto-hook e componenti specializzati (DRY e TypeScript Strict senza any).',
      'Cattura automatica dei crash React in Error Boundary con possibilità di segnalazione immediata all\'amministratore.',
      'Database alleggerito: memorizza solo il percorso relativo e non file binari pesanti.',
      'Risoluzione calibrata a max 960px: ideale per banner nitidi e leggeri (~30-50 KB).',
      'Mantenimento della struttura grafica e del layout del frontend senza stravolgimenti.',
      'Download automatico e trasparente dell\'immagine quando viene incollato un URL web esterno.',
      'Gestione bidirezionale accurata del fuso orario del calendario Google con allineamento agli orari locali.',
    ],
    fixes: [
      'Prevenzione dei link rotti causati da immagini esterne cancellate o modificate sul web.',
      'Corretto l\'orario degli eventi inviati a Google Calendar (risolto l\'offset di +2 ore).',
      'La creazione di un evento dalla DayPage Mobile imposta automaticamente la data del giorno visualizzato anziché quella odierna.',
    ],
  },
  {
    id: 'v14.1.0',
    version: '14.1.0',
    date: 'Settembre 2026',
    title: 'Timbri Bingo, Spunta Rapida Spesa & Gestione Prezzi Opzionali',
    published: true,
    highlights: [
      'Spunta rapida a 1-click degli articoli della spesa con long-press per inserire prezzo e dettagli.',
      'Prezzo di acquisto reso opzionale con esclusione automatica di record a 0€ dalle statistiche e dal prezzo più basso.',
      'Nuovo set di 5 timbri principali estratti casualmente al completamento di ciascuna casella Bingo.',
      'Aggiunto un raro timbro Easter Egg (Clown) con probabilità di comparsa dell\'1%.',
      'Persistenza e sincronizzazione istantanea del timbro assegnato e della rotazione tra Web e Mobile.',
      'Risolto il crash nell\'apertura del modale di dettaglio Routine e nel completamento delle abitudini.',
    ],
    features: [
      'Spunta rapida (1-click check): cliccando sul cerchietto l\'articolo viene segnato come acquistato all\'istante senza obbligo di modale.',
      'Long-press sul cerchietto di spunta (Web & Mobile) per aprire il modale dettagliato di registrazione acquisto.',
      'Prezzo di acquisto facoltativo nel modale con rimozione del valore di default 0 e del blocco di validazione.',
      'Sistema di selezione casuale dei 5 timbri standard (Stella, Fiore, Quadrifoglio, Uva, Coccinella) con distribuzione equa.',
      'Timbro speciale Easter Egg (stamp-clown) con probabilità dell\'1%.',
      'Nuova colonna `timbro` nella tabella database `bingo` con migrazione Alembic per salvare il timbro estratto.',
      'Integrazione visiva in tutte le viste Bingo: BingoCard, BingoModal, MiniBingoCard, MobileBingoGridSlot e MobileBingoExpandedCard.',
    ],
    improvements: [
      'Esclusione sistematica di prezzi nulli o <= 0 dal calcolo del miglior prezzo, prezzo medio, storico prezzi e prezzi community.',
      'Visualizzazione del prezzo stimato/ultimo solo in presenza di prezzi positivi reali.',
      'Architettura modulare dei timbri (`bingoStamps.ts`) con caricamento dinamico e supporto a futuri asset.',
      'Sincronizzazione coerente tra interfaccia Desktop e Mobile per rotazione e stile del timbro.',
      'Configurazione del proxy di sviluppo Vite per inoltro automatico di tutte le rotte API al backend FastAPI.',
      'Supporto a rotte backend con e senza trailing slash per prevenire errori di routing HTTP.',
    ],
    fixes: [
      'Risolto il problema di propagazione dell\'evento click sul cerchietto di spunta rapida che causava l\'apertura involontaria del modale di dettaglio.',
      'Risolta la distorsione del prezzo più basso e del prezzo medio in Spesa quando venivano registrati articoli senza indicazione di prezzo.',
      'Risolto errore `TypeError: Cannot read properties of undefined (reading \'localeCompare\')` all\'apertura del modale storico di Routine e Abitudini.',
      'Corretto errore `405 (Method Not Allowed)` durante l\'incremento e decremento dei log abitudini (`/habit-log`).',
      'Corretta la sincronizzazione e rimozione ottimistica dei log a conteggio zero in cache locale.',
    ],
  },
  {
    id: 'v14.0.0',
    version: '14.0.0',
    date: 'Settembre 2026',
    title: 'Aggiornamento Mobile, Quick Price & Changelog',
    published: true,
    highlights: [
      'Nuova sezione Info & Changelog accessibile dalle impostazioni Desktop e Mobile.',
      'Risolto il comportamento del tocco per aprire il popover del giorno nel calendario mensile mobile.',
      'Aggiunto l\'indicatore con i tre puntini (•••) e calcolo dinamico dello spazio nella colonna Task in Homepage Mobile.',
      'Prezzo iniziale di default a 0 € nella registrazione e acquisto articoli dello shopping.',
    ],
    features: [
      'Sezione Changelog & Info Versione con storico dettagliato delle note di rilascio.',
      'Pulsante rapido informazioni "i" nella testata delle Impostazioni Utente Desktop.',
      'Nuova voce di navigazione "Info & Changelog" nelle Impostazioni Mobile con badge di versione.',
      'Script di compilazione APK dinamico con denominazione automatica versionata.',
    ],
    improvements: [
      'Impostato il prezzo di default a 0 € nei form di acquisto rapido (Quick Price) e acquisto singolo/bulk.',
      'Calcolo dinamico con ResizeObserver per le task visibili nella Homepage mobile.',
      'Puntini di espansione (•••) perfettamente allineati tra DayPage e HomePage.',
    ],
    fixes: [
      'Risolto il bug sui dispositivi touch che causava il doppio toggle istantaneo del popover nel calendario mensile.',
      'Migliorata la gestione del long press a 500ms per la navigazione alla pagina del giorno senza interferire con lo swipe.',
      'Soppresso il click accidentale al termine di gesti di trascinamento e scorrimento.',
    ],
  },
  {
    id: 'v13.5.0',
    version: '13.5.0',
    date: 'Agosto 2026',
    title: 'Sincronizzazione Google Calendar & Ottimizzazioni Mobile',
    published: true,
    highlights: [
      'Integrazione bidirezionale con Google Calendar.',
      'Selezione multipla ed eliminazione massiva eventi e task su mobile.',
      'Nuovo hub per le liste e lotti della spesa con gestione sconti e offerte.',
    ],
    features: [
      'Sincronizzazione Google Calendar con feedback visivo dello stato.',
      'Selezione multipla avanzata su Mobile con barra azioni dedicata.',
      'Nuovi filtri per data, marca e fornitore nell\'archivio spesa.',
    ],
    improvements: [
      'Refactoring dei form modali con validazione in tempo reale.',
      'Ottimizzazione delle animazioni e delle transizioni tra schermate.',
    ],
    fixes: [
      'Corretta la visualizzazione degli eventi a cavallo di più giorni nella vista mensile.',
      'Risolti problemi minori di memorizzazione dello stato dei filtri.',
    ],
  },
  {
    id: 'v13.0.0',
    version: '13.0.0',
    date: 'Luglio 2026',
    title: 'Nuova Architettura Modulare & Modulo Shopping',
    published: true,
    highlights: [
      'Ristrutturazione completa dell\'architettura frontend a moduli e domini dedicati.',
      'Rilascio del nuovo modulo Shopping con gestione liste, prodotti, fornitori e prezzi.',
      'Supporto per la connessione remota sicura con Tailscale Tsnet.',
    ],
    features: [
      'Modulo Shopping completo con storico prezzi e confronto fornitori.',
      'Nuova gestione delle abitudini, routine e countdown con immagini personalizzabili.',
      'Integrazione Tailscale VPN per sincronizzazione nativa su rete privata.',
    ],
    improvements: [
      'Riduzione del tempo di avvio e code-splitting avanzato con Vite.',
      'Refactoring del backend FastAPI con schemi Pydantic rigorosi.',
    ],
    fixes: [
      'Risolti errori di rendering nelle griglie calendario ad alta densità.',
      'Migliorata la persistenza dei token di autenticazione.',
    ],
  },
];

export const APP_VERSION: string = CHANGELOG_HISTORY[0].version;
export const APP_VERSION_NAME: string = `v${APP_VERSION}`;
export const APP_LAST_UPDATE: string = CHANGELOG_HISTORY[0].date;

















