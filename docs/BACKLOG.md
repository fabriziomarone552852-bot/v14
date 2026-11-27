# 📌 Backlog Funzionalità & Roadmap Progetto

Questo documento traccia in modo strutturato, prioritizzato e costantemente aggiornato tutte le **funzionalità aperte, in corso e pianificate** per l'applicazione **Vita**.

> 🗄️ **Storico Task Completati**: Tutte le attività completate con successo sono state archiviate e documentate in dettaglio in [`docs/BACKLOG_ARCHIVE.md`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/docs/BACKLOG_ARCHIVE.md). Il presente file contiene unicamente le attività aperte o future per garantire massima leggibilità e chiarezza operativa.

---

## 📊 Matrice di Stato Rapida (Attività Aperte & Future)

| ID | Attività / Funzionalità | Ambito | Stato Backend | Stato Frontend | Priorità |
| **FEAT-004 (Libri)** | Sezione Media: Estensione a Libri (Google Books, Pagine lette, Stati lettura) | `media` / books | 🔴 Da Strutturare | 🔴 Da Implementare | 🔴 **Massima (Passo Fondamentale)** |
| **FEAT-001** | Liste Spesa: Preferite & Pinnate (`pin_status` desktop & mobile) | `shopping` / lists | 🟢 Completato | 🔴 Da Implementare | 🟡 **Media-Alta** |
| **SHOPPING-004** | Ricerca & Consultazione Prezzi nel Modale Dettaglio Prodotto (per Brand) | `shopping` / UI | 🔴 Da Iniziare | 🔴 Da Iniziare | 🟡 **Media-Alta** |
| **FEAT-006** | Hub Spesa, Ricettario, Meal Prep & Wishlist Desideri | `shopping` / food | 🔴 Da Strutturare | 🔴 Da Implementare | 🔴 **Massima (Passo Fondamentale)** |
| **FEAT-003** | Dashboard Analytics & Storico Prezzi Spesa | `analytics` / shopping | 🟢 Completato | 🔴 Da Implementare | 🟢 **Bassa** |
| **CAL-002** | Filtro Categorie Eventi nel Calendario Homepage (Menu Ingranaggio ⚙️) | `calendar` / UI | 🔴 Da Iniziare | 🔴 Da Iniziare | 🟡 **Media-Alta** |
| **FEAT-011** | Sezione Lavoro & Gestione Turni di Lavoro (Punto da definire con Daniela) | `work` / shifts | 🔴 Da Definire | 🔴 Da Definire | 🟡 **Media-Alta** |
| **FEAT-005** | Sezione Liste Tematiche & Personalizzate (Posti, Siti, Wishlist, Giochi) | `custom_lists` | 🟡 Parziale | 🟡 Parziale | 🔴 **Massima (Passo Fondamentale)** |
| **FEAT-010** | Database & Sincronizzazione Centralizzata Quotes (Citazioni del Giorno) | `core` / quotes | 🔴 Da Implementare | 🔴 Da Implementare | 🟡 **Media** |
| **AI-001** | Studio & Integrazione Intelligenza Artificiale (Voice, Breakdown, Briefing) | `ai` / assistant | 🔴 Da Analizzare | 🔴 Da Analizzare | 🟡 **Media-Alta (Ricerca)** |
| **FEAT-016** | Lettere al Futuro Me (Time Capsule nascoste fino allo scadere del countdown impostato) | `capsules` / personal | 🔴 Da Strutturare | 🔴 Da Implementare | 🟡 **Media** |
| **HOME-001** | Widget Homepage con Oroscopo & Modale "Oggi in pillole" (Backend & UI pronti nel cassetto) | `home` / UI | 🟢 Pronto (in pausa) | 🟡 In Pausa (nel cassetto) | 🟢 **Bassa** |

*Legenda Stati:*
- 🟢 **Completato / Supportato**: Già sviluppato, presente nel DB o API pronta.
- 🟡 **In Corso / Parziale**: In fase di sviluppo o parzialmente integrato.
- 🔴 **Da Implementare / Da Iniziare**: Attività da sviluppare ex-novo.

---

## 📺 1. Media & Trackers (Libri, Serie TV & Funzionalità Evolutive)

