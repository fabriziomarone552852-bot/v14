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
    id: 'v15.1.0',
    version: '15.1.0',
    date: 'Ottobre 2026',
    title: 'Sincronizzazione Bingers, Esperienza Mobile Serie TV Evoluta & Hub Amministrazione Spesa',
    isLatest: true,
    published: false,
    highlights: [
      'Sincronizzazione Bidirezionale Serie TV con Bingers (TRACKERS-014): Importazione ed esportazione completa di libreria, puntate viste, voti, recensioni e liste tematiche tra Vita e file CSV/ZIP di Bingers, con fetch automatico asincrono da TMDB e calibrazione trasparente della scala voti (1-5 vs 1-10).',
      'Esperienza Mobile Serie TV Evoluta: Nuova schermata centrale "Diario Puntate" con storico visioni naturale, navigazione swipe a 3 pagine circolari continue, modale statistiche nativo full-screen, catalogo a 4 aree tematiche con bordi di stato e supporto avanzato al rewatch.',
      'Aggiornamento Ottimistico & TrackerToast (TRACKERS-005): Latenza azzerata (0ms) in RAM e nella cache TanStack Query per spunta puntate, visualizzazioni rewatch e citazioni; eliminati gli alert bloccanti di sistema in favore del nuovo componente in-app TrackerToast.',
      'Notifiche & Bottom Sheet Mobile (NOTIF-001): Indicatore rosso pulsante sull\'header mobile e campanella nel footer del drawer per accedere al foglio notifiche touch-friendly con navigazione diretta alle recensioni senza salti visivi intermedi.',
      'Spesa, Marchi & Console SuperUser: Valutazione qualitativa dei brand [👍|👎] con note permanenti, tracciamento fisico brand_id nei lotti, campi numerici decimali universali (virgola e punto), Data Grid amministrativa e backup database compresso sul NAS.'
    ],
    features: [
      'Sincronizzazione Bingers: Upload drag & drop di singoli file CSV o archivi ZIP esportati da Bingers, fetch automatico TMDB per titoli non in catalogo ed esportazione a 1-click in archivio ZIP conforme allo standard.',
      'Notifiche Mobile & Navigazione Diretta: Bottom sheet touch-friendly con schede per notifiche e messaggi effimeri; apertura istantanea della specifica recensione o gruppo spesa con overlay di caricamento contestuale.',
      'Gestione Serie Abbandonate ("Drop") & Ripristino: Opzione touch su smartphone e pulsante ad effetto glass su desktop per escludere o ripristinare le serie, con bordo rosso di stato e collocazione in coda al catalogo.',
      'Diario Episodi & Navigazione Circolare: Slide centrale Diario con storico dal basso verso l\'alto, sezioni "I prossimi da guardare", "Da riprendere" e "Nuove serie" (escludendo gli speciali S00), e swipe continuo a 3 schermate.',
      'Statistiche Serie TV Full-Screen: Modale mobile a schermo intero con sezioni Panoramica (tempo totale, binge record, cimitero serie), Voti (istogramma e Hall of Fame), Abitudini di visione e riepilogo Rewatch.',
      'Catalogo Mobile & Ricerca Dedicata: 4 aree tematiche (In visione, In lista, In attesa, Completate) con pillole grigie sobrie, bordi di stato coordinati e ricerca avanzata filtrata in RAM.',
      'Liste Personali Serie TV Mobile: Card orizzontali con collage dinamico delle locandine, selezione multipla con long-press, ordinamento a due frecce e modale di creazione touch-friendly.',
      'Dettaglio Episodio & Recensioni: Vista episodio a tutto schermo con still backdrop HD, cassetto visioni multiple e schermata form ancorata a pieno schermo con altezza dinamica.',
      'Valutazione Brand & Sottomarche: Gradimento marchi a 1 tap [👍|👎], inserimento rapido catalogo con storico prezzi e creazione al volo di nuovi marchi/fornitori dalla Data Grid lotti.',
      'Backup & Restore Database su NAS: Salvataggio compresso (.json.gz) delle 40 tabelle dell\'applicazione con ripristino atomico protetto ed esportazione completa degli snapshot seed CSV.'
    ],
    improvements: [
      'Centralizzazione Architettura Notifiche (useNotificationsInbox): Hook unificato condiviso tra desktop e mobile per la gestione dello stato notifiche e il conteggio non letti, eliminando duplicazioni di codice.',
      'Aggiornamento Ottimistico Reattivo: Sincronizzazione immediata della cache TanStack Query per toggle puntata, conteggi rewatch e citazioni memorabili a 0ms prima della risposta server.',
      'Audit Notifiche & Feedback Leggero: Eliminazione sistematica di window.alert in favore del componente in-app TrackerToast discreto e auto-scomparente a 2.5s.',
      'RatingUtils & Media Voti Episodi: Centralizzazione del calcolo del voto medio personale e arrotondamento a mezze stelle, visualizzato con StarRating anche nella scheda stagioni desktop.',
      'Campi Decimali Universali (decimalUtils): Rimozione di input type="number" in favore di type="text inputMode="decimal" con parsing trasparente di virgola e punto su qualsiasi browser.',
      'Separazione Logica-UI & File Snelli: Scomposizione dei macro-componenti Trackers e Spesa in componenti visivi snelli (<300 righe) e custom hook dedicati nel rispetto del principio DRY.',
      'Z-Index & Back Handler Mobile: Calibrazione degli z-index e gestione prioritizzata del tasto fisico/gesture "Indietro" di Android per prevenire chiusure accidentali delle schermate.'
    ],
    fixes: [
      'Calibrazione Scala Voti Bingers: Moltiplicazione per 2 in import (1-5 stelle convertite in 1-10 su DB) e divisione per 2 in export, con aggiornamento retrocompatibile automatico.',
      'Tracciamento Brand nei Lotti Spesa: Aggiunta della colonna brand_id in inventory_batch per distinguere correttamente gli acquisti di articoli multi-marca.',
      'Stagioni Collassate di Default su Mobile: Corretto il comportamento del modale serie, mantenendo le stagioni chiuse all\'ingresso.',
      'Anti-Clipping Locandine Desktop: Ottimizzato il padding del catalogo desktop e l\'ordine z-index per evitare che l\'ingrandimento hover sulle locandine venga tagliato dal bordo.',
      'Precisione Quantità Spesa: Migrazione NUMERIC(12,3) applicata su database per preservare pesature al banco senza troncamenti.',
      'Stabilità Associazione Prodotti-Brand: Corretta la chiamata di aggiornamento del legame prodotto-brand nel backend, eliminando errori 500.',
      'Inizializzazione Sicura Sequenze DB: Risolti conflitti di chiave primaria e allineate le sequenze PostgreSQL all\'avvio del server backend.'
    ]
  },
  {
    id: 'v15.0.3',
    version: '15.0.3',
    date: 'Ottobre 2026',
    title: 'Allineamento Migrazioni Database Produzione (NAS) & Fix Login HTTP 500',
    isLatest: false,
    published: true,
    highlights: [
      'Risolto l\'errore HTTP 500 in fase di login sul NAS dovuto a colonne utente mancanti nel database PostgreSQL di produzione.',
      'Rese completamente idempotenti le migrazioni Alembic storiche e allineato il database di produzione alla versione HEAD.'
    ],
    fixes: [
      'Login & Auth (/auth/login): Ripristinata la corretta autenticazione degli utenti eliminando il fallimento della query users causato dal disallineamento dello schema PostgreSQL.',
      'Alembic Migrations Idempotency: Bonificate le migrazioni storiche con clausole IF NOT EXISTS e if_exists=True per prevenire fallimenti su database parzialmente migrati.',
      'Script alembic-prod.bat: Aggiornata la configurazione per puntare direttamente all\'IP del server NAS (192.168.11.20) dall\'ambiente di sviluppo host.'
    ]
  },
  {
    id: 'v15.0.2',
    version: '15.0.2',
    date: 'Ottobre 2026',
    title: 'Risoluzione 502 Bad Gateway NAS & Automated Docker Smoke Test',
    isLatest: false,
    published: true,
    highlights: [
      'Risolto il crash in avvio del Backend FastAPI (NameError date non definita nel modulo trackers) che impediva l\'avvio del container e causava l\'errore 502 Bad Gateway tramite Nginx.',
      'Aggiunto Smoke Test automatico in deploy_build_pc.ps1 per verificare tempestivamente l\'avvio corretto dei container backend.'
    ],
    fixes: [
      'Backend Crash Loop (Porta 8000 / 502 Bad Gateway): Corretto import mancante di date e abilitato __future__.annotations in backend/domains/trackers/service.py.',
      'Deploy Pipeline PC & NAS: Integrato test di avvio automatico del container backend in deploy_build_pc.ps1 e diagnostica immediata dello stato dei container in deploy_nas.sh.'
    ]
  },
  {
    id: 'v15.0.1',
    version: '15.0.1',
    date: 'Ottobre 2026',
    title: 'Fix Reverse Proxy Nginx & Crash AppShellLayout in Docker',
    isLatest: false,
    published: true,
    highlights: [
      'Risolto il crash TypeError al caricamento dell\'applicazione nei container Docker.',
      'Allineamento completo delle route nel reverse proxy Nginx per interazioni, social, trackers e feedback.'
    ],
    fixes: [
      'Reverse Proxy Nginx & Crash AppShellLayout (Docker): Aggiunte le route mancanti in nginx.conf e introdotta una guardia anti-fallback in apiService per prevenire risposte HTML su endpoint JSON.'
    ]
  },
  {
    id: 'v15.0.0',
    version: '15.0.0',
    date: 'Ottobre 2026',
    title: 'Modulo Serie TV (Trackers), Nuova Inbox Notifiche & Refactoring Architetturale',
    isLatest: false,
    published: true,
    highlights: [
      'Nuova Sezione Serie TV (Modulo Media): Gestione completa con sincronizzazione TMDB, liste personalizzate, statistiche e tracking episodi avanzato.',
      'Architettura Liste Multimediali: Creato database e backend per raggruppare film, serie e libri trasversalmente.',
      'Nuova Inbox Notifiche: Hub unificato per messaggi effimeri, richieste amicizia, notifiche di sistema e inviti ai gruppi spesa.',
      'Menzioni (@username) & Interazioni Social: Autocompletamento, commenti a thread e notifiche con deep-linking diretto alle recensioni degli amici.',
      'Zero "any" & Architettura Piuma: Bonifica rigorosa TypeScript Strict al 100% nel frontend e scomposizione modulare dei controller complessi.'
    ],
    features: [
      'Incrocio Liste Amici: Calcolo intersezione serie TV e film condivisi tra utenti per decidere cosa guardare insieme.',
      'Ricerca & Filtri Avanzati TMDB: Motore di ricerca globale con filtri dinamici (genere, piattaforme JustWatch, anno) e badge interattivi.',
      'Statistiche & Abitudini di Visione: Modale analitico con grafici su andamento temporale, ore/episodi visti, distribuzioni genere/piattaforma e rating profilato.',
      'Estrazione Casuale Serie TV: Strumento per estrarre casualmente una serie TV dalla propria lista o tra quelle da iniziare.',
      'Pattern Diario (Rewatch) & Tracking Stagioni: Supporto per visioni multiple degli episodi, calcolo automatico dello stato e date di trasmissione.',
      'Interazioni Social & Commenti Recensioni: Commenti a thread con privacy granulare, menzioni (@username) e invio di messaggi effimeri.',
      'Pannello Amministrazione Avanzato (SuperUser): Gestione utenti, reset password con generatore sicuro e diagnostica risorse collegate.',
      'Manutenzione DB, Configurazione & Telemetria: Monitoraggio latenza e storage upload, sincronizzazione sequenze PostgreSQL ed eliminazione account disattivati.',
      'Inserimento Rapido Scontrini (Admin): Interfaccia tabellare rapida per imputare scontrini multi-riga con autocompletamento predittivo.',
      'Catalogo A-Z & Gestione Multipla Spesa: Vista tabellare per inserimento rapido articoli con checkbox e selezione multipla per spostamento o cancellazione massiva.',
      'Refactoring Catalogo Prodotti: Introduzione della tabella ponte N:N shopping_product_brands per associare molteplici brand a un prodotto con note e gradimento.',
      'Controllo Aggiornamenti In-App (Mobile): Verifica automatica della versione sul server con avviso di aggiornamento e link per il download dell\'ultimo APK.'
    ],
    improvements: [
      'Bonifica Integrale TypeScript Strict: Eliminazione totale di ogni tipo any e cast espliciti in tutto il frontend.',
      'Scomposizione Architetturale Modulo Serie TV: Suddivisione dei macro-file (SeriesDetailModal, EpisodeDetailView, SeriesReviewTab) in componenti snelli e hook dedicati.',
      'Controller & Componenti Recensioni Modulari: Incapsulamento dello stato form con gestione isolata di commenti e menzioni.',
      'Standardizzazione Strutturale Cartelle: Riorganizzazione pulita in components/trackers, hooks/trackers, utils/ratingUtils e views/TVSeriesPage.',
      'Architettura DRY & Logica Mazzo di Carte: Centralizzazione della gestione liste, calcoli in RAM e catalogo veloce condiviso tra Desktop e Mobile.',
      'Componenti Riutilizzabili UI Spesa: Introdotti PortalDropdownMenu, SelectModalDialog e CustomSelect per unificare overlay e portali.',
      'Separazione Logica-Vista Admin: Isolati gli hook useAdminConfigLogic, useAdminMaintenanceLogic e useAdminReceiptQuickEntryLogic.',
      'Deep-Linking Notifiche & Design System: Le notifiche aprono direttamente il contesto corretto (commenti, gruppi spesa).',
      'Hall of Fame & Calcolo Medie Voti: Classifica basata sulla reale media ponderata delle visioni con arrotondamento automatico alle mezze stelle.'
    ],
    fixes: [
      'Calcolo e Scala Voti Serie TV & Episodi: Risolta la discrepanza tra base 10 e base 5 nelle medie voti e corretto il calcolo medie amici.',
      'Risoluzione Dati Episodi & Media: Risolto il fallback immagini e preservate citazioni e rating al ricaricamento.',
      'Gestione Amici & Avatar Catalogo: Corretta la query Outer Join per includere amici con serie in catalogo senza recensioni.',
      'Filtri di Stato & Piattaforme: Corretto il filtro "Visti" e aggiunto il tab "In Corso" con icona dedicata.',
      'UI Dettaglio Serie: Inserita scrollbar dedicata per la trama principale evitando overflow del cast.',
      'Interazioni & Commenti Recensioni: Risolto salvataggio commenti con ID utente corretto anche per note personali.',
      'Integrità Database & Relazioni: Corretto caricamento della relazione ShoppingProduct.product_brands e risolti vincoli su task.',
      'Sincronizzazione Offline & Gestione Errori: Risolto il loop di sincronizzazione offline su errori 4xx ed eliminati dati mock residui.'
    ]
  },
  {
    id: 'v14.2.12',
    version: '14.2.12',
    date: 'Settembre 2026',
    title: 'Persistenza Immagini su NAS & Fix Volumi Docker',
    isLatest: false,
    published: true,
    highlights: [
      'Risolto il problema di perdita delle immagini al riavvio del server NAS aggiungendo la mappatura permanente dei volumi Docker per la cartella uploads.'
    ],
    fixes: [
      'Aggiunto il flag -v in deploy_nas.sh e configurato il volume in docker-compose.yml per preservare i file multimediali.'
    ]
  },
  {
    id: 'v14.2.11',
    version: '14.2.11',
    date: 'Settembre 2026',
    title: 'Rebranding in "Vita", Nuovo Logo V-Leaf & Refactoring Strict TypeScript',
    isLatest: false,
    published: true,
    highlights: [
      'Rebranding Ufficiale: l\'applicazione si chiama ora "Vita" con la nuova identità visiva V-Leaf.',
      'Eliminati tutti i cast doppi espliciti sostituendoli con interfacce TypeScript rigorose e tipi nativi estesi.',
      'Semplificata la gestione delle mutazioni delle voci del diario tramite helper tipizzati riutilizzabili (DRY).',
      'Verificato il rispetto dei principi architetturali: gestione mazzo di carte in RAM e allegati esclusivamente via URL/link.'
    ],
    features: [
      'Nuovo Rebranding & Logo "Vita": aggiornati il titolo dell\'app, favicon SVG, manifest PWA, configurazioni Capacitor Android e testi di interfaccia.'
    ],
    improvements: [
      'Refactoring apiService con executeRequest<T> generico per eliminare blocchi try/catch duplicati.',
      'Centralizzazione delle primitive per le abitudini (findActivePeriod) e del pattern di rollback ottimistico (rollbackOnError).',
      'Harmonizzazione delle interfacce temporali DailyEntry e DbMonthlyEntry con la proprietà opzionale dateStr.',
      'Pulizia delle utility temporali: deprecata getMonday in favore di date-fns ed estesa getLocalTodayStr.'
    ],
    fixes: [
      'Rimossi cast ridondanti nel pannello della gerarchia task e nell\'archivio recensioni annuali.',
      'Sostituiti i console.log diretti con il logger centralizzato silenziato in produzione.',
      'useMobileBingoLogic: corretto blocco cella in caso di errore di rete gestendo finally appropriato.',
      'useMobileDaySelection: consolidato il pattern di cancellazione massiva nella funzione condivisa batchDelete.'
    ]
  },
  {
    id: 'v14.2.10',
    version: '14.2.10',
    date: 'Settembre 2026',
    title: 'Adattamento Mobile Modale Modifica Prezzo Archivi & Integrazione Roadmap',
    isLatest: false,
    published: true,
    highlights: [
      'Adattato il modale di modifica del prezzo nello storico archivi alla visualizzazione mobile nativa tramite MobileBaseModal (layout bottom-sheet con pulsanti sticky inferiori).',
      'Aggiornato il Backlog con i nuovi task di roadmap.'
    ],
    improvements: [
      'Migliorata la resa visiva dei form di modifica prezzo su smartphone e tablet, evitando sovrapposizioni e barre di scorrimento desktop.'
    ]
  },
  {
    id: 'v14.2.9',
    version: '14.2.9',
    date: 'Settembre 2026',
    title: 'Pre-selezione Liste & Gestione Ruoli nello Storico Prezzi',
    isLatest: false,
    published: true,
    highlights: [
      'Pre-selezione automatica della lista di appartenenza e dell\'unità di misura all\'apertura del modale di modifica prezzo nello storico dell\'archivio.',
      'Integrazione dei ruoli di gruppo (owner, admin, editor, reader) per la gestione granulare dei permessi di modifica/eliminazione sui rilevamenti prezzo.'
    ],
    improvements: [
      'Nascosti i pulsanti di azione per gli utenti con ruolo Lettore (reader), mostrando i prezzi in sola consultazione.',
      'Inclusi gli ID di lista e di unità di misura nei payload di risposta delle API dello storico prezzi.'
    ],
    fixes: [
      'Aggiunto il blocco di sicurezza backend (HTTP 403 Forbidden) per tentativi non autorizzati di modifica/eliminazione da parte dei lettori.'
    ]
  },
  {
    id: 'v14.2.8',
    version: '14.2.8',
    date: 'Settembre 2026',
    title: 'Persistenza Salvataggio Prezzi & Collegamento Voci di Lista',
    isLatest: false,
    published: true,
    highlights: [
      'Risolto il problema di mancata persistenza del prezzo unitario durante il salvataggio nelle modali di modifica rilevazione prezzo.',
      'Sincronizzato il calcolo del prezzo totale di acquisto rispetto al prezzo unitario inserito ed alla quantità acquistata.'
    ],
    fixes: [
      'Corretto un disallineamento nei payload delle modali di modifica prezzo che causava la ricalcolazione errata del prezzo unitario nel backend.'
    ]
  },
  {
    id: 'v14.2.7',
    version: '14.2.7',
    date: 'Settembre 2026',
    title: 'Abilitazione Modifica Prezzi Rilevati per Utenti Standard e Gruppi Condivisi',
    isLatest: false,
    published: true,
    highlights: [
      'Abilitata la modifica e il salvataggio dei prezzi e dei lotti registrati nello storico prodotti per tutti i membri del gruppo.',
      'Corretto il controllo dei permessi sul backend FastAPI per consentire la modifica dei rilevamenti prezzo per liste condivise nel medesimo gruppo.'
    ],
    fixes: [
      'Risolto un blocco di permessi che impediva agli utenti standard di salvare le modifiche ai prezzi salvati nello storico in ambiente di produzione.'
    ]
  },
  {
    id: 'v14.2.6',
    version: '14.2.6',
    date: 'Settembre 2026',
    title: 'Protezione Dati Seed/SuperUser e Filtro Prodotti Storico Prezzi',
    isLatest: false,
    published: true,
    highlights: [
      'I dati del primo inserimento (lotti/prezzi SEED) sono ora protetti da modifiche ed eliminazioni riservate ai SuperUser.',
      'La scheda Storico Prezzi nell\'archivio spesa mostra esclusivamente i prodotti che possiedono rilevazioni di prezzo registrate.',
      'Nuovo layout a due pannelli affiancati per i dettagli di acquisto ed etichette del prodotto.',
      'Calcolo automatico bidirezionale tra Prezzo Unitario e Prezzo Totale in tutti i modali della spesa.'
    ],
    features: [
      'Implementata la struttura a due finestre affiancate per i modali di modifica articolo acquistato e rilevazione prezzo.',
      'Possibilità di modificare nome prodotto, marca, lista, unità di misura e note prodotto dallo Storico Prezzi dell\'Archivio.',
      'Calcolo automatico bidirezionale: Quantità × Unitario = Totale oppure Totale / Quantità = Unitario.'
    ],
    improvements: [
      'Ottimizzata l\'altezza del pannello sinistro eliminando spazi vuoti superflui.',
      'Allineati simmetricamente i campi Quantità e Unità di Misura con etichette visive uniformi.',
      'Aggiornamento automatico e istantaneo in tempo reale delle viste alla modifica o cancellazione di un prezzo nello storico.'
    ],
    fixes: [
      'Corretto l\'algoritmo di identificazione dei dati SEED per consentire la piena modifica di prezzi e lotti inseriti dagli utenti.',
      'Risolto il problema di condivisione indebita dei prezzi non associati a liste tra utenti non dello stesso gruppo.'
    ]
  },
  {
    id: 'v14.2.5',
    version: '14.2.5',
    date: 'Settembre 2026',
    title: 'Caricamento Automatico Prodotti & Lotti SEED Spesa all\'Avvio Backend',
    isLatest: false,
    published: true,
    highlights: [
      'Implementata la verifica e il popolamento automatico ed idempotente dei prodotti, fornitori/marchi e lotti SEED all\'avvio del server backend.'
    ],
    improvements: [
      'Garantita la disponibilità automatica dei prodotti e dello storico prezzi iniziale anche nel database di produzione.'
    ]
  },
  {
    id: 'v14.2.4',
    version: '14.2.4',
    date: 'Settembre 2026',
    title: 'Condivisione Storico Prezzi Admin & Seed per Tutti gli Utenti',
    isLatest: false,
    published: true,
    highlights: [
      'Abilitata la visibilità dei rilevamenti prezzo e lotti creati dall\'utente Admin/Seed nello storico prezzi di tutti gli utenti.'
    ]
  },
  {
    id: 'v14.2.3',
    version: '14.2.3',
    date: 'Settembre 2026',
    title: 'Miglioramenti Inserimento Rapido Prezzi, Prezzi SEED e Gestione Gruppi',
    isLatest: false,
    published: true,
    highlights: [
      'Suggerimento autocomplete in tempo reale nella barra di aggiunta rapida della spesa su mobile.',
      'Rettificata la visibilità dei prezzi SEED e di catalogo nello storico prezzi dei prodotti per tutti gli utenti.',
      'Standardizzazione prezzo: auto-conversione della virgola in punto nei campi prezzo.'
    ],
    features: [
      'Possibilità di modificare ed eliminare le rilevazioni di prezzo personali dal modale dettaglio dell\'archivio prezzi.',
      'Pulsante "+" nell\'intestazione della colonna Negozio per creare supermercati al volo su desktop.'
    ],
    fixes: [
      'Risolto l\'errore "Lotto non trovato" durante la modifica di prezzi registrati da inserimento rapido o senza lista.',
      'Integrato il DatePicker dell\'applicazione e la select standard dei negozi nel modale di modifica del prezzo.',
      'Resa case-insensitive la ricerca e l\'aggiunta dei membri nei gruppi della spesa.'
    ]
  },
  {
    id: 'v14.2.2',
    version: '14.2.2',
    date: 'Settembre 2026',
    title: 'Ottimizzazione Build Docker & Fix Crash Daemon Linux Engine',
    isLatest: false,
    published: true,
    highlights: [
      'Introdotto .dockerignore nella radice del progetto per escludere file d\'archivio (.tar), venv e dipendenze dal contesto inviato a Docker Desktop.'
    ],
    fixes: [
      'Risolto il crash del demone Docker Desktop causato dal caricamento di oltre 4.5 GB di contesto durante il deploy.'
    ]
  },
  {
    id: 'v14.2.1',
    version: '14.2.1',
    date: 'Settembre 2026',
    title: 'Fix Sincronizzazione Orari Google Calendar (Prevenzione Doppio Offset)',
    isLatest: false,
    published: true,
    highlights: [
      'Eliminata la doppia applicazione del fuso orario (+2h) su Google Calendar allineando la trasmissione al formato nativo di Google API v3.'
    ],
    fixes: [
      'Rimossa la combinazione conflittuale dell\'offset UTC con la proprietà timeZone nei payload per Google Calendar.'
    ]
  },
  {
    id: 'v14.2.0',
    version: '14.2.0',
    date: 'Settembre 2026',
    title: 'Upload Foto da Dispositivo, Caching Immagini Locale & Ottimizzazione WebP',
    isLatest: false,
    published: true,
    highlights: [
      'Modalità Offline-First con caching locale su IndexedDB (TanStack Query Persist) e sincronizzazione automatica delle modifiche (Outbox Pattern).',
      'Caricamento istantaneo dell\'app con zero latenza e consultazione completa di task, eventi, note, abitudini e liste spesa anche senza rete.',
      'Caricamento diretto di foto dal dispositivo (smartphone e PC) nei form di Routine e Countdown.',
      'Supporto completo e nativo per GIF animate, preservate al 100% fotogramma per fotogramma con loop continuo.',
      'Caching e download automatico sul server per le immagini inserite tramite URL web, evitando link rotti.',
      'Sistema integrato per la segnalazione errori, feedback e bug report con contesto diagnostico automatico e gestione SuperUser.'
    ],
    features: [
      'Architettura Offline-First: persistenza locale asincrona su IndexedDB tramite @tanstack/react-query-persist-client e idb-keyval.',
      'Coda Outbox per mutazioni offline: modifiche eseguite offline sincronizzate automaticamente al ritorno online con indicatore di connettività.',
      'Nuovo pulsante "Foto" nei form Desktop e Mobile per selezionare un\'immagine dalla galleria o scattarla direttamente da smartphone.',
      'Nuovo dominio Media nel backend FastAPI con endpoint dedicati /media/upload (multipart) e /media/fetch-url (download asincrono).',
      'Nuova modale universale Feedback & Segnalazione Errori accessibile da Changelog, Impostazioni, Schermate di Errore ed Error Boundary.',
      'Nuova scheda "Feedback & Bug Report" nel pannello Amministratore (/admin) con filtri, visualizzazione screenshot e gestione stati/note.',
      'Pipeline WebP con compressione calibrata a 960px (~30-50 KB) e salvataggio as-is per GIF animate.'
    ],
    improvements: [
      'Cache retention locale a 7 giorni per consultazione offline prolungata.',
      'Raccolta automatica del contesto tecnico e telemetria per agevolare la risoluzione dei problemi.',
      'Refactoring e snellimento modulare dell\'intero frontend nel rispetto di TypeScript Strict senza any.',
      'Cattura automatica dei crash React in Error Boundary con possibilità di segnalazione immediata.'
    ],
    fixes: [
      'Prevenzione dei link rotti per immagini esterne tramite caching locale.',
      'Corretto l\'orario degli eventi inviati a Google Calendar (risolto l\'offset di +2 ore).',
      'La creazione di un evento dalla DayPage Mobile imposta automaticamente la data del giorno visualizzato.'
    ]
  },
  {
    id: 'v14.1.0',
    version: '14.1.0',
    date: 'Settembre 2026',
    title: 'Timbri Bingo, Spunta Rapida Spesa & Gestione Prezzi Opzionali',
    isLatest: false,
    published: true,
    highlights: [
      'Spunta rapida a 1-click degli articoli della spesa con long-press per inserire prezzo e dettagli.',
      'Prezzo di acquisto reso opzionale con esclusione automatica di record a 0€ dalle statistiche e dal prezzo più basso.',
      'Nuovo set di 5 timbri principali estratti casualmente al completamento di ciascuna casella Bingo con raro timbro Easter Egg Clown (1%).',
      'Persistenza e sincronizzazione istantanea del timbro assegnato e della rotazione tra Web e Mobile.'
    ],
    features: [
      'Spunta rapida (1-click check): cerchietto cliccabile per segnare l\'articolo come acquistato all\'istante.',
      'Long-press sul cerchietto di spunta per aprire il modale dettagliato di registrazione acquisto.',
      'Prezzo di acquisto facoltativo nel modale con rimozione del valore di default 0 e del blocco di validazione.',
      'Sistema di selezione casuale dei 5 timbri standard con distribuzione equa e timbro speciale Easter Egg (stamp-clown).',
      'Colonna timbro nella tabella bingo con migrazione Alembic e sincronizzazione Web/Mobile.'
    ],
    improvements: [
      'Esclusione sistematica di prezzi nulli o <= 0 dal calcolo del miglior prezzo, prezzo medio e storico prezzi.',
      'Architettura modulare dei timbri (bingoStamps.ts) con caricamento dinamico.',
      'Configurazione del proxy di sviluppo Vite per inoltro automatico di tutte le rotte API al backend.'
    ],
    fixes: [
      'Risolto il problema di propagazione dell\'evento click sul cerchietto di spunta rapida.',
      'Risolto errore all\'apertura del modale storico di Routine e Abitudini.',
      'Corretto errore 405 Method Not Allowed durante l\'incremento e decremento dei log abitudini.'
    ]
  },
  {
    id: 'v14.0.0',
    version: '14.0.0',
    date: 'Settembre 2026',
    title: 'Aggiornamento Mobile, Quick Price & Changelog',
    isLatest: false,
    published: true,
    highlights: [
      'Nuova sezione Info & Changelog accessibile dalle impostazioni Desktop e Mobile.',
      'Risolto il comportamento del tocco per aprire il popover del giorno nel calendario mensile mobile.',
      'Aggiunto l\'indicatore con i tre puntini (•••) e calcolo dinamico dello spazio nella colonna Task in Homepage Mobile.'
    ],
    features: [
      'Sezione Changelog & Info Versione con storico dettagliato delle note di rilascio.',
      'Pulsante rapido informazioni "i" nella testata delle Impostazioni Utente Desktop e voce Info nelle Impostazioni Mobile.',
      'Script di compilazione APK dinamico con denominazione automatica versionata.'
    ],
    improvements: [
      'Impostato il prezzo di default a 0 € nei form di acquisto rapido (Quick Price) e acquisto singolo/bulk.',
      'Calcolo dinamico con ResizeObserver per le task visibili nella Homepage mobile.'
    ],
    fixes: [
      'Risolto il bug sui dispositivi touch che causava il doppio toggle istantaneo del popover nel calendario mensile.',
      'Migliorata la gestione del long press a 500ms per la navigazione alla pagina del giorno senza interferire con lo swipe.'
    ]
  },
  {
    id: 'v13.5.0',
    version: '13.5.0',
    date: 'Agosto 2026',
    title: 'Sincronizzazione Google Calendar & Ottimizzazioni Mobile',
    isLatest: false,
    published: true,
    highlights: [
      'Integrazione bidirezionale con Google Calendar.',
      'Selezione multipla ed eliminazione massiva eventi e task su mobile.',
      'Nuovo hub per le liste e lotti della spesa con gestione sconti e offerte.'
    ],
    features: [
      'Sincronizzazione Google Calendar con feedback visivo dello stato.',
      'Selezione multipla avanzata su Mobile con barra azioni dedicata.',
      'Nuovi filtri per data, marca e fornitore nell\'archivio spesa.'
    ],
    improvements: [
      'Refactoring dei form modali con validazione in tempo reale.',
      'Ottimizzazione delle animazioni e delle transizioni tra schermate.'
    ],
    fixes: [
      'Corretta la visualizzazione degli eventi a cavallo di più giorni nella vista mensile.'
    ]
  },
  {
    id: 'v13.0.0',
    version: '13.0.0',
    date: 'Luglio 2026',
    title: 'Nuova Architettura Modulare & Modulo Shopping',
    isLatest: false,
    published: true,
    highlights: [
      'Ristrutturazione completa dell\'architettura frontend a moduli e domini dedicati.',
      'Rilascio del nuovo modulo Shopping con gestione liste, prodotti, fornitori e prezzi.',
      'Supporto per la connessione remota sicura con Tailscale Tsnet.'
    ],
    features: [
      'Modulo Shopping completo con storico prezzi e confronto fornitori.',
      'Nuova gestione delle abitudini, routine e countdown con immagini personalizzabili.',
      'Integrazione Tailscale VPN per sincronizzazione nativa su rete privata.'
    ],
    improvements: [
      'Riduzione del tempo di avvio e code-splitting avanzato con Vite.',
      'Refactoring del backend FastAPI con schemi Pydantic rigorosi.'
    ],
    fixes: [
      'Risolti errori di rendering nelle griglie calendario ad alta densità.',
      'Migliorata la persistenza dei token di autenticazione.'
    ]
  }
];

export const APP_VERSION: string = CHANGELOG_HISTORY[0].version;
export const APP_VERSION_NAME: string = `v${APP_VERSION}`;
export const APP_LAST_UPDATE: string = CHANGELOG_HISTORY[0].date;