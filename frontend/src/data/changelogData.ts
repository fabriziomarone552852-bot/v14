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
    title: 'Hub Amministrazione Desktop con Data Grid Spesa, Eventi e Attività e Supporto Avanzato Mobile Trackers & Serie TV',
    isLatest: true,
    published: false,
    highlights: [
      'Serie TV Mobile: Diario Puntate, Navigazione a 3 Pagine Circolari & Rewatch: Nuova schermata centrale "Diario Puntate" con storico visioni dal basso verso l\'alto e carosello circolare a 3 schermate (Timeline Uscite, Diario, Dashboard); gestione del rewatch con dialog touch di conferma e opzione "Interrompi rewatch".',
      'Serie TV Mobile: Modale Statistiche a Tutto Schermo & Catalogo Tematico: Modale statistiche nativo full-screen a scorrimento verticale continuo con sezioni Panoramica, Voti, Abitudini e Rewatch; catalogo mobile "Le tue serie" a 4 aree tematiche (In visione, In lista, In attesa, Completate) con bordi colorati di stato e ricerca avanzata in RAM.',
      'Serie TV Mobile: Scheda Episodio Full-Screen, Recensioni & Gestione Liste: Dettaglio episodio a tutto schermo con backdrop still HD e cassetto visioni; form recensioni touch con textarea ad altezza dinamica; riprogettato il modale "Le mie liste" con selezione multipla touch, card collage e creazione rapida.',
      'Spesa: Marche, Prezzi Storici e Valutazione Brand (👍/👎): Inserimento Rapido Catalogo con sottomarche collegate, ultimo prezzo/fornitore registrato e gradimento qualitativo; micro split-pill [👍|👎] con note permanenti; tracciamento fisico brand_id nei lotti d\'acquisto per eliminare ambiguità multi-marca.',
      'Hub Amministrazione Desktop: Data Grid Spesa, Eventi e Attività: Console unificata per SuperUser con tabelle ad alta densità per la modifica in linea massiva di scontrini/lotti spesa, appuntamenti calendario e task; strumento di deduplicazione e unione prodotti duplicati.',
      'Campi Decimali Universali & Precisione a 3 Cifre: Accettazione trasparente di virgola e punto su Web e Mobile in tutti i campi numerici decimali; calcolo inverso da prezzo unitario nelle griglie admin; estensione delle pesature e quantità a 3 decimali (NUMERIC 12,3).'
    ],
    features: [
      'Mobile TV Series Diario & Carousel: Nuova slide centrale Diario con storico puntate, sezioni "I prossimi da guardare", "Da riprendere" e "Nuove serie", escludendo gli episodi speciali (S00); navigazione swipe a 3 pagine circolari continue.',
      'Mobile TV Series Statistiche Fullscreen: Modale a schermo intero (MobileSeriesStatsModal) con gesture back native, istogramma voti, abitudini di visione e riepilogo rewatch.',
      'Mobile TV Series Catalogo & Ricerca Dedicata: Riprogettazione del catalogo a 4 aree tematiche con pillole grigie sobrie e nuovo modale di ricerca avanzata con filtri applicati localmente in RAM.',
      'Mobile TV Series Liste Personali Avanzate: Riprogettazione di "Le mie liste" con card collage dinamiche (ListCollagePoster), selezione multipla con long-press, ordinamento a due frecce e cancellazione batch.',
      'Mobile TV Series Dettaglio Episodio & Recensioni: Vista episodio a tutto schermo con still backdrop; nuova schermata "Nuova/Modifica Recensione" ancorata a pieno schermo con textarea adattiva e selettore piattaforma touch.',
      'Inserimento Rapido Catalogo Spesa con Marche e Prezzi: Selezione sottomarche con accordion su Desktop e modale centrato su Mobile, con storico ultimo acquisto, negozio e preferenza.',
      'Valutazione Brand Intelligente: Sistema di gradimento marchio permanente a 1 tap [👍|👎] con commenti qualitativi, integrato nei modali spesa e con badge/alert visivi per marchi sconsigliati.',
      'Data Grid Amministrazione Eventi & Task: Console tabellare per SuperUser con filtri e modifica inline per date, categorie, priorità, stati e riassegnazione cross-utente con salvataggio massivo.',
      'Hub Amministrazione Spesa & Unione Prodotti: Riorganizzazione sotto scheda unificata "Spesa" con tabs segmentate (Scontrini, Data Grid Lotti, Unione Prodotti Duplicati con accorpamento transazionale).',
      'Creazione Rapida Brand e Fornitori da Data Grid Lotti: Supporto input libero con datalist nei campi Brand e Fornitore; creazione automatica e aggiornamento istantaneo del mazzo di carte in RAM al salvataggio.'
    ],
    improvements: [
      'Campi Decimali Universali (decimalUtils): Rimossi gli input type="number" nativi in favore di type="text" con inputMode="decimal", accettando sia virgola che punto senza blocchi browser.',
      'Calcolo Inverso Prezzo Unitario Admin: Doppio click sul prezzo unitario per ricavare la quantità o il prezzo totale mancante, con blocco di sicurezza se entrambi i dati sono presenti.',
      'Navigazione & Z-Index Gerarchico Mobile: Elevato z-index dei modali serie e integrata priorità useBackHandler per garantire ritorni precisi alla schermata sottostante senza chiusure accidentali.',
      'Scrollbar a Dissolvenza (useFadeScrollbar): Scrollbar a scomparsa dinamica su tutte le griglie e modali del tracker serie, visibili solo durante il tocco attivo.',
      'Dashboard Serie TV Mobile a Zero Scrollbar: Banner orizzontali "LE TUE SERIE" e "LE TUE LISTE", citazione del giorno compatta e card highlight affiancate con spaziatura equilibrata.',
      'Refactoring Architetturale Modulare Frontend: Scomposizione dei macro-componenti Trackers e Spesa in componenti snelli e custom hooks dedicati (<300 righe) nel rispetto del principio DRY e strict TypeScript.'
    ],
    fixes: [
      'Tracciamento Brand nei Lotti Spesa: Aggiunta colonna brand_id alla tabella inventory_batch con persistenza esplicita del marchio, risolvendo l\'appiattimento arbitrario sul primo brand per articoli multi-marca.',
      'Stagioni Collassate di Default su Mobile: Corretto il comportamento di apertura nel modale serie; tutte le stagioni restano chiuse di default all\'ingresso.',
      'Z-Index Modale Liste & ConfirmDialog: Risolto il posizionamento dei modali secondari dietro alla scheda serie su desktop (z-[10050]) e incrementato z-index di ConfirmDialog a z-[10090] su mobile.',
      'React Rules of Hooks & Re-Render Loop: Risolto errore ordine hook in MobileTVSeriesSearchModal e stabilizzata la navigazione in TrackerHeaderProvider eliminando i loop di render.',
      'Configurazione TMDB Produzione NAS: Configurate chiavi API in ambiente di produzione NAS, risolvendo l\'errore HTTP 500 nella ricerca serie e recupero provider.',
      'Allineamento "Mazzo di Carte" Cross-Dominio: Rimossi i limiti forzati di default negli endpoint /products, /suppliers, /brands, /events, /interactions e /feedback/reports.',
      'Precisione Quantità a 3 Decimali: Migrazione NUMERIC(12,3) applicata su test e produzione per preservare quantità inferiori all\'unità e pesature al banco senza troncamenti.',
      'Piattaforma di Visione per Episodio: Trasferito il campo piattaforma dalle recensioni della serie alle recensioni dei singoli episodi per una granularità di visione completa anche nei rewatch.'
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
      'Risolto l\'errore HTTP 500 in fase di login sul NAS (PostgreSQL family-smart) dovuto a colonne utente mancanti (profile_picture_url, default_startup_page, module_preferences).',
      'Rese completamente idempotenti le migrazioni Alembic storiche e allineato il database di produzione alla versione HEAD (z9y8x7w6v5u4).'
    ],
    fixes: [
      'Login & Auth (/auth/login): Ripristinata la corretta autenticazione degli utenti eliminando il fallimento della query users causato dal disallineamento dello schema PostgreSQL.',
      'Alembic Migrations Idempotency: Bonificate le migrazioni storiche (indici feedback reports, tabelle tracker serie TV, brand spesa, piattaforme e sessioni match) con clausole IF NOT EXISTS e if_exists=True per prevenire fallimenti su database parzialmente migrati.',
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
      'Risolto il crash in avvio del Backend FastAPI (NameError date non definita nel modulo trackers) che impediva l\'apertura della porta 8000 e causava l\'errore 502 Bad Gateway tramite Nginx.',
      'Aggiunto Smoke Test automatico in deploy_build_pc.ps1 per bloccare all\'istante il rilascio su PC in presenza di errori di avvio nel container backend.'
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
      'Risolto il crash TypeError: t.filter is not a function al caricamento dell\'applicazione nei container Docker.',
      'Allineamento completo delle route nel reverse proxy Nginx per interazioni, social, trackers e feedback.'
    ],
    fixes: [
      'Reverse Proxy Nginx & Crash AppShellLayout (Docker): Aggiunte le route mancanti (interactions, social, trackers, feedback, planning) in nginx.conf e introdotta una guardia anti-fallback in apiService e nei componenti notifiche per impedire che risposte HTML causassero il crash TypeError: t.filter is not a function.'
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
      'Incrocio Liste Amici (Backend + Modale): Sistema di stanze e calcolo intersezione serie TV e film condivisi tra utenti, pronto per la futura Homepage Trackers.',
      'Ricerca & Filtri Avanzati TMDB: Motore di ricerca globale con filtri dinamici (genere, piattaforme JustWatch, anno) e badge interattivi cliccabili direttamente nella griglia.',
      'Statistiche & Abitudini di Visione: Modale analitico con grafici su andamento temporale, ore/episodi visti, distribuzioni genere/piattaforma, rating profilato e gestione dinamica degli obiettivi annuali.',
      'Estrazione Casuale Serie TV: Strumento dedicato per suggerire ed estrarre casualmente una serie TV dalla propria lista o tra quelle ancora da iniziare.',
      'Pattern Diario (Rewatch) & Tracking Stagioni: Supporto per visioni multiple degli episodi, calcolo automatico dello stato (In corso / Completata) e date di trasmissione.',
      'Interazioni Social & Commenti Recensioni: Commenti a thread con privacy granulare, menzioni (@username) ed invio di messaggi effimeri a scomparsa direttamente dalla lista amici nella nuova Inbox.',
      'Pannello Amministrazione Avanzato (SuperUser): Gestione completa utenti con modifica dati riservati, reset password con generatore sicuro, forzatura cambio password al primo accesso e consultazione risorse collegate.',
      'Manutenzione DB, Configurazione & Telemetria: Monitoraggio in tempo reale di stato, latenza e storage upload; sincronizzazione sequenze PostgreSQL, eliminazione account disattivati e controlli per parametri di sistema (profondità sottotask, storico prezzi).',
      'Inserimento Rapido Scontrini (Admin): Nuova interfaccia tabellare ultra-rapida per imputare scontrini multi-riga (autocompletamento predittivo per prodotti/brand e calcolo automatico prezzo unitario) per alimentare storico e statistiche shopping.',
      'Catalogo A-Z & Gestione Multipla Spesa: Vista tabellare per inserimento rapido articoli con checkbox (doppio click desktop o long-press mobile) e selezione multipla per spostamento rapido tra liste o cancellazione massiva.',
      'Refactoring Catalogo Prodotti & Tabella Ponte Brand (Shopping): Disaccoppiamento di ShoppingProducts e introduzione della tabella ponte N:N `shopping_product_brands` per associare molteplici brand a un prodotto con note e commenti qualitativi persistenti.',
      'Controllo Aggiornamenti In-App (Mobile): Verifica automatica della versione sul server all\'avvio dell\'app con finestra popup di avviso e reindirizzamento a Google Drive per il download dell\'ultimo APK, con pulsante di verifica manuale nelle Impostazioni.'
    ],
    improvements: [
      'Bonifica Integrale TypeScript Strict (Zero "any"): Eliminazione totale di ogni tipo any e cast espliciti (as unknown as) in tutto il frontend, introduzione di Type Guards rigorose (isTMDBSeriesLike) e tipizzazione generica delle recensioni.',
      'Scomposizione Architetturale Modulo Serie TV: Suddivisione chirurgica dei macro-file (SeriesDetailModal, EpisodeDetailView, SeriesReviewTab da oltre 1.100 a ~200 righe ciascuno) estraendo orchestratori, sub-componenti visivi (Header, Sidebar, Drawers, Cards) e hook dedicati di logica.',
      'Controller & Componenti Recensioni Modulari: Incapsulamento dello stato form in SeriesReviewForm ed EpisodeDetailForm, con gestione isolata di commenti e menzioni in SeriesReviewDetail ed EpisodeReviewDetail, e schermate condivise per le recensioni amici.',
      'Standardizzazione Strutturale Cartelle Trackers: Riorganizzazione completa secondo le convenzioni di progetto: componenti visivi in components/trackers, hook logici in hooks/trackers, utility matematiche in utils/ratingUtils e pagina principale in views/TVSeriesPage.',
      'Architettura DRY & Logica Mazzo di Carte (Shopping): Centralizzazione della gestione liste e permessi in useShoppingCoreListLogic, calcoli in RAM e paginazione archivio prezzi in useShoppingArchivePricesLogic, e logica catalogo veloce condivisa tra Desktop e Mobile.',
      'Componenti Riutilizzabili UI Spesa: Introdotti PortalDropdownMenu, SelectModalDialog e CustomSelect per unificare overlay, portali e dropdown di fornitori e unità di misura.',
      'Separazione Logica-Vista Admin: Isolati gli hook useAdminConfigLogic, useAdminMaintenanceLogic e useAdminReceiptQuickEntryLogic per trasformare le sezioni admin in componenti di pura interfaccia grafica con navigazione schede ottimizzata e responsive.',
      'Allineamento Dinamico Limiti Nidificazione: La scelta della profondità massima sottotask nelle impostazioni utente è ora sincronizzata dinamicamente al tetto massimo stabilito dall\'amministratore.',
      'Unificazione Logica Routine (Abitudini): Estratto l\'hook centralizzato useRoutineFormLogic per eliminare la duplicazione di parsing RRULE, date e target tra desktop e mobile.',
      'Deep-Linking Notifiche & Design System Modali: Le notifiche aprono direttamente il contesto corretto (commenti, gruppi spesa); uniformati gli indicatori visivi, skeleton loading avatar, ConfirmDialog personalizzato e scrollbar a gradiente.',
      'Hall of Fame & Calcolo Medie Voti: Classifica basata sulla reale media ponderata delle visioni con arrotondamento automatico alle mezze stelle (.5) e calcolo dinamico delle medie di stagione.'
    ],
    fixes: [
      'Calcolo e Scala Voti Serie TV & Episodi: Risolta la discrepanza tra base 10 e base 5 nelle medie voti, aggiunta la colonna vote_average a TMDBSeries/TMDBEpisode nel DB e corretto il problema di invalidazione cache React (useMemo) nel calcolo medie amici.',
      'Risoluzione Dati Episodi & Media: Risolto il problema di visualizzazione degli episodi per serie in anteprima, integrato il fallback immagini (backdrop/poster anziché placeholder), aggiunta la data di trasmissione e preservate citazioni e rating al ricaricamento.',
      'Gestione Amici & Avatar Catalogo: Corretta la query backend Outer Join per includere correttamente gli amici con serie in catalogo senza recensioni, e aggiunto avatar di default per profili senza immagine.',
      'Filtri di Stato & Piattaforme: Corretto il filtro "Visti" (solo serie con zero episodi rimanenti), aggiunto il tab "In Corso" con icona dedicata, tradotti gli stati di produzione in italiano e risolto bug sull\'elenco piattaforme di streaming predefinite.',
      'UI Dettaglio Serie: Inserita scrollbar dedicata per la trama principale evitando overflow del cast, e rimosso l\'orario superfluo (2:00) dalla data delle recensioni.',
      'Interazioni & Commenti Recensioni: Risolto salvataggio commenti con ID utente corretto anche per note personali, immediata invalidazione query e correzione crash datetime.strptime/timedelta nella sincronizzazione background.',
      'Integrità Database & Relazioni: Corretto caricamento della relazione ShoppingProduct.product_brands, risolto bug sulla chiave max_subtask_depth nei task e create migrazioni mancanti per costanti e constraints delle tabelle log e trackers.',
      'Fix Errori Backend & Routing: Risolto errore 500 negli inviti ai gruppi spesa per repository non trovato, corretti crash legati a serie TMDB orfane e ripristinate rotte proxy Vite per API social & interactions.',
      'Sincronizzazione Offline & Gestione Errori: Risolto il loop di sincronizzazione offline su errori 4xx, eliminati i dati temporanei mock dai controller e ottimizzata la gestione degli empty state.'
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