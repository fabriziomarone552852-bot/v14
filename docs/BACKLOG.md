# 📌 Backlog Funzionalità & Roadmap Progetto

Questo documento traccia in modo strutturato, prioritizzato e costantemente aggiornato tutte le **funzionalità aperte, in corso e pianificate** per l'applicazione **Vita**.

> 🗄️ **Storico Task Completati**: Tutte le attività completate con successo sono state archiviate e documentate in dettaglio in [`docs/BACKLOG_ARCHIVE.md`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/docs/BACKLOG_ARCHIVE.md). Il presente file contiene unicamente le attività aperte o future per garantire massima leggibilità e chiarezza operativa.

---

## 📊 Matrice di Stato Rapida (Attività Aperte & Future)

| ID | Attività / Funzionalità | Ambito | Stato Backend | Stato Frontend | Priorità |
| **FEAT-004** | Sezione Media: Estensione a Libri e Film & Funzionalità Evolutive | `media` / books & movies | 🟡 Parziale | 🟡 Parziale | 🔴 **Massima (Passo Fondamentale)** |
| **TRACKERS-019** | Giudizio & Voto alle singole Stagioni delle Serie TV (Valutazione per Stagione) | `media` / trackers | 🔴 Da Strutturare | 🔴 Da Implementare | 🟡 **Media** |
| **FEAT-015** | Gestione Saghe di Film (TMDB Collections) | `media` / movies | 🔴 Da Implementare | 🔴 Da Implementare | 🟡 **Media** |
| **FEAT-001** | Liste Spesa: Preferite & Pinnate (`pin_status` desktop & mobile) | `shopping` / lists | 🟢 Completato | 🔴 Da Implementare | 🟡 **Media-Alta** |
| **SHOPPING-004** | Ricerca & Consultazione Prezzi nel Modale Dettaglio Prodotto (per Brand) | `shopping` / UI | 🔴 Da Iniziare | 🔴 Da Iniziare | 🟡 **Media-Alta** |
| **SHOPPING-005** | Pannello Laterale Recensioni & Giudizio Marchi all'Aggiunta Prodotto | `shopping` / UI | 🔴 Da Strutturare | 🔴 Da Implementare | 🟡 **Media-Alta** |
| **SHOPPING-020** | Sistema Shopping Page: Voti Prodotti & Flusso "Lista fatta da papà" | `shopping` / UX | 🔴 Da Iniziare | 🔴 Da Iniziare | 🟡 **Media-Alta** |
| **FEAT-006** | Hub Spesa, Ricettario, Meal Prep & Wishlist Desideri | `shopping` / food | 🔴 Da Strutturare | 🔴 Da Implementare | 🔴 **Massima (Passo Fondamentale)** |
| **FEAT-003** | Dashboard Analytics & Storico Prezzi Spesa | `analytics` / shopping | 🟢 Completato | 🔴 Da Implementare | 🟢 **Bassa** |
| **CAL-002** | Filtro Categorie Eventi nel Calendario Homepage (Menu Ingranaggio ⚙️) | `calendar` / UI | 🔴 Da Iniziare | 🔴 Da Iniziare | 🟡 **Media-Alta** |
| **FEAT-011** | Sezione Lavoro & Gestione Turni di Lavoro (Punto da definire con Daniela) | `work` / shifts | 🔴 Da Definire | 🔴 Da Definire | 🟡 **Media-Alta** |
| **FEAT-005** | Sezione Liste Tematiche & Personalizzate (Posti, Siti, Wishlist, Giochi) | `custom_lists` | 🟡 Parziale | 🟡 Parziale | 🔴 **Massima (Passo Fondamentale)** |
| **FEAT-013** | Archivio Notifiche / Sezione Storico Notifiche Permanente | `notifications` / UI | 🟢 Completato | 🟡 Da Implementare | 🟡 **Media** |
| **FEAT-009** | Restyling & Rifinitura Grafica Schermate SuperUser (Admin Panel) | `admin` / UI | 🟢 Supportato | 🔴 Da Implementare | 🟡 **Media-Alta** |
| **FEAT-010** | Database & Sincronizzazione Centralizzata Quotes (Citazioni del Giorno) | `core` / quotes | 🔴 Da Implementare | 🔴 Da Implementare | 🟡 **Media** |
| **AI-001** | Studio & Integrazione Intelligenza Artificiale (Voice, Breakdown, Briefing) | `ai` / assistant | 🔴 Da Analizzare | 🔴 Da Analizzare | 🟡 **Media-Alta (Ricerca)** |
| **HOME-001** | Widget Homepage Rotante (Citazione del Giorno, Oroscopo & Meteo) | `home` / UI | 🔴 Da Iniziare | 🔴 Da Iniziare | 🟡 **Media-Alta** |

