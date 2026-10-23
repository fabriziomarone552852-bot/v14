// src/data/changelogs/v15.ts
import type { ChangelogItem } from './types';

export const CHANGELOG_V15: ChangelogItem[] = [
  {
    id: 'v15.1.5',
    version: '15.1.5',
    date: 'Ottobre 2026',
    title: 'Upload Automatico APK su Google Drive & Archiviazione Versioni (TECH-009)',
    isLatest: true,
    published: false,
    highlights: [
      'Upload Automatico APK su Google Drive (TECH-009): Integrato caricamento automatico della nuova release APK al termine dei comandi di build (`build_all.ps1` e `build_apk.ps1`), eliminando qualsiasi passaggio manuale.',
      'Archiviazione Storica Versioni: Spostamento istantaneo di tutte le versioni APK precedenti nella sottocartella "old versions/" di Google Drive, lasciando visibile nella radice solo l\'ultima versione numerata.',
    ],
    features: [
      'Script di Distribuzione Google Drive: Tooling Python dedicato (`scripts/upload_to_drive.py`) basato su Google Drive API v3 (OAuth2 Desktop Client) con barra di avanzamento real-time e memorizzazione sicura del token locale.',
    ],
    improvements: [
      'Rilascio Pulito: Caricamento esclusivo del file APK con versione numerata (es. `vita-v15.1.5.apk`) per mantenere trasparenza e tracciabilità immediata.',
    ],
  },
  {
    id: 'v15.1.4',
    version: '15.1.4',
    date: 'Ottobre 2026',
    title: 'Errori Login (AUTH-001), Notifiche Liste (FEAT-014) & Timeline Serie TV',
    isLatest: false,
    published: true,
    highlights: [
      'Notifiche Nuove Liste nei Gruppi Condivisi (FEAT-014): Quando un membro crea una nuova lista in un gruppo spesa condiviso, viene inviata in automatico una notifica a tutti gli altri membri del gruppo con link diretto.',
      'Finestra Avviso Errore con Countdown (AUTH-001): Risolto il problema della scomparsa istantanea del messaggio di errore al login. L\'avviso rimane ora visibile per almeno 5 secondi completi, con barra di avanzamento temporale e pulsante di chiusura rapida.',
      'Timeline Uscite Serie TV Continua: Lo scorrimento verso il passato e il futuro carica in automatico gli episodi precedenti e successivi colmando pause temporali pluriennali tra stagioni.',
    ],
    features: [
      'Navigazione Diretta Lista Spesa: Al tap sulla notifica di una nuova lista creata nel gruppo, l\'inbox reindirizza direttamente alla pagina Shopping aprendo e impostando come attiva la lista interessata (desktop e mobile).',
    ],
    improvements: [
      'Protezione Doppi Invii & Icone Password: Bloccati i click o pressioni rapide multiple del tasto Invio che cancellavano lo stato di errore e modernizzate le icone di visibilità password.',
      'Recap Mensile Routine Mobile: Ottimizzati i quadratini a riga singola mostrando il semplice numero del giorno sui parziali in giallo; al tocco della card la routine si espande su due righe ingrandite permettendo di leggere comodamente la frazione "Y/X".',
    ],
    fixes: [
      'Risolto il bug per cui le notifiche e i messaggi di errore nella schermata di login scomparivano subito dopo essere comparsi.',
      'Anteprima Catalogo Serie TV Mobile: Risolto il filtro nel banner "Le tue serie" sulla dashboard mobile che escludeva le serie non ancora iniziate.',
      'Timeline Uscite Serie TV Mobile: Risolto il blocco dello scorrimento verso il passato in presenza di intervalli vuoti superiori a due mesi tra le stagioni.',
    ],
  },
  {
    id: 'v15.1.3',
    version: '15.1.3',
    date: 'Ottobre 2026',
    title: 'Aggiornamenti APK, Flessibilità Orario & Recap Mensile Abitudini',
    isLatest: false,
    published: true,
    highlights: [
      'Controllo Aggiornamenti APK (CORS Nginx): Abilitati gli header CORS nativi su /version.json nel proxy Nginx per consentire al WebView di Android di leggere la versione online senza blocchi di sicurezza del browser.',
      'Retry Progressivo Avvio Mobile: Introdotto un ciclo di tentativi intelligenti (3s, 8s, 18s) per consentire a Tailscale di completare l\'handshake della VPN e rilevare gli aggiornamenti fin dall\'apertura dell\'app.',
      'Recap Mensile Abitudini & Cadenze: Visualizzazione completa del mese solare con distinzione cromatica a 4 stati (completato verde, parziale Y/X ambra, attivo non completato grigio marcato, non programmato grigio tenue) e rimozione del suffisso "gg".',
      'Input Minuti & Promozione Categorie: Campo minuti flessibile con digitazione libera e normalizzazione a :00, con promozione automatica a categoria "Comune" in caso di omonimia tra Task ed Eventi.',
    ],
    improvements: [
      'Fallback Endpoint /system/version: Aggiunto endpoint di riserva gestito da FastAPI con CORS integrato per garantire il rilevamento della versione anche in caso di anomalie sul file statico.',
      'Resilienza Connessione APK: Riconciliazione automatica dello stato di rete all\'avvio per evitare che il controllo fallisca silenziosamente all\'avvio a freddo.',
      'Input Orario Flessibile (TimeInput): Consentita la cancellazione completa dei minuti (mostrando il segnaposto MM) senza forzare il ripristino prematuro a :00, con normalizzazione automatica a :00 in fase di salvataggio per Eventi e Countdown (desktop e mobile).',
      'Unificazione Intelligente Categorie: Se una categoria creata in Task viene assegnata o ricreata negli Eventi (o viceversa), il backend la promuove automaticamente a tipologia "Comune" (genre 3) assegnando il colore scelto.',
      'Recap Mensile Routine (Progresso Frazionario Y/X): Nel riepilogo mensile delle abitudini e routine (desktop e mobile), per le routine con target multiplo (es. 3 volte/giorno) i quadratini mostrano la frazione Y/X in ambra per i completamenti parziali, verde pieno per il target raggiunto e grigio per i giorni vuoti.',
      'Cadenze Non Giornaliere nel Recap Abitudini: Nel recap mensile tutti i giorni del mese rimangono visibili, distinguendo con grigio tenue i giorni non programmati e con grigio più evidente i giorni attivi non completati, oltre al verde per i completati e all\'ambra per i parziali.',
      'Pulizia Badge Recap (Rimozione "gg"): Rimosso il suffisso "gg" dal contatore di completamento nei riepiloghi mensili e annuali (es. "13/18" invece di "13/18 gg"), per una visualizzazione più compatta ed elegante.',
    ],
    fixes: [
      'Risolto il mancato rilevamento degli aggiornamenti su mobile APK dovuto al blocco delle richieste cross-origin da http://localhost verso il proxy Tailscale.',
      'Risolto il blocco nei modali Eventi e Countdown che impediva di cancellare lo zero dei minuti ripristinando forzatamente 00 durante la digitazione.',
      'Risolto l\'errore "Hai già questa categoria salvata" durante la creazione di una categoria con lo stesso nome tra Task ed Eventi.',
      'Corretto il conteggio dei giorni completati nel recap mensile routine, che considerava completati giorni in cui era stata registrata anche una sola ripetizione parziale su più richieste.',
      'Corretto il conteggio dei giorni attivi e la visualizzazione del recap mensile per le abitudini non giornaliere, che mostravano erroneamente tutti i giorni del mese come attivi.',
    ],
  },
  {
    id: 'v15.1.2',
    version: '15.1.2',
    date: 'Ottobre 2026',
    title: 'Ancoraggio Diario Mobile, Icone Ripristino & Ricerca Esplicita TMDB',
    isLatest: false,
    published: true,
    highlights: [
      'Ancoraggio Diario Serie TV Mobile: Garantito il posizionamento immediato a filo dell\'header della sezione "I prossimi da guardare" su smartphone reale tramite altezza minima viewport ed esecuzione asincrona calibrata.',
      'Controllo Esecuzione Ricerca Mobile: Nella ricerca approfondita la query non parte più in anticipo al tocco dei selettori (network, generi, stato); si avvia esclusivamente premendo Invio oppure toccando il tasto "Cerca su TMDB".',
      'Icona Freccia Ripristino Ricerca Mobile: Sostituiti i pulsanti testuali "Azzera" e le "X" nei modali di ricerca del catalogo e ricerca approfondita con l\'icona circolare RotateCcw coerente con la versione desktop.',
    ],
    improvements: [
      'Stato Locale Filtri Ricerca (draftFilters): Tutte le selezioni di piattaforma, categoria e ordinamento nel modale mobile rimangono in bozza locale senza ricaricare la pagina o forzare la vista risultati prima dell\'invio.',
      'Layout Diario Mobile: Assegnata altezza minima full-viewport (min-h-full) all\'area dal diario in giù per garantire il corretto offset di scorrimento su schermi lunghi (senza bloccarsi al footer).',
      'Ancoraggio Asincrono Blindato: Schedulazione tramite requestAnimationFrame e fallback timer per assicurare l\'ancoraggio anche con rendering ritardato di font o WebView Android.',
      'Cancellazione Rapida Testo: Inserito pulsante discreto interno alla barra di ricerca per svuotare il campo testo senza resettare gli altri filtri.',
    ],
    fixes: [
      'Risolto il passaggio anticipato alla schermata risultati durante la configurazione dei filtri di ricerca su mobile.',
      'Corretto l\'ancoraggio iniziale della vista Serie TV su mobile che mostrava lo storico delle puntate viste anziché "I prossimi da guardare".',
      'Allineati i tasti di reset dei filtri nei modali di ricerca mobile con la freccia tonda RotateCcw del modale desktop.',
    ],
  },
  {
    id: 'v15.1.1',
    version: '15.1.1',
    date: 'Ottobre 2026',
    title: 'Fix Database Tracking Serie TV & Robustezza Migrazioni',
    isLatest: false,
    published: true,
    highlights: [
      'Risolto errore 500 nell\'aggiunta di nuove serie TV: rimossa la colonna legacy NOT NULL orfana dalla tabella del database e allineato lo schema PostgreSQL di produzione sul NAS (TECH-006).',
    ],
    fixes: [
      'Risolto errore 500 (Internal Server Error) durante l\'aggiunta di serie alla propria libreria, causato da un vincolo di non-nullabilità su un campo dismesso della tabella user_series_tracking.',
      'Migliorata l\'idempotenza delle migrazioni Alembic per prevenire fallimenti su colonne o vincoli già presenti (b3c4d5e6f7a8) e creata migrazione c4d5e6f7a8b9.',
    ],
  },
  {
    id: 'v15.1.0',
    version: '15.1.0',
    date: 'Ottobre 2026',
    title: 'Sincronizzazione Bingers, Esperienza Mobile Serie TV Evoluta & Hub Amministrazione Spesa',
    isLatest: false,
    published: true,
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
  }
];
