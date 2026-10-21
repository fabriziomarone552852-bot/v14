// src/data/changelogs/v14.ts
import type { ChangelogItem } from './types';

export const CHANGELOG_V14: ChangelogItem[] = [
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
  }
];