*Legenda Stati:*
- 🟢 **Completato / Supportato**: Già sviluppato, presente nel DB o API pronta.
- 🟡 **Parziale / Da Valutare**: Presente in parte o in fase di definizione logica/funzionale.
- 🔴 **Da Implementare / Da Iniziare**: Attività da sviluppare ex-novo.

---

## 📺 1. Media & Trackers (Film, Libri, Saghe)

### [FEAT-004] Estensione Sezione Media: Libri, Film & Funzionalità Evolutive
*(Nota: Il modulo Serie TV è stato completato e archiviato con successo in `BACKLOG_ARCHIVE.md`).*

#### 1. Sotto-sezione Libri
- **Dati Tracciati**: Titolo, autore, ISBN/codice, genere, numero totale di pagine, pagine attualmente lette, data di inizio e completamento, copertina/immagine.
- **Stato Lettura**: `Da leggere`, `In lettura`, `Completato`, `Abbandonato`, `In pausa`.
- **Dettagli & Valutazione**: Valutazione in stelle (1-5), recensione personale, citazioni/passi preferiti, tag personalizzati.
- **Integrazioni Esterne**:
  - **Google Books API**: ricerca gratuita per titolo, autore o ISBN per recuperare copertina, trama e metadati.
  - **Goodreads Feed RSS**: sincronizzazione monodirezionale in sola lettura leggendo il feed RSS pubblico dell'utente (`to-read`, `currently-reading`, `read`).

#### 2. Sotto-sezione Film & [FEAT-015] Gestione Saghe
- **Dati Tracciati**: Titolo, regista, anno di uscita, genere, durata, locandina, piattaforma di fruizione (Netflix, Prime Video, Cinema, Apple TV, Disney+).
- **Stato Visione**: `Watchlist / Da vedere`, `Visto`.
- **Dettagli & Valutazione**: Data di visione, voto personale, recensione/commento rapido, trailer.
- **[FEAT-015] Saghe & Collections TMDB**: Sfruttare il campo `belongs_to_collection` di TMDB per raggruppare automaticamente i film appartenenti alla stessa saga (es. MCU, Star Wars, Harry Potter), consentendo di tracciare l'intera saga con barra di progresso e ordinamento cronologico.

#### 3. Funzionalità Evolutive Media (Roadmap Futura)
- **Incrocio Liste Amici**: Comparare e incrociare serie TV e film salvati tra due o più amici per decidere cosa guardare insieme.
- **Incrocio Liste Miste**: Trasferire il componente `SeriesMatchModal` in una futura Homepage Trackers unificata per supportare contenuti eterogenei.
- **Voto Community**: Visualizzare il voto medio espresso dalla community dell'applicazione accanto o in alternativa al voto TMDB.
- **Suggerimenti Homepage**: Sezione con raccomandazioni dinamiche basate sugli ultimi titoli completati o guardati di frequente.

### [TRACKERS-019] Giudizio & Voto alle singole Stagioni delle Serie TV (Valutazione per Stagione)
- **Descrizione**: Possibilità per l'utente di esprimere un voto (in scala stelle/decimi) e/o un giudizio testuale / recensione dedicato a ciascuna singola stagione completata o in corso d'opera.
- **Obiettivo & Casi d'Uso**:
  - Consentire una valutazione granulare di serie televisive con qualità eterogenea tra una stagione e l'altra (es. stagioni capolavoro vs stagioni successive sottotono).
  - Visualizzare il voto/giudizio di ciascuna stagione nella scheda delle stagioni (`MobileSeriesSeasonsTab` e modale desktop), affiancandolo alle recensioni dei singoli episodi e alla valutazione complessiva della serie.
- **Stato**: 🔴 Da Strutturare / Da Implementare *(Desktop & Mobile — Priorità: Media)*.

---

## 🛒 2. Spesa, Dispensa, Ricettario & Marchi

