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
    id: 'v14.2.0',
    version: '14.2.0',
    date: 'Settembre 2026',
    title: 'Upload Foto da Dispositivo, Caching Immagini Locale & Ottimizzazione WebP',
    isLatest: true,
    published: false,
    highlights: [
      'Caricamento diretto di foto dal dispositivo (smartphone e PC) nei form di Routine e Countdown.',
      'Supporto completo e nativo per GIF animate, preservate al 100% fotogramma per fotogramma con loop continuo.',
      'Caching e download automatico sul server per le immagini inserite tramite URL web, evitando link rotti.',
      'Salvataggio su filesystem del server anziché su database, con riduzione del 95%+ dello spazio.',
      'Compressione e ridimensionamento a 960px in formato WebP per foto statiche, ultraleggere sui banner.',
      'Risolto lo sfasamento orario di 2 ore nella sincronizzazione degli eventi con Google Calendar.',
      'Pre-selezione automatica della data corrente visualizzata durante la creazione di eventi nella DayPage Mobile.',
    ],
    features: [
      'Nuovo pulsante "Foto" nei form Desktop e Mobile per selezionare un\'immagine dalla galleria o scattarla direttamente da smartphone.',
      'Nuovo dominio Media nel backend FastAPI con endpoint dedicati `/media/upload` (multipart) e `/media/fetch-url` (download asincrono).',
      'Gestione intelligente dei formati: salvataggio as-is per GIF animate e pipeline WebP con correzione EXIF per foto statiche.',
      'Serving statico della cartella `/uploads` direttamente dal backend con risoluzione trasparente degli URL per Web e App Mobile (Capacitor/Tailscale).',
    ],
    improvements: [
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