> 🗄️ **Moduli Serie TV & Film Completati**: I moduli completi delle **Serie TV** e dei **Film** (inclusa la gestione Saghe TMDB, calendari visioni, statistiche di durata reale, liste miste, valutazione multi-log per singole stagioni `TRACKERS-019`, standardizzazione header/cards `TRACKERS-023`, modale statistiche unificata `TRACKERS-024`, ricerca e filtro multi-persona `AND`/`OR` con scheda filmografia `TRACKERS-025`, standardizzazione modale dettaglio `TRACKERS-028`, armonizzazione recensioni/citazioni `TRACKERS-029`, social/commenti ottimistici `TRACKERS-030`, paginazione progressiva TMDB `TRACKERS-031`, standardizzazione catalogo `TRACKERS-032`, standardizzazione mobile trackers `TRACKERS-033`, il modulo Cinema & orari in sala `TRACKERS-034`, le piattaforme streaming utente con fallback home mobile `TRACKERS-037`, il motore di ricerca incrociata avanzata con generi 3 stati e reset rapido `TRACKERS-038`, il modale piattaforma universale con ordinamento alfabetico `TRACKERS-039`, la centratura geometrica dell'header e del catalogo mobile `TRACKERS-040`, il modale analytics mobile film con calendario unificato ed EmptyState universali `TRACKERS-041`, la riorganizzazione architetturale simmetrica `shared/`-`series/`-`movies/` con nomenclatura unificata `TRACKERS-042`, la rifinitura scheda dettaglio film e standardizzazione recensioni mobile `TRACKERS-043`, la suite liste personali mobile filtrata per tracker con slider header a doppio livello `TRACKERS-044`, il porting mobile di scheda attori/registi, navigazione a stack cross-media e rating compatti per stagioni/episodi/serie/film `TRACKERS-045`, la barra liste adattiva anti-sovrapposizione locandina con sidebar scorrevoli Liste/Amici `TRACKERS-046`, il pulsante e modale piattaforme catalogo desktop `TRACKERS-036` e gli orari cinema e carosello "In sala" su Webpage Desktop `TRACKERS-035`) sono stati completati con successo e archiviati in dettaglio in [`docs/BACKLOG_ARCHIVE.md`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/docs/BACKLOG_ARCHIVE.md).

### [FEAT-004 (Libri)] Estensione Sezione Media: Libri
*(Attività futura pianificata per il completamento dell'hub Media).*

#### 📚 Sotto-sezione Libri (Roadmap Futura)
- **Dati Tracciati**: Titolo, autore, ISBN/codice, genere, numero totale di pagine, pagine lette, data inizio/fine, copertina.
- **Stato Lettura**: `Da leggere`, `In lettura`, `Completato`, `Abbandonato`, `In pausa`.
- **Integrazioni Esterne**: Google Books API e Goodreads Feed RSS.

#### 3. Funzionalità Evolutive Media (Roadmap Futura)
- **Incrocio Liste Amici**: Comparare e incrociare serie TV e film salvati tra due o più amici per decidere cosa guardare insieme.
- **Incrocio Liste Miste**: Trasferire il componente `SeriesMatchModal` in una futura Homepage Trackers unificata per supportare contenuti eterogenei.
- **Voto Community**: Visualizzare il voto medio espresso dalla community dell'applicazione accanto o in alternativa al voto TMDB.
- **Suggerimenti Homepage**: Sezione con raccomandazioni dinamiche basate sugli ultimi titoli completati o guardati di frequente.

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

> [!NOTE]
> **📝 Note per Sviluppatori — `note per papà` (Spunti & Decisioni Aperte da Affrontare):**
> 1. **Pulizia Nomi Prodotti vs Brand (`"ace candeggina"`)**: Nella lista dei prodotti compare ad esempio *"ace candeggina"*, ma il marchio (*"Ace"*) non dovrebbe stare esclusivamente tra i **Brand** lasciando solo *"candeggina"* tra i prodotti canonici? *(I pannelli laterali Marchi & Giudizi, la sola consultazione in creazione prodotto, lo snellimento del catalogo rapido, l'inserimento rapido prezzi multi-scontrino a cascata e le scrollbar a scomparsa nelle liste aperte `SHOPPING-005` + `SHOPPING-020` + `SHOPPING-022` sono stati completati e archiviati in [`docs/BACKLOG_ARCHIVE.md`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/docs/BACKLOG_ARCHIVE.md)).*

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

> 🗄️ **Archivio Notifiche Permanente Completato (`FEAT-013`)**: La pagina dedicata allo storico permanente delle notifiche (`/notifications` su Desktop & Mobile, con filtri per tipologia, stato lettura, intervallo date e deep-link diretto a 0ms) è stata completata e archiviata in [`docs/BACKLOG_ARCHIVE.md`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/docs/BACKLOG_ARCHIVE.md).

---

## ⚙️ 6. Citazioni & Sistema

> 🗄️ **Modulo Meteo Open-Meteo Desktop & Mobile Completato**: L'intera revisione e integrazione del sistema meteo (`WEATHER-002`, inclusi Open-Meteo 16gg, storico mensile on-demand, finestra atmosferica Desktop con fasi lunari reali, striscia rotante Citazione ↔ Meteo in Home Mobile, widget in Giorno/Settimana/Mese, ricerca città in modale centrato e modale dettagli a tutta pagina su smartphone) è stata completata e archiviata in [`docs/BACKLOG_ARCHIVE.md`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/docs/BACKLOG_ARCHIVE.md).

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

## ✉️ 8. Capsule Temporali & Messaggi al Futuro

### [FEAT-016] Lettere al Futuro Me (Time Capsule stile FutureMe)
- **Descrizione**: Funzionalità di capsula temporale ispirata a **FutureMe** che permette all'utente di scrivere e inviare una lettera indirizzata a sé stesso nel futuro, impostando un **countdown** (o data/ora di scadenza) per lo sblocco.
- **Comportamento & Regole Chiave**:
  - **Occultamento Totale fino allo Scadere del Countdown**: Una volta inviata, la lettera viene **nascosta e non è più visibile all'utente** (né consultabile, rileggibile o modificabile) fino allo scadere del countdown impostato (il blocco deve valere sia lato UI che lato backend, evitando l'esposizione del contenuto prima dello scadere del tempo).
  - **Scelta Countdown / Scadenza Flessibile**: Possibilità di impostare un countdown/data precisa futura o preset rapidi (es. tra 3 mesi, 6 mesi, 1 anno, 5 anni).
  - **Consegna & Storico Permanente**: Allo scadere del countdown impostato, la lettera torna visibile, viene sbloccata e segnalata tramite notifica permanente nell'app nella raccolta di lettere ricevute.
- **Stato**: 🔴 Da Strutturare / Da Implementare *(Desktop & Mobile — Priorità: Media)*.

---

## 🚀 9. Progetti Futuri & Idee di Roadmap

### 9.1 Mobile & Esperienza Utente
- [ ] **[ADMIN-MOBILE-001] Pannello Admin Mobile per Interventi Rapidi di Emergenza**: Mini-console SU ottimizzata per smartphone (attualmente coperta dal placeholder *In Sviluppo* su `/admin`) per eseguire interventi amministrativi urgenti senza PC (es. ripristino password/utenti, codici invito, stato sistema, avvisi broadcast o manutenzione rapida).
- [ ] **[HOME-001] Riattivazione Oroscopo & Modale "Oggi in pillole" (Già sviluppati e messi nel cassetto)**: La striscia rotante Citazione ↔ Meteo è già attiva in Home Mobile (`MobileRotatingBriefingStrip`). Il parser Python self-hosted per l'oroscopo italiano (`backend/domains/horoscope/`), gli hook 0ms (`useHoroscope`, `useHoroscopePreference`), la card impostazioni (`MobileHoroscopeSettingsCard`) e il modale a tutt'altezza con barra inferiore a icone (`MobileDailyBriefingModal`) sono già codificati e conservati nel codebase per un eventuale utilizzo futuro.
- [ ] **Scansione Codici a Barre (Barcode Scanner)**: Utilizzo fotocamera smartphone per aggiungere al volo prodotti alla lista spesa o libri tramite ISBN.
- [ ] **Widget Android**: Widget per la schermata home dello smartphone per spuntare i task rapidi del giorno, la lista spesa e visualizzare la puntata in corso.

### 9.2 Agenda, Task & Pianificazione
- [ ] **Visualizzazione Vista Gantt / Timeline**: Per progetti complessi con sotto-task gerarchici e scadenze concatenate.
- [ ] **Report Settimanale / Mensile PDF**: Esportazione automatica di un documento riassuntivo con impegni svolti, abitudini rispettate, statistiche media consumati e bilancio dell'umore (*Mood Entries*).

### 9.3 Spesa & Dispensa
- [ ] **Condivisione Liste in Tempo Reale**: Aggiornamento real-time tra dispositivi diversi appartenenti allo stesso gruppo spesa (es. WebSocket / SSE).
- [ ] **Stima Totale Spesa Intelligente**: Calcolo del costo stimato del carrello prima della spesa basato sullo storico prezzi dei fornitori abituali.