### [FEAT-001] Liste Spesa: Preferite & Pinnate (`pin_status`)
- **Descrizione**: Possibilità per l'utente di contrassegnare le liste della spesa come **Preferite** (stella/cuore), **Pinnate / Fissate in alto** (puntina) o entrambe.
- **Backend (🟢 Già Pronto)**:
  - Migrazione DB presente: `shopping_lists.pin_status` (`VARCHAR(2)`, valori `PN`, `FV`, `PF`, `None`).
  - DTO Pydantic: `ShoppingListCreate`, `ShoppingListUpdate`, `ShoppingListResponse`.
  - Endpoint operativo: `PATCH /api/v1/shopping/lists/{list_id}` con body `{ "pin_status": "..." }`.
- **Frontend da Implementare (🔴 Da Sviluppare)**:
  - **Desktop**: Icone stella/puntina nelle card delle liste, toggle rapido con chiamata API PATCH, ordinamento con liste pinnate in cima, filtro rapido "Solo Preferite".
  - **Mobile**: Badge visivo nel drawer liste, toggle preferita/pinnata nelle azioni della lista, riorganizzazione automatica dell'ordine di visualizzazione.

### [SHOPPING-004] Ricerca & Visualizzazione Prezzi nel Modale Dettaglio Prodotto (per Brand)
- **Descrizione**: Aggiunta della barra di ricerca e della griglia/lista di consultazione prezzi all'interno del modale di dettaglio di ciascun prodotto nell'archivio spesa, includendo il raggruppamento dei prezzi registrati suddivisi per Brand/Marca.
- **Stato**: 🔴 Da Iniziare *(Desktop & Mobile — Priorità: Media-Alta)*.

### [SHOPPING-005] Pannello Laterale Recensioni & Giudizio Marchi all'Aggiunta Prodotto
- **Descrizione**: Durante l'inserimento o aggiunta rapida di un nuovo prodotto a una lista della spesa, integrare un pannello laterale a comparsa (o drawer su smartphone) che mostri le recensioni, le valutazioni qualitative (👍/👎) e i giudizi precedentemente espressi per i diversi marchi di quello specifico articolo, con indicazione dell'ultimo prezzo registrato e del negozio abituale.
- **Stato**: 🔴 Da Strutturare / Implementare *(Priorità: Media-Alta)*.

### [SHOPPING-020] Sistema Shopping Page: Voti dei Prodotti & "Lista fatta da papà"
- **Descrizione**: Evoluzione dell'esperienza d'uso della pagina Shopping per ottimizzare la gestione quotidiana della spesa familiare:
  1. **Voti & Valutazioni dei Prodotti**: Visualizzazione e gestione rapida dei voti e delle note qualitative dei prodotti direttamente all'interno delle liste della spesa e nei selettori di aggiunta, rendendo immediata la scelta del marchio migliore.
  2. **Flusso "Lista fatta da papà"**: Integrazione di una vista, filtro o flusso dedicato per importare e visualizzare agilmente appunti o liste esterne (visualizzazione semplificata per consultazione in mobilità, e selezione prioritaria dei prodotti abituali).
- **Stato**: 🔴 Da Iniziare *(Desktop & Mobile — Priorità: Media-Alta)*.

### [FEAT-006] Hub Spesa, Ricettario, Meal Prep & Wishlist Oggetti
- **Descrizione**: Evoluzione della sezione Spesa in un ecosistema integrato per la pianificazione alimentare, ricette e acquisti:
  1. **Ricettario Personale (Cookbook)**: Ricette con foto, tempi, porzioni, categoria, passaggi e ingredienti strutturati; pulsante rapido per aggiungere gli ingredienti mancanti alla lista della spesa attiva.
  2. **Meal Prep & Pianificazione Pasti**: Griglia settimanale suddivisa per fasce (Colazione, Pranzo, Cena, Snack); generatore automatico di lista spesa sommando gli ingredienti dei pasti pianificati per i giorni scelti.
  3. **Wishlist Oggetti & Desideri (Non Alimentari)**: Spazio separato dalla spesa quotidiana per salvare oggetti, attrezzi, tecnologia, idee regalo, con prezzo stimato, link allo store e priorità.
  4. **Dashboard Spesa Riassuntiva**: Box pasti del giorno, widget liste spesa attive con barre di avanzamento, alert prodotti in scadenza.
- **Stato**: 🔴 Da Strutturare / Da Implementare *(Passo Fondamentale)*.

### [FEAT-003] Dashboard Analytics & Storico Prezzi
- **Descrizione**: Grafici sull'andamento della spesa mensile, ripartizione per categorie merceologiche, confronto prezzi nel tempo per singolo prodotto e statistiche sui fornitori più convenienti.
- **Stato**: Backend 🟢 Pronto | Frontend 🔴 Da Implementare *(Priorità: Bassa)*.

---

## 📅 3. Calendario, Agenda & Turni di Lavoro

### [CAL-002] Filtro Categorie Eventi nel Calendario Homepage (Menu Ingranaggio ⚙️)
- **Descrizione**: Integrazione di un menu di filtraggio rapido rappresentato da un'icona ingranaggio ⚙️ nella vista Calendario della Homepage (Desktop e Mobile), per scegliere dinamicamente quali categorie mostrare:
  - Eventi Agenda Standard.
  - Eventi & Turni di Lavoro (collegato a `FEAT-011`).
  - Eventi importati da Google Calendar.
  - Altre categorie / Tag personalizzati.
- **Persistenza**: Preferenze salvate in memoria locale dell'utente per mantenere attiva la configurazione scelta tra le sessioni.
- **Stato**: 🔴 Da Iniziare *(Priorità: Media-Alta)*.

### [FEAT-011] Sezione Lavoro & Gestione Turni di Lavoro
- **Descrizione**: Modulo dedicato alla gestione delle attività lavorative, tracciamento orari e organizzazione turni.
- **Punti da Definire con Daniela**:
  - Modello dei turni (turni rotanti, riposi, orari spezzati, reperibilità, straordinari).
  - Modalità di visualizzazione (vista calendario turni dedicata, badge nei giorni dell'agenda o prospetto mensile).
  - Calcolo delle ore lavorate e statistiche periodiche.
- **Stato**: 🔴 Da Definire con Daniela *(Priorità: Media-Alta)*.

---

## 📋 4. Liste Tematiche & Personalizzate

### [FEAT-005] Creazione Sezione "Liste" (Liste Tematiche & Personalizzate)
- **Descrizione**: Modulo per creare e organizzare liste di idee, interessi, mete e desideri, completamente slegate dalla spesa alimentare quotidiana:
  1. **Posti da Visitare / Luoghi & Viaggi**: Città, musei, ristoranti, mete vacanza, con link Google Maps, note, checklist attrazioni e stato (*Da visitare / Visitato*).
  2. **Siti da Vedere / Link Utili & Risorse**: Strumenti online, articoli da leggere (*Read it later*), documentazioni, video, con anteprima/favicon automatica e tag tematici.
  3. **Oggetti da Comprare / Wishlist**: Desideri non alimentari, link allo store, prezzo stimato, priorità e stato (*In lista desideri, In attesa offerta, Ordinato, Acquistato*).
  4. **Giochi & Videogiochi**: Titoli PC/Console/Boardgame da provare o finire, con piattaforma, genere, ore di gioco e stato (*Da giocare, In corso, Finito, Platinato, Abbandonato*).
  5. **Liste Generiche & Flessibili**: Liste libere create dall'utente con nome, icona/emoji a scelta, colore e formato (checklist, note o link).
- **Stato**: 🟡 Parziale *(Modulo generale da strutturare e collegare alla navigazione — Passo Fondamentale)*.

---

## 🔔 5. Notifiche, Social & Condivisione

### [FEAT-013] Archivio Notifiche / Sezione Storico Notifiche Permanente
- **Descrizione**: Creare una schermata dedicata (in Impostazioni o in pagina apposita) per consultare lo storico completo di tutte le notifiche di sistema, inviti e alert, conformemente alla regola per cui le notifiche non sono effimere ma permanenti.
- **UI/UX**: Lista a scorrimento, filtri per tipologia (Social, Spesa, Sistema) e raggruppamento per data (Oggi, Ieri, Questa Settimana, Mese).
- **Stato**: Backend 🟢 Supportato | Frontend 🟡 Da Implementare *(Priorità: Media)*.

---

## ⚙️ 6. Amministrazione, Citazioni & Sistema

### [FEAT-009] Restyling & Rifinitura Grafica Schermate SuperUser (Admin Panel)
- **Descrizione**: Rifinire, armonizzare e modernizzare visivamente tutte le schermate del pannello SuperUser Desktop (`/admin`), adattandole al design system dell'applicazione:
  - Dashboard Amministrazione (Statistiche e KPI server).
  - Gestione Utenti, Ruoli e Permessi.
  - Gestione Database, Pulizia Cache e Diagnostica.
  - Sezione Feedback, Segnalazioni e Bug Report.
- **Stato**: Backend 🟢 Supportato | Frontend 🔴 Da Implementare *(Priorità: Media-Alta)*.

### [FEAT-010] Database & Sincronizzazione Centralizzata Citazioni Giornaliere (Quotes)
- **Descrizione**: Centralizzare le citazioni giornaliere (Quotes) tramite tabella database dedicata nel backend, in modo che tutti gli utenti e dispositivi visualizzino la stessa identica citazione del giorno in modo sincronizzato e consistente.
- **Stato**: 🔴 Da Implementare *(Priorità: Media)*.

---

## 🤖 7. Ricerca, Studio di Fattibilità & Integrazione AI (Intelligenza Artificiale)

### [AI-001] Assistente Intelligente, Voice-to-Action & Automazioni LLM
- **Descrizione**: Studio di fattibilità, analisi architetturale e prototipazione per integrare modelli LLM, Speech-to-Text e Structured Outputs all'interno di Vita per trasformare l'app in un assistente proattivo e contestuale.
- **Architettura Provider**: Supporto modulare per inferenza locale privata (Ollama / Whisper.cpp su NAS Docker) oppure API Cloud ad alte prestazioni (Gemini Flash, OpenAI) selezionabili dalle impostazioni.
- **Casi d'Uso Chiave**:
  1. **Voice-to-Action**: Registrazione vocale rapida da smartphone e creazione automatica strutturata di task con scadenza o inserimento articoli nella lista spesa corretta.
  2. **Assistente Personale & Daily Briefing**: Sintesi vocale/testuale del giorno all'apertura dell'app e query in linguaggio naturale sulla propria agenda (*"Quando scade l'assicurazione auto?"*, *"Cosa devo comprare da Leroy Merlin?"*).
  3. **AI Task Breakdown**: Scomposizione automatica di un macro-obiettivo in sotto-task sequenziali con scadenze suggerite.
  4. **Correlazioni Benessere (Mood & Habits)**: Analisi periodica che incrocia l'umore (*Mood Entries*) con le abitudini completate per individuare pattern positivi o fattori di stress.
- **Stato**: 🔴 Da Analizzare / Prototipare *(Priorità: Media-Alta)*.

---

## 🚀 8. Progetti Futuri & Idee di Roadmap

### 9.1 Mobile & Esperienza Utente
- [ ] **[HOME-001] Widget Homepage Rotante (Citazione, Oroscopo & Meteo)**: Widget rotante in homepage che alterna citazione, oroscopo del giorno e meteo locale, con apertura espansa al click che mostra tutte e tre le informazioni.
- [ ] **Notifiche Push Native Android (FCM / Local Notifications)**: Avvisi automatici per scadenze di task, eventi di calendario, promemoria serie ed episodi in uscita.
- [ ] **Scansione Codici a Barre (Barcode Scanner)**: Utilizzo fotocamera smartphone per aggiungere al volo prodotti alla lista spesa o libri tramite ISBN.
- [ ] **Widget Android**: Widget per la schermata home dello smartphone per spuntare i task rapidi del giorno, la lista spesa e visualizzare la puntata in corso.

### 9.2 Agenda, Task & Pianificazione
- [ ] **Visualizzazione Vista Gantt / Timeline**: Per progetti complessi con sotto-task gerarchici e scadenze concatenate.
- [ ] **Integrazione Meteo nella DayPage**: Previsioni meteo contestuali nella vista Giorno basate su coordinate o città configurata.
- [ ] **Report Settimanale / Mensile PDF**: Esportazione automatica di un documento riassuntivo con impegni svolti, abitudini rispettate, statistiche media consumati e bilancio dell'umore (*Mood Entries*).

### 9.3 Spesa & Dispensa
- [ ] **Condivisione Liste in Tempo Reale**: Aggiornamento real-time tra dispositivi diversi appartenenti allo stesso gruppo spesa (es. WebSocket / SSE).
- [ ] **Stima Totale Spesa Intelligente**: Calcolo del costo stimato del carrello prima della spesa basato sullo storico prezzi dei fornitori abituali.
