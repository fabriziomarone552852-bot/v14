# 📌 Backlog Funzionalità & Roadmap Progetto

Questo documento traccia in modo strutturato e prioritizzato tutte le **funzionalità aperte, in corso e pianificate** per l'applicazione **Vita**.

> 🗄️ **Storico Task Completati**: Tutti i task e i progetti completati con successo sono stati spostati e documentati in dettaglio in [`docs/BACKLOG_ARCHIVE.md`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/docs/BACKLOG_ARCHIVE.md).

---

## 📊 Matrice di Stato Rapida (Attività in Corso & Future)

| ID | Attività / Funzionalità | Ambito | Stato Backend | Stato Frontend | Priorità |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **TRACKERS-005** | Ottimizzazione Latenza: Aggiornamento Ottimistico Spunta/Rewatch & Citazioni, Audit Notifiche | `trackers` / mobile | 🟢 Supportato | 🔴 Da Implementare | 🟡 **Media-Alta** |
| **TRACKERS-007** | Ordinamento Serie nella Sezione Principale (In Visione, Da Iniziare, Pausa, Completate) | `trackers` / UI | N/A | 🔴 Da Implementare | 🟡 **Media-Alta** |
| **TRACKERS-010** | Gestione Serie Abbandonate ("Drop"): Criteri, Azioni & Ripristino | `trackers` / mobile | 🔴 Da Valutare | 🔴 Da Definire | 🟡 **Media-Alta** |
| **UI-003** | Sostituzione Pulsante "Reset Filtri" con Freccia (Serie TV Web Desktop) | `trackers` / UI | N/A | 🔴 Da Implementare | 🟢 **Bassa** |
| **FEAT-004** | Sezione Media: Estensione a Libri e Film & Funzionalità Evolutive | `media` / ent | 🟡 Parziale | 🟡 Parziale | 🔴 **Massima (Passo Fondamentale)** |
| **FEAT-015** | Gestione Saghe di Film (TMDB Collections) | `media` / movies | 🔴 Da Implementare | 🔴 Da Implementare | 🟡 **Media** |
| **FEAT-001** | Liste Spesa: Preferite & Pinnate (`pin_status` desktop & mobile) | `shopping` | 🟢 Completato | 🔴 Da Implementare | 🟡 **Media-Alta** |
| **SHOPPING-004** | Ricerca & Visualizzazione Prezzi nel Modale Dettaglio Prodotto (per Brand) | `shopping` / UI | 🔴 Da Iniziare | 🔴 Da Iniziare | 🟡 **Media-Alta** |
| **SHOPPING-005** | Pannello Laterale Recensioni & Giudizio Marchi all'Aggiunta Prodotto | `shopping` / UI | 🔴 Da Strutturare | 🔴 Da Implementare | 🟡 **Media-Alta** |
| **SEED-002** | Risoluzione Visualizzazione Prodotti Seed Mancanti nelle Liste | `shopping` / seed | 🔴 Da Iniziare | 🔴 Da Iniziare | 🟡 **Media-Alta** |
| **FEAT-006** | Hub Spesa, Ricettario, Meal Prep & Wishlist Oggetti | `shopping` / food | 🔴 Da Strutturare | 🔴 Da Implementare | 🔴 **Massima (Passo Fondamentale)** |
| **FEAT-003** | Dashboard Analytics & Storico Prezzi | `analytics` | 🟢 Completato | 🔴 Da Implementare | 🟢 **Bassa** |
| **CAL-002** | Filtro Categorie Eventi nel Calendario Homepage (Menu Ingranaggio ⚙️) | `calendar` / UI | 🔴 Da Iniziare | 🔴 Da Iniziare | 🟡 **Media-Alta** |
| **FEAT-011** | Sezione Lavoro & Gestione Turni di Lavoro (Punto da definire con Daniela) | `work` / shifts | 🔴 Da Definire | 🔴 Da Definire | 🟡 **Media-Alta** |
| **GENERAL-001** | Fix Selezione Orario e Minuti Eventi (`UI-002`) & Controllo Categorie | `calendar` / UI | N/A | 🔴 Da Implementare | 🟡 **Media** |
| **HABITS-001** | Recap Mensile: Ripetizioni Multiple (conteggio frazionario es. 2/3) | `habits` / UI | 🔴 Da Iniziare | 🔴 Da Iniziare | 🟡 **Media** |
| **FEAT-005** | Sezione Liste Tematiche & Personalizzate (Posti, Siti, Wishlist, Giochi) | `custom_lists` | 🟡 Parziale | 🟡 Parziale | 🔴 **Massima (Passo Fondamentale)** |
| **FEAT-013** | Archivio Notifiche / Sezione Storico Notifiche Permanente | `notifications` / UI | 🟢 Completato | 🟡 Da Implementare | 🟡 **Media** |
| **FEAT-014** | Notifiche per Nuove Liste nei Gruppi Condivisi | `notifications` / social | 🔴 Da Implementare | 🔴 Da Implementare | 🟡 **Media** |
| **FEAT-009** | Restyling & Rifinitura Grafica Schermate SuperUser (Admin Panel) | `admin` / UI | 🟢 Supportato | 🔴 Da Implementare | 🟡 **Media-Alta** |
| **FEAT-010** | Database & Sincronizzazione Centralizzata Citazioni Giornaliere (Quotes) | `core` / quotes | 🔴 Da Implementare | 🔴 Da Implementare | 🟡 **Media** |
| **AI-001** | Studio & Integrazione Intelligenza Artificiale (AI: Voice, Breakdown, Briefing) | `ai` / assistant | 🔴 Da Analizzare | 🔴 Da Analizzare | 🟡 **Media-Alta (Ricerca & Prototipo)** |
| **HOME-001** | Widget Homepage Rotante (Citazione del Giorno, Oroscopo & Meteo) | `home` / UI | 🔴 Da Iniziare | 🔴 Da Iniziare | 🟡 **Media-Alta** |
Questo documento serve a tracciare in modo strutturato:
1. **FunzionalitÃƒÂƒÃ‚Â  implementate nel Backend ma non ancora integrate nel Frontend** (Desktop e/o Mobile).
2. **AttivitÃƒÂƒÃ‚Â  di Sviluppo Frontend & Ottimizzazione Mobile** (UI/UX, selezione multipla, navigazione).
3. **Build, Packaging & Ottimizzazioni Tecniche** (APK Android, bundle splitting, clean-up).
4. **Prossimi Passi Fondamentali & Nuove Macro-FunzionalitÃƒÂƒÃ‚Â ** (Refactoring, Sezione Libri/Film/Serie, Sezione Liste Tematiche).
5. **Ricerca & Integrazione Intelligenza Artificiale (AI)** (Voice-to-Task, Assistente, Task Breakdown, Privacy).
6. **Progetti Futuri e Idee di Roadmap** per l'evoluzione a lungo termine dell'applicazione.

---

## ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ…Â  Matrice di Stato Rapida

| ID | AttivitÃƒÂƒÃ‚Â  / FunzionalitÃƒÂƒÃ‚Â  | Ambito | Stato Backend | Stato Frontend | PrioritÃƒÂƒÃ‚Â  |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **CORE-001** | **Refactoring Globale & Pulizia Architetturale** | `core` / arch | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ **Completato** |
| **CORE-002** | **Refactoring Continuo, ModularitÃƒÂƒÃ‚Â  & Cleanup Codice** | `core` / arch | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ **Completato** |
| **MEDIA-001** | **Upload Foto Dispositivo, Caching URL, GIF As-Is & WebP** | `media` / storage | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ **Completato** |
| **CAL-001** | **Sincronizzazione Timezone Google Calendar & Data Mobile DayPage** | `calendar` / `mobile` | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ **Completato** |
| **REBRAND-001** | **Rebranding App con Nome "Vita" e Nuova Icona Applicazione** | `brand` / `UI` | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ **Completato** |
| **HOME-001** | **Widget Homepage Rotante (Citazione del Giorno, Oroscopo & Meteo)** | `home` / `UI` | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Iniziare | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Iniziare | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â  **Alta** |
| **SHOPPING-004** | **Ricerca & Visualizzazione Prezzi nel Modale Dettaglio Prodotto (per Brand)** | `shopping` / `UI` | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Iniziare | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Iniziare | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â  **Alta** |
| **SEED-002** | **Risoluzione Visualizzazione Prodotti Seed Mancanti nelle Liste** | `shopping` / `seed` | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Iniziare | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Iniziare | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â  **Alta** |
| **FEAT-012** | **Pagina di Avvio Pinnata / Selezione Landing Page Predefinita** | `settings` / UI | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ **Completato** |
| **CAL-002** | **Filtro Categorie Eventi nel Calendario Homepage (Menu Ingranaggio ÃƒÂ¢Ã…Â¡Ã¢Â„Â¢ÃƒÂ¯Ã‚Â¸Ã‚Â)** | `calendar` / UI | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Iniziare | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Iniziare | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â  **Alta** |
| **FEAT-004** | **Sezione Media: Libri, Film e Serie TV** | `media` / ent | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¡ Parziale | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¡ Parziale | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ **Massima (Passo Fondamentale)** |
| **TRACKERS-001** | **Mobile TV Series Timeline & Restyling Card Episodi** | trackers / mobile | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **TRACKERS-002** | **Mobile TV Series Detail Modal, Bottom Drawers & Gestione Liste** | `trackers` / `mobile` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **TRACKERS-006** | **Mobile TV Episode Detail, Recensioni/Citazioni & Action Buttons Style** | `trackers` / `mobile` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **TRACKERS-003** | **Homepage Mobile TV Series: Feed Serie "In Corso" ("In Questo Periodo")** | `trackers` / `mobile` | 🟡 Da Valutare | 🔴 Da Valutare | 🟡 Media-Alta |
| **TRACKERS-005** | **Ottimizzazione Latenza: Aggiornamento Ottimistico Spunta/Rewatch & Citazioni, Audit Notifiche** | `trackers` / `mobile` | 🟢 Supportato | 🔴 Da Implementare | 🟡 **Media-Alta** |
| **TRACKERS-007** | **Ordinamento Serie nella Sezione Principale (In Visione, Da Iniziare, Pausa, Completate)** | `trackers` / `UI` | N/A | 🔴 Da Implementare | 🟡 **Media-Alta** |
| **TRACKERS-008** | **Riorganizzazione 3 Pagine Serie TV (Feed In Corso a centro, Uscite a sinistra), Piattaforma per Episodio & Citazioni Personali** | `trackers` / `mobile` | 🟡 Da Strutturare | 🔴 Da Implementare | 🟡 **Media-Alta** |
| **TRACKERS-009** | **Restyling Seconda Pagina / Dashboard Serie TV Mobile, Banner Orizzontali & Collage Liste** | `trackers` / `mobile` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **TRACKERS-010** | **Gestione Serie Abbandonate ("Drop"): Criteri, Azioni & Ripristino** | `trackers` / `mobile` | 🔴 Da Valutare | 🔴 Da Definire | 🟡 **Media-Alta** |
| **TRACKERS-011** | **Modale Statistiche Serie TV Mobile a Schermo Intero & Scorrimento Continuo** | `trackers` / `mobile` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **TRACKERS-012** | **Restyling Catalogo Mobile ("Le tue serie"), 4 Aree Tematiche, Pillole Grigie, Bordi di Stato & Ricerca Dedicata** | `trackers` / `mobile` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **FEAT-005** | **Sezione Liste Tematiche & Personalizzate** | `custom_lists` | Ã°ÂŸÂŸÂ¡ Parziale | Ã°ÂŸÂŸÂ¡ Parziale | Ã°ÂŸÂ”Â´ **Massima (Passo Fondamentale)** |
| **FEAT-006** | **Hub Spesa, Ricettario, Meal Prep & Wishlist Oggetti** | `shopping` / food | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Strutturare | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Implementare | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ **Massima (Passo Fondamentale)** |
| **FEAT-007** | **Sistema Amicizie & Condivisione Recensioni (Social/Sharing)** | `social` / media | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ **Completato** |
| **FEAT-008** | **Sistema Segnalazione Errori, Feedback & Bug Report** | `support` / feedback | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ **Completato** |
| **OFFLINE-001** | **ModalitÃƒÂƒÃ‚Â  Offline-First & Sincronizzazione Differita (Outbox Sync)** | `sync` / mobile | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ **Completato** |
| **FEAT-009** | **Restyling & Rifinitura Grafica Schermate SuperUser (Admin Panel)** | `admin` / UI | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Supportato | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Implementare | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â  **Alta** |
| **FEAT-010** | **Database & Sincronizzazione Centralizzata Citazioni Giornaliere (Quotes)** | `core` / quotes | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Implementare | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Implementare | Media |
| **AI-001** | **Studio & Integrazione Intelligenza Artificiale (AI)** | `ai` / assistant | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Analizzare | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Analizzare | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â  **Alta (Ricerca & Prototipo)** |
| **FEAT-011** | **Sezione Lavoro & Gestione Turni di Lavoro** | `work` / `shifts` | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Definire | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Definire | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â  **Alta (Punto da definire con Daniela)** |
| **FEAT-001** | Liste Spesa: Preferite & Pinnate (`pin_status`) | `shopping` | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Implementare | Media-Alta |
| **FEAT-002** | Gestione Inventario Spesa, Inserimento Prezzi & Lotti (`inventory_batches`) | `shopping` | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ **Completato** |
| **FEAT-003** | **Dashboard Analytics & Storico Prezzi** | `analytics` | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Implementare | Bassa |
| **UI-002** | Fix Orario e Minuti nei Modali Eventi (Calendario) | calendar / UI | N/A | 🔴 Da Implementare | 🟡 Media |
| **UI-001** | **Selezione Multipla nella Versione Mobile** | `mobile` / UI | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ **Completato** |
| **TECH-001** | **Verifica & Ottimizzazione Bundle APK Android (Code-Splitting)** | `build` / APK | N/A | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | Media |
| **TECH-002** | Spostamento Tasto Switch in Impostazioni / Danger Zone | `routing` / UI | N/A | ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato | Bassa |
| **TECH-003** | **Persistenza Volume Uploads su Docker NAS** | `build` / docker | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **TECH-004** | **Reverse Proxy Nginx, Routing API & Crash AppShellLayout (Docker)** | `build` / docker | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **TECH-005** | **Risoluzione 502 Bad Gateway NAS & Automated Docker Smoke Test** | `build` / docker | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **TECH-006** | **Allineamento Migrazioni Alembic DB Produzione (NAS) & Fix Login 500** | `build` / `db` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **TECH-007** | **Configurazione TMDB Produzione NAS & Fix 500 Ricerca Serie** | `build` / `NAS` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **SHOPPING-009** | **Allineamento "Mazzo di Carte" Cross-Dominio & Rimozione Limiti Catalogo** | `core` / `shopping` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **SHOPPING-010** | **Precisione Quantità e Pesature Spesa a 3 Decimali (NUMERIC 12,3)** | `shopping` / `db` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **SHOPPING-011** | **Gestione ed Editing Rapido Scontrini della Sessione in Corso** | `shopping` / `admin` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **SHOPPING-012** | **Hub Amministrazione Desktop con Data Grid Spesa, Eventi e Attività** | `admin` / `shopping` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **SHOPPING-013** | **Valutazione & Opinioni sui Marchi dei Prodotti (Opzione C)** | `shopping` / `catalogs` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **SHOPPING-014** | **Supporto Universale Separatori Decimali (Virgola e Punto) & Regola d'Oro** | `core` / `UI` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **SHOPPING-015** | **Calcolo Inverso da Prezzo Unitario nelle Pagine Amministrative** | `admin` / `shopping` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **SHOPPING-016** | **Micro Split-Pill Valutazione Brand, Pareggiamento Colonne Data Grid & Snellimento Scontrini** | `shopping` / `admin` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **UI-003** | **Sostituzione Pulsante "Reset Filtri" con Freccia (Serie TV Web)** | `trackers` / `UI` | N/A | 🔴 Da Implementare | 🟢 Bassa |
| **SHOPPING-005** | **Pannello Laterale Recensioni & Giudizio Marchi in Aggiunta Prodotto** | `shopping` / `UI` | 🔴 Da Strutturare | 🔴 Da Implementare | 🟡 Media-Alta |
| **SHOPPING-017** | **Supporto Marche, Prezzi e Storico Acquisti nell'Inserimento Rapido Catalogo Spesa** | `shopping` / `catalog` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **SHOPPING-018** | **Tracciamento Brand nei Lotti Spesa & Risoluzione Ambiguità Multi-Marca** | `shopping` / `db` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |
| **SHOPPING-019** | **Inserimento Nuovo Brand e Nuovo Fornitore dalla Data Grid Lotti (input libero + datalist)** | `admin` / `shopping` | 🟢 Completato | 🟢 Completato | 🟢 **Completato** |

| **FEAT-013** | **Archivio Notifiche / Sezione Storico Notifiche** | `notifications` / UI | 🟢 Completato | 🟡 Da Implementare | 🟡 Media |

*Legenda:*
- ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ **Completato**: Pronto, testato o supportato a livello di sistema/API.
- ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¡ **Parziale / Da Verificare**: Componenti parzialmente presenti o da analizzare/rifinire.
- ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ **Da Implementare / Da Iniziare**: FunzionalitÃƒÂƒÃ‚Â  o interfaccia da sviluppare ex novo.
- ÃƒÂ¢Ã‚ÂÃ‚Â³ **In Attesa**: Da eseguire al termine di un'altra fase (es. finalizzazione versione mobile).

---

## ÃƒÂ°Ã…Â¸Ã…Â¡Ã¢Â‚Â¬ 1. Backend Implementato ÃƒÂ¢Ã…Â¾Ã¢Â€Â Frontend da Completare

### [FEAT-001] Liste Spesa: Preferite & Pinnate (`pin_status`)

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ‚Â Descrizione
PossibilitÃƒÂƒÃ‚Â  per l'utente di contrassegnare le liste della spesa come **Preferite** (stella/cuore), **Pinnate / Fissate in alto** (puntina) o entrambe.

#### ÃƒÂ¢Ã…Â¡Ã¢Â„Â¢ÃƒÂ¯Ã‚Â¸Ã‚Â Dettagli Implementazione Backend
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

#### ÃƒÂ°Ã…Â¸Ã¢Â€Â™Ã‚Â» Stato Frontend Esistente
- **Tipi definiti**: `PinStatus = 'PN' | 'FV' | 'PF' | null` in [`frontend/src/types/shopping.ts`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/types/shopping.ts).
- **API Client**: `normalizeShoppingListSummary` e `serializeShoppingListPayload` in [`frontend/src/api/shopping/shoppingListsApi.ts`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/api/shopping/shoppingListsApi.ts) leggono e serializzano correttamente `pinStatus` / `pin_status`.

#### ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¨ Cosa Manca da Implementare nel Frontend
1. **Desktop Web**:
   - Icone interattive (stella per Preferita, puntina per Pinnata) nelle card o righe delle liste spesa.
   - Azione rapida o pulsante contestuale per fare toggle di Preferita / Pinnata con chiamata `updateShoppingList(listId, { pinStatus: ... })`.
   - Ordinamento visivo nell'elenco liste: liste pinnate mostrate in cima prima delle altre.
   - Filtro / Tab opzionale per mostrare solo le "Liste Preferite".
2. **Mobile App**:
   - Icona/badge visivo nella lista a discesa / drawer delle liste della spesa.
   - ModalitÃƒÂƒÃ‚Â  di modifica lista o swipe action / pulsante rapido per aggiungere/rimuovere dai preferiti.
   - Riorganizzazione dell'ordine di visualizzazione in base a `pinStatus`.

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ‚Â¡ Esempio Chiamata API (Payload)
```http
PATCH /api/v1/shopping/lists/{list_id}
Content-Type: application/json

{
  "pin_status": "FV"
}
```

---

## ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ‚Â± 2. FunzionalitÃƒÂƒÃ‚Â  & UX Versione Mobile

### [FEAT-009] Restyling & Rifinitura Grafica Schermate SuperUser (Admin Panel)

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ‚Â Descrizione
Rifinire, armonizzare e modernizzare visivamente tutte le schermate e sezioni accessibili dal pannello SuperUser / Amministratore (`/admin`), adattandole al design system pulito e moderno dell'applicazione:
- Dashboard Amministrazione (Statistiche e KPI server).
- Gestione Utenti, Ruoli e Permessi.
- Gestione Database, Pulizia Cache e Diagnostica.
- Sezione Feedback, Segnalazioni e Bug Report.

---

### [FEAT-010] Database & Sincronizzazione Centralizzata Citazioni Giornaliere (Quotes)

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ‚Â Descrizione
Centralizzare le citazioni giornaliere (Quotes) tramite tabella database dedicata nel backend, in modo che tutti gli utenti e tutti i dispositivi visualizzino la stessa identica citazione del giorno in modo sincronizzato e consistente.

#### ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¯ Obiettivi
1. Creazione modello/tabella `quotes` (id, quote_text, author, category, scheduled_date/active).
2. Endpoint API REST per la restituzione della citazione odierna del server.
3. Hook frontend sincronizzato con cache TanStack Query.

---

## ÃƒÂ¢Ã…Â¡Ã¢Â„Â¢ÃƒÂ¯Ã‚Â¸Ã‚Â 3. Build, Packaging APK & Ottimizzazioni Tecniche

### [UI-002] Fix Selezione Orario e Minuti Modali Eventi

#### 📝 Descrizione
Sistemare e perfezionare la selezione dell'orario (in particolare i minuti) nei modali di creazione/modifica degli eventi nel Calendario, per garantirne il corretto salvataggio e visualizzazione.

---


## ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¯ 4. Prossimi Passi Fondamentali (PrioritÃƒÂƒÃ‚Â  Immediata)



### [CAL-002] Filtro Categorie Eventi nel Calendario Homepage (Menu Ingranaggio ÃƒÂ¢Ã…Â¡Ã¢Â„Â¢ÃƒÂ¯Ã‚Â¸Ã‚Â)

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ‚Â Descrizione
Integrazione di un menu di filtraggio rapido rappresentato da un'icona ad ingranaggio ÃƒÂ¢Ã…Â¡Ã¢Â„Â¢ÃƒÂ¯Ã‚Â¸Ã‚Â nella vista Calendario della Homepage (Desktop e Mobile), consentendo all'utente di scegliere dinamicamente quali tipologie di eventi e impegni mostrare nel calendario.

#### ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¯ Filtri & Selettori Previsti
1. **Eventi Agenda Standard**: Mostra/Nascondi impegni e task dell'agenda personale.
2. **Eventi & Turni di Lavoro**: Toggle per includere o isolare gli eventi di lavoro / turni (collegato al modulo `FEAT-011`).
3. **Sincronizzazione Google Calendar**: Mostra/Nascondi gli eventi importati da Google Calendar.
4. **Altre Categorie / Tag**: Selettori multipli per filtrare per prioritÃƒÂƒÃ‚Â  o categoria.

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂºÃ‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â Dettagli Interfaccia & Persistenza
- **UI Menu ÃƒÂ¢Ã…Â¡Ã¢Â„Â¢ÃƒÂ¯Ã‚Â¸Ã‚Â**: Icona ingranaggio affiancata ai comandi di navigazione del Calendario Homepage con popover/dropdown responsive (modale al centro su Mobile).
- **Persistenza Stato**: Preferenze di filtraggio salvate nello stato locale dell'utente in modo da mantenere attiva la configurazione selezionata tra le sessioni.

---

### [FEAT-004] Creazione Sezione Media & Intrattenimento: Libri, Film e Serie TV

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ‚Â Descrizione
Nuovo modulo completo per gestire, catalogare e monitorare l'intrattenimento personale: libri in lettura o da leggere, film da guardare o giÃƒÂƒÃ‚Â  visti, e serie TV con tracking dettagliato di stagioni ed episodi.

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ…Â¡ 1. Sotto-sezione Libri
- **Dati Tracciati**: Titolo, autore, ISBN/codice, genere, numero totale di pagine, pagine attualmente lette, data di inizio e completamento lettura, copertina/immagine.
- **Stato Lettura**: `Da leggere`, `In lettura`, `Completato`, `Abbandonato`, `In pausa`.
- **Dettagli & Valutazione**: Valutazione in stelle (1-5), recensione personale, citazioni/passi preferiti, tag personalizzati (es. "Saggio", "Fantasy", "Crescita personale").
- **FunzionalitÃƒÂƒÃ‚Â **: Barra di avanzamento percentuale di lettura, contatore libri completati nell'anno.

#### ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¬ 2. Sotto-sezione Film
- **Dati Tracciati**: Titolo, regista, anno di uscita, genere, durata (minuti), locandina, piattaforma di fruizione (es. Netflix, Prime Video, Cinema, Apple TV, Disney+).
- **Stato Visione**: `Watchlist / Da vedere`, `Visto`.
- **Dettagli & Valutazione**: Data di visione, voto personale, recensione/commento rapido, link al trailer o scheda informativa.
- **Integrazione Saghe/Collections**: Sfruttare il campo elongs_to_collection di TMDB per raggruppare e riconoscere automaticamente i film appartenenti alla stessa saga (es. MCU, Harry Potter), collegandoli tra loro.

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ‚Âº 3. Sotto-sezione Serie TV (ÃƒÂ¢Ã…Â“Ã¢Â€Â¦ UI Base e Backend Completati)
- **Stato Attuale (Backend ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢ Completato)**: Architettura a 5 tabelle definita (`TMDBSeries`, `TMDBEpisode`, `UserSeriesTracking`, `UserEpisodeLog`, `TVQuote`). Implementato Lazy Update asincrono parallelo da TMDB. Endpoint API pronti per rotte CRUD, statistiche dashboard (obiettivi annuali, ultimi visti), action per avanzamento rapido (+1 episodio) e gestione note/visibilitÃƒÂƒÃ‚Â .
  - ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ¢Â€Âž **Feature Avanzata (Rewatch / Diary Pattern)**: Implementato il tracciamento degli episodi in formato "Logbook" (multi-visione). Il sistema registra le visioni multiple contando il `watch_count`, restituendo l'intero storico all'utente e rimuovendo gradualmente solo le visioni piÃƒÂƒÃ‚Â¹ recenti in caso di revoca della spunta.
- **Stato Attuale (Frontend)**: Realizzato layout a griglia *bento* su desktop con top bar a 3 indicatori ("Ultima Aggiunta", "Ultimo Episodio", "Ultima Completata"). Migliorata interfaccia citazioni: scrollbar nativa Webkit con frecce rimosse forzatamente e padding adattivo all'espansione. Implementato un **meccanismo di swap dinamico** nella sidebar: in stato ridotto mostra il Calendario, in stato espanso mostra le locandine "Prossime Uscite" a carousel per ottimizzare lo spazio. Supporto fallback `no-poster.png` e scroller armonizzati (`mask-image`).
- **Dati Tracciati**: Titolo, ideatore/regista, genere, piattaforma di streaming, locandina, numero totale di stagioni ed episodi.
- **Tracking Avanzamento**: Gestione dettagliata del progresso (es. "Stagione 2 - Episodio 7"), pulsante rapido touch/click per avanzare di un episodio visto (+1 episodio).
- **Stato Serie**: `Da iniziare`, `In corso`, `In attesa di nuova stagione`, `Completata`, `Mollata`.
- **Prossimi Step Sviluppo (Da Iniziare)**:
  - ÃƒÂ°Ã…Â¸Ã‚Â¤Ã‚Â **Incrocio Liste Amici**: Aggiunta di un tasto e relativa funzione nella barra principale della sezione per permettere di incrociare/comparare le liste delle serie TV salvate da piÃÆÃÆÃâÃÂ¹ amici.
  - Ã°ÂŸÂ“Âš **âœ… Liste Multimediali Personalizzate (Completato)**: Creazione di sottoliste miste (es. "MCU", "Da vedere con la ragazza") in cui inserire film, serie o libri. (*UI di gestione liste completata*).
    - **Comportamento Homepage vs Sezioni**: Nella Homepage verranno mostrate le liste complete con tutto il loro contenuto eterogeneo. Nelle sezioni dedicate (es. Serie TV), la lista mostrerÃƒÂ  *esclusivamente* gli elementi pertinenti.
    - **Principio Architetturale**: Nel database (`MediaListItem`), l'estensione a nuovi tipi di media (film, libri) avverrà aggiungendo colonne opzionali per l'ID (es. `movie_tmdb_id`, `book_id`) e un campo `media_type` per distinguere l'elemento.
  - Ã°ÂŸÂ”ÂŽ **âœ… Ricerca per Lista (Completato)**: Aggiungere la possibilitÃƒÂ  di filtrare o cercare elementi in base all'appartenenza a specifiche liste direttamente all'interno della ricerca dettagliata/globale.
  - ÃƒÂ°Ã…Â¸Ã¢Â€Â˜Ã¢Â‚Â¬ **Check Finale Recensioni**: Al termine dello sviluppo della sezione, effettuare un controllo generale di come vengono visualizzate le recensioni e le liste delle recensioni (layout, text-wrapping, visualizzazione modale).
  - ÃƒÂ°Ã…Â¸Ã…Â’Ã…Â¸ **Voto Community**: Sostituire il voto TMDB con il voto medio della community dell'app. Al clic sul voto, si aprirÃƒÂƒÃ‚Â  una struttura simile a quella delle recensioni degli amici per leggerle.
  - ÃƒÂ°Ã…Â¸Ã¢Â€Â™Ã‚Â¬ **âœ… Commenti alle Recensioni (Completato)**: Aggiungere la possibilitÃƒÂƒÃ‚Â  di commentare le singole recensioni (tue, degli amici o pubbliche). Cliccando su una recensione, si espanderÃƒÂƒÃ‚Â  mostrando sotto il thread dei commenti (richiede implementazione backend dedicata).
  - ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ¢Â€Â **âœ… Sistema di Notifiche (Completato) (Commenti/Interazioni)**: Prevedere un sistema di notifiche (in-app/push) per avvisare l'utente quando riceve un commento a una sua recensione o ci sono interazioni rilevanti.
  - ÃƒÂ°Ã…Â¸Ã¢Â€Â™Ã‚Â¬ **âœ… Messaggistica Istantanea ed Effimera (Completato)**: Valutare l'integrazione di una chat o messaggistica diretta tra amici, possibilmente con messaggi effimeri, legata alle interazioni sulle serie o commenti.
  - ÃƒÂ°Ã…Â¸Ã¢Â€Â™Ã‚Â¡ **Suggerimenti Homepage (Raccomandazioni)**: Aggiungere in homepage una sezione con serie TV suggerite e raccomandate dinamicamente in base alle ultime serie guardate.
  - 🎨 **✅ Gestione dello stato "Empty" per l'assenza di serie (Completato)**.
  - 📺 **Homepage Mobile TV: Serie in corso ("In Questo Periodo") (TRACKERS-003)**: Nella finestra principale delle Serie TV su mobile, oltre al feed delle prossime uscite, mostrare le serie che l'utente sta guardando in questo periodo (in corso di visione / stato `watching`). Da strutturare e definire UX/UI (es. riga/carosello orizzontale in cima alle uscite, tab dedicato, o sezione espandibile per accedere rapidamente alla puntata successiva da guardare).
  - 🔄 **Sostituzione Pulsante "Reset Filtri" con Freccia (Web Serie TV - UI-003)**: Nella vista Web/Desktop delle Serie TV ([TVSeriesLibrary.tsx](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/components/trackers/TVSeriesLibrary.tsx)), sostituire il pulsante testuale "Reset filtri" con un'icona freccia di ripristino per uniformare l'interfaccia grafica e ridurre l'ingombro visivo.
  - ❌ **Date di Uscita Italiane (Impossibile)**: L'estrazione delle date di uscita regionali (italiane) per gli episodi non è supportata tecnicamente da TMDB, che traccia unicamente la prima data assoluta di messa in onda (first_air_date globale). Si manterrà la data globale poiché integrare API esterne commerciali (Gracenote/JustWatch) ha costi proibitivi per app indipendenti.
  - 📱 **Riorganizzazione 3 Pagine Serie TV, Piattaforma per Episodio & Citazioni Personali (TRACKERS-008)**:
    - **Architettura Swipe a 3 Pagine**:
      - *Pagina 0 (Sinistra)*: Timeline Prossime Uscite (calendario uscite ed episodi passati/futuri).
      - *Pagina 1 (Centro / Principale)*: Feed degli episodi delle serie che sto guardando in questo periodo ("In Corso").
      - *Pagina 2 (Destra)*: Dashboard & Attività (Obiettivo annuale, citazioni, 3 highlight affiancate, banner "LE TUE SERIE" e banner "LE TUE LISTE").
    - **Spostamento Piattaforma ("Dove l'hai guardato?")**: Trasferire il campo selettore piattaforma dalle recensioni della serie alle recensioni dei singoli episodi, permettendo di indicare la piattaforma specifica per ogni visione di puntata.
    - **Citazioni del Giorno Personali**: Estendere il modulo citazioni per permettere all'utente di aggiungere frasi, citazioni o note personali libere oltre a quelle memorizzate dagli episodi.

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ¢Â€Âž 4. Analisi Integrazioni Esterne & Sincronizzazione (Goodreads, Fable, TV Time)
- **FattibilitÃƒÂƒÃ‚Â  Sincronizzazione Piattaforme Esterne**:
  - **Sincronizzazione Serie TV via CSV/Export**: Prevedere la possibilitÃƒÂ  di importare/esportare il proprio catalogo di Serie TV e Film tramite file CSV (o JSON) per permettere il passaggio o l\'allineamento manuale con altre app esterne.
  - **Goodreads, Fable & TV Time**: Piattaforme chiuse / senza API pubbliche attive con permessi di scrittura (Goodreads ha chiuso il programma sviluppatori nel 2020; Fable e TV Time sono sistemi proprietari chiusi). La **sincronizzazione bidirezionale automatica** (lettura e scrittura diretta nei due sensi) **non ÃƒÂƒÃ‚Â¨ realizzabile**.
  - **Goodreads Feed RSS (Sincronizzazione Monodirezionale in Sola Lettura)**: Goodreads mette a disposizione per ciascun utente un **Feed RSS pubblico**. Inserendo l'URL del proprio Feed RSS nelle impostazioni di Smart Agenda, l'app puÃƒÂƒÃ‚Â² leggere periodicamente i libri aggiunti/modificati su Goodreads (`to-read`, `currently-reading`, `read`) e popolare la libreria in automatico (Goodreads ÃƒÂ¢Ã…Â¾Ã¢Â€Â Smart Agenda).
- **Servizi Aperti e Gratuiti per Ricerca Libri, Copertine & Metadati**:
  - **Google Books API**: Gratuita e immediata. Permette la ricerca per titolo, autore o ISBN recuperando in automatico copertina, descrizione/trama, autore, numero pagine e data di pubblicazione.
  - **Open Library API**: Database gratuito e open-source gestito da Internet Archive.
  - **Hardcover API**: Piattaforma moderna per lettori con API pubblica per metadati e catalogazione.
  - **TMDB API (The Movie Database)**: Ricerca automatica di locandine, trame, cast e tracking stagioni/episodi per Film e Serie TV.

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ‚Â 5. Struttura Dati & Tipizzazione TypeScript (Strict - Zero `any`)
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

#### ÃƒÂ°Ã…Â¸Ã‚ÂÃ¢Â€Â”ÃƒÂ¯Ã‚Â¸Ã‚Â Requisiti Architetturali & Integrazione
- **Backend**: Nuovo dominio modulare `backend/domains/media/` o suddiviso con modelli SQLAlchemy dedicati (`MediaItem`, `BookProgress`, `SeriesSeasonProgress`, `MediaReview`, `MediaExternalSync`).
- **Frontend Desktop**: Nuova voce di navigazione laterale con vista a schede (Tab: *Tutti*, *Libri*, *Film*, *Serie TV*) e visualizzazione a griglia di locandine o elenco tabellare con filtri, ricerca Google Books e import RSS.
- **Frontend Mobile**: Schermata dedicata nell'hub mobile con schede swipeabili, interfaccia card compatta, azioni rapide con un tap (es. segna come visto, avanza episodio, aggiorna pagina libro).

---

### [FEAT-005] Creazione Sezione "Liste" (Liste Tematiche & Personalizzate)

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ‚Â Descrizione
Modulo polivalente per creare, organizzare e gestire molteplici tipologie di liste personalizzate e tematiche per raccogliere idee, interessi, luoghi e desideri, completamente indipendenti dalla spesa alimentare quotidiana e dai task con scadenze rigide.

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ¢Â€Â¹ Ambiti e Tipologie di Liste Supportate
1. ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ‚Â **Posti da Visitare / Luoghi & Viaggi**:
   - CittÃƒÂƒÃ‚Â , monumenti, musei, ristoranti, bar o mete di vacanza.
   - Campi associabili: Nome posto, indirizzo/cittÃƒÂƒÃ‚Â , link Google Maps / coordinate, note/consigli (es. "piatto tipico da provare"), checklist di attrazioni interne, stato (`Da visitare`, `Visitato`).
2. ÃƒÂ°Ã…Â¸Ã…Â’Ã‚Â **Siti da Vedere / Link Utili & Risorse Web**:
   - Raccolta articoli da leggere (*Read it later*), strumenti online, blog, documentazioni, canali o video da guardare.
   - Campi associabili: URL, titolo della risorsa, descrizione, tag tematici (es. "Programmazione", "Design", "Finanza"), anteprima/favicon automatica, stato (`Da consultare`, `Archiviato`).
3. ÃƒÂ°Ã…Â¸Ã¢Â€ÂºÃ‚ÂÃƒÂ¯Ã‚Â¸Ã‚Â **Oggetti da Comprare / Wishlist Personale**:
   - Desideri e acquisti non alimentari (elettronica, abbigliamento, attrezzi per la casa, gadget, idee regalo per sÃƒÂƒÃ‚Â© o altri).
   - Campi associabili: Nome oggetto, prezzo stimato/reale, link allo store online, livello di prioritÃƒÂƒÃ‚Â /desiderio (Bassa, Media, Alta), note su taglia/colore/modello, stato (`In lista desideri`, `In attesa offerta`, `Ordinato`, `Comprato`).
4. ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â® **Giochi & Videogiochi**:
   - Videogiochi per PC/Console, giochi da tavolo o giochi di ruolo da provare o completare.
   - Campi associabili: Titolo, piattaforma (es. PC, PS5, Switch, Xbox, Boardgame), genere, stato (`Da giocare / Backlog`, `In corso`, `Completato`, `Platinato / 100%`, `Abbandonato`), voto personale e ore di gioco.
5. ÃƒÂ°Ã…Â¸Ã¢Â€Â™Ã‚Â¡ **Liste Generiche & Personalizzate Flessibili**:
   - PossibilitÃƒÂƒÃ‚Â  per l'utente di creare qualsiasi nuova lista tematica libera (es. *Idee regalo Natale*, *Obiettivi di vita*, *Routine allenamento*, *Frasi celebri*, *Contatti speciali*).
   - Personalizzazione con nome, icona/emoji a scelta, colore identificativo e tipo di elementi (checklist spuntabile, elenco con note o lista con link e allegati).

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂºÃ‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â FunzionalitÃƒÂƒÃ‚Â  Chiave dell'Interfaccia (Desktop & Mobile)
- **Organizzazione Visiva**: Visualizzazione a griglia di card, lista compatta o bacheca per categorie.
- **Pin & Preferiti**: PossibilitÃƒÂƒÃ‚Â  di fissare in alto le liste piÃƒÂƒÃ‚Â¹ consultate.
- **Ricerca & Filtri**: Ricerca full-text istantanea all'interno di tutte le liste e filtro rapido per tag.
- **Ordinamento Flessibile**: Drag-and-drop o riordinamento manuale/alfabetico/per data di aggiunta.
- **Archiviazione**: Archiviazione delle liste o degli elementi completati senza cancellare lo storico.
- **Mobile First UX**: Aggiunta rapida con singolo tocco, swipe per completare/eliminare e condivisione rapida.

---

### [FEAT-006] Riorganizzazione Hub Spesa, Ricettario, Meal Prep & Wishlist Oggetti

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ‚Â Descrizione
Evoluzione della sezione Spesa in un ecosistema integrato e modulare per la gestione completa dell'alimentazione, della pianificazione pasti, della spesa e dei desideri di acquisto non alimentari.

#### ÃƒÂ°Ã…Â¸Ã‚ÂÃ‚Â³ 1. Ricettario Personale (Cookbook)
- **Gestione Ricette**: Titolo, foto/copertina del piatto, tempo di preparazione/cottura, porzioni/dosi, categoria (Primi, Secondi, Contorni, Dolci, Salse), passaggi di preparazione e note personali.
- **Ingredienti Strutturati**: Ogni ricetta include una lista di ingredienti con quantitÃƒÂƒÃ‚Â  e unitÃƒÂƒÃ‚Â  di misura (es. 300g pasta, 2 spicchi aglio, 50ml olio).
- **Azione Rapida "Aggiungi alla Lista Spesa"**: Pulsante touch/click con modale interattiva che permette di selezionare gli ingredienti desiderati (deselezionando quelli giÃƒÂƒÃ‚Â  presenti in dispensa) e aggiungerli direttamente nella lista della spesa prescelta.

#### ÃƒÂ°Ã…Â¸Ã‚Â¥Ã¢Â€Â” 2. Meal Prep & Pianificazione Pasti
- **Planner Settimanale / Calendario Pasti**: Griglia settimanale e giornaliera suddivisa in fasce orarie (*Colazione, Pranzo, Cena, Snack/Spuntini*).
- **Assegnazione Ricette o Piatti Liberi**: PossibilitÃƒÂƒÃ‚Â  di trascinare o selezionare ricette dal ricettario oppure scrivere piatti al volo.
- **Generatore Automatico Lista Spesa**: Funzione intelligente che esamina i pasti pianificati per i giorni selezionati (es. "Prossimi 7 giorni"), raggruppa e somma tutti gli ingredienti necessari (es. 200g farina + 300g farina = 500g farina) e genera automaticamente una lista della spesa pronta per gli acquisti.

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂºÃ‚ÂÃƒÂ¯Ã‚Â¸Ã‚Â 3. Wishlist Oggetti & Desideri (Acquisti Non Alimentari)
- **Separazione Netta dalla Spesa Alimentare**: Spazio dedicato per salvare e ricordare oggetti, elettronica, libri, vestiti, attrezzi o idee regalo che si intende acquistare in futuro.
- **Dati Tracciati**: Nome oggetto, prezzo stimato o attuale, link allo store online / e-commerce, livello di prioritÃƒÂƒÃ‚Â /desiderio (*Bassa, Media, Alta*), immagini e note descrittive (es. taglia, colore, codice modello).
- **Stato Oggetto**: `In lista desideri`, `In attesa offerta/sconto`, `Ordinato`, `Acquistato`.

#### ÃƒÂ°Ã…Â¸Ã‚ÂÃ‚Â  4. Dashboard / Homepage Riassuntiva Shopping (Valutazione UX)
- **Hub Panoramico**: Valutazione se creare una vista principale di riepilogo con:
  - Widget liste spesa attive con barra di avanzamento articoli spuntati.
  - Box "Cosa si mangia oggi" (pasti del giorno estratti dal Meal Prep).
  - Alert prodotti in scadenza in dispensa/frigorifero.
  - Accesso rapido a Ricettario, Meal Prep, Fornitori e Wishlist.

---

### [SHOPPING-005] Finestra Laterale Recensioni & Giudizio Marchi all'Aggiunta Prodotto

#### 📋 Descrizione
Nel modulo Spesa / Shopping, durante la fase di inserimento o aggiunta di un nuovo prodotto a una lista della spesa, integrare una finestra / pannello laterale a comparsa (o drawer/sidebar reattivo) che visualizzi le recensioni, le valutazioni qualitative e i giudizi precedentemente espressi per i diversi marchi (brand) di quello specifico prodotto.

#### 🎯 Casi d'Uso & Funzionalità
1. **Confronto Marchi & Produttori in Tempo Reale**:
   - Quando l'utente seleziona o digita un prodotto generico (es. "Caffè in chicchi", "Passata di pomodoro", "Biscotti", "Detersivo piatti"), il pannello laterale mostra l'elenco di tutti i marchi già provati e recensiti in passato.
2. **Valutazione e Feedback Visivo**:
   - Per ciascun marchio vengono visualizzati:
     - Valutazione a stelle (es. 1-5 ⭐).
     - Giudizio sintetico e note di qualità (es. "Ottima tostatura e profumo", "Gusto troppo acido", "Poco concentrato").
     - Eventuale ultimo prezzo registrato o fornitore abituale.
3. **Supporto alla Decisione d'Acquisto**:
   - Consente all'utente di ricordare immediatamente quali marchi preferire e quali evitare nel momento esatto in cui compila la lista della spesa.

---


### [FEAT-011] Sezione Lavoro & Gestione Turni di Lavoro

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ‚Â Descrizione
Nuovo modulo dedicato alla gestione delle attivitÃƒÂƒÃ‚Â  lavorative, tracciamento degli orari e organizzazione dei turni di lavoro.

#### ÃƒÂ¢Ã‚ÂÃ¢Â€Âœ Punti da Definire & Note Operative
- ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â **Da chiedere a Daniela**: Pianificare un confronto con Daniela per stabilire i requisiti e l'impostazione ideale della sezione:
  - Tipologia e modello dei turni (turni rotanti, riposi, orari spezzati, reperibilitÃƒÂƒÃ‚Â , straordinari).
  - ModalitÃƒÂƒÃ‚Â  di visualizzazione grafica (vista calendario turni dedicata, badge nei giorni dell'agenda o prospetto mensile).
  - Tracciamento delle ore lavorate, note sui singoli turni e calcoli/statistiche periodiche.

---

## ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Â  5. Ricerca, Studio di FattibilitÃƒÂƒÃ‚Â  & Integrazione AI (Intelligenza Artificiale)

### [AI-001] Assistente Intelligente, Voice-to-Action & Automazioni LLM

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ‚Â Descrizione & Visione
Studio di fattibilitÃƒÂƒÃ‚Â , analisi delle architetture e prototipazione per integrare modelli di intelligenza artificiale (LLM, Speech-to-Text e Structured Parsing) all'interno di Smart Agenda. L'obiettivo ÃƒÂƒÃ‚Â¨ trasformare l'applicazione da un registro passivo a un assistente personale attivo, intelligente e contestuale, mantenendo il pieno controllo sulla privacy dei dati.

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â¬ 1. Studio Architetturale & Strategia Modelli
- **Opzione Self-Hosted / On-Premise (Massima Privacy)**:
  - Valutazione dell'esecuzione di un motore di inferenza locale (es. **Ollama**, **vLLM** o **LocalAI**) direttamente in container Docker sul NAS QNAP o su server casalingo.
  - Modelli target leggeri e veloci: **Llama 3.2 (1B/3B)**, **Qwen 2.5 (3B/7B)**, **Mistral 7B** o **Gemma 2**.
  - Trascrizione vocale locale tramite **Whisper.cpp** / **Faster-Whisper**.
  - *Vantaggi*: Zero costi di abbonamento, funzionamento 100% offline/privato, nessun dato personale inviato a terzi.
- **Opzione Cloud API (Alte Prestazioni & Zero Carico Hardware)**:
  - Supporto opzionale per chiavi API utente (es. **Google Gemini 2.0 Flash**, **OpenAI GPT-4o-mini**, **Anthropic Claude**).
  - *Vantaggi*: Risposte istantanee, capacitÃƒÂƒÃ‚Â  di ragionamento complesse, nessun impatto sulle risorse hardware del NAS.
- **Architettura Modulare & Provider Switcher**:
  - Creazione di un dominio backend dedicato `backend/domains/ai/` basato su pattern Provider (`AIProvider` astratto con implementazioni `OllamaProvider`, `GeminiProvider`, `OpenAIProvider`).
  - PossibilitÃƒÂƒÃ‚Â  per l'utente di scegliere il provider attivo dalle Impostazioni.

#### ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¯ 2. Casi d'Uso Chiave & FunzionalitÃƒÂƒÃ‚Â  Progettate

1. ÃƒÂ°Ã…Â¸Ã…Â½Ã¢Â„Â¢ÃƒÂ¯Ã‚Â¸Ã‚Â **Voice-to-Action (Inserimento Vocale Intelligente)**:
   - Registrazione rapida di un messaggio vocale da smartphone o PC.
   - Trascrizione Speech-to-Text + parsing dell'LLM con output JSON strutturato (*Structured Outputs*).
   - *Esempio di input*: *"Ricordami di pagare la bolletta della luce venerdÃƒÂƒÃ‚Â¬ mattina alle 9 e aggiungi pane e caffÃƒÂƒÃ‚Â¨ alla lista spesa"*.
   - *Azione automatica*: Creazione istantanea del task con scadenza/promemoria e aggiunta dei due articoli alla lista spesa corretta con un solo tap di conferma.

2. ÃƒÂ°Ã…Â¸Ã‚Â¤Ã¢Â€Â“ **Assistente Personale & Daily Briefing**:
   - **Riepilogo del Giorno**: Sintesi rapida all'apertura dell'app ("Oggi hai 3 impegni, il primo alle 10:30, e 2 abitudini in sospeso").
   - **Chatbot Contestuale**: PossibilitÃƒÂƒÃ‚Â  di fare domande in linguaggio naturale sulla propria agenda (*"Quando scade l'assicurazione auto?"*, *"Quante volte ho fatto palestra questo mese?"*, *"Cosa devo comprare da Leroy Merlin?"*).

3. ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Â  **Scomposizione Automatica Task Complessi (AI Task Breakdown)**:
   - Dato un obiettivo o macro-task (es. *"Organizzare viaggio a Barcellona"*, *"Dichiarazione dei redditi"*), l'IA propone un piano d'azione dettagliato suddiviso in sotto-task sequenziali con prioritÃƒÂƒÃ‚Â  e scadenze suggerite.

4. ÃƒÂ°Ã…Â¸Ã¢Â€Â™Ã‚Â¡ **Suggerimenti Intelligenti & Arricchimento Schede**:
   - **Auto-Categorizzazione**: Riconoscimento automatico della categoria per task, eventi e note.
   - **Consigli Intrattenimento**: Raccomandazioni personalizzate su libri o film simili a quelli apprezzati nella sezione Media.
   - **Correlazioni Benessere (Mood & Habits)**: Analisi periodica che incrocia il bilancio dell'umore (*Mood Entries*) con le abitudini completate per evidenziare pattern positivi o fattori di stress.

#### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ¢Â€Â¹ Fasi della Roadmap AI
- [ ] **Fase 1 - Ricerca & Benchmark**: Test prestazionali di modelli compatti su NAS QNAP (RAM/CPU/GPU) vs API Cloud.
- [ ] **Fase 2 - Backend AI Domain**: Implementazione del modulo `backend/domains/ai/` con endpoint di parsing strutturato e gestione prompt.
- [ ] **Fase 3 - Inserimento Vocale Rapido (UI Mobile & Desktop)**: Tasto microfono rapido con modale di conferma/preview dell'azione riconosciuta.
- [ ] **Fase 4 - Assistente Conversazionale**: Drawer/Widget chatbot per interrogare l'agenda e richiedere riepiloghi.

---

## ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â® 6. Progetti Futuri & Idee di Roadmap

### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ‚Â± 6.1 Mobile & Esperienza Utente
- [ ] **Notifiche Push Native Android (FCM / Local Notifications)**: Avvisi automatici per scadenze di task, eventi di calendario, promemoria libri/serie e reminder quotidiani.
- [ ] **Scansione Codici a Barre (Barcode Scanner)**: Utilizzo della fotocamera dello smartphone (Capacitor Camera/Barcode plugin) per aggiungere al volo prodotti alla lista spesa o libri tramite ISBN.
- [ ] **Widget Android**: Widget per la schermata home dello smartphone per spuntare i task rapidi del giorno, la lista spesa e visualizzare il libro o film in corso.
- [ ] **ModalitÃƒÂƒÃ‚Â  Offline / Sincronizzazione Differita**: PossibilitÃƒÂƒÃ‚Â  di consultare e modificare liste, task e note anche in assenza di rete, con sincronizzazione automatica al riaggancio del tunnel WireGuard/Tailscale.

### ÃƒÂ°Ã…Â¸Ã¢Â€ÂœÃ¢Â€Â¦ 6.2 Agenda, Task & Abitudini
- [ ] **Visualizzazione Vista Gantt / Timeline** per progetti complessi con sotto-task gerarchici.
- [ ] **Integrazione Meteo** nella vista Giorno (`DayPage`) basata su coordinate o cittÃƒÂƒÃ‚Â  configurata.
- [ ] **Report Settimanale / Mensile PDF**: Esportazione automatica di un riassunto con impegni completati, abitudini rispettate, statistiche media consumati e bilancio dell'umore (*Mood Entries*).

### ÃƒÂ°Ã…Â¸Ã¢Â€ÂºÃ¢Â€Â™ 6.3 Spesa & Dispensa
- [ ] **Condivisione Liste in Tempo Reale**: Aggiornamento real-time tra dispositivi diversi appartenenti allo stesso gruppo spesa (es. WebSocket / SSE).
- [ ] **Stima Totale Spesa Intelligente**: Calcolo del costo stimato del carrello prima della spesa basato sullo storico prezzi dei fornitori abituali.

### ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¨ 6.5 Rebranding & Nuove FunzionalitÃƒÂƒÃ‚Â  Spesa (Roadmap Immediata)

#### [HOME-001] Widget Homepage Rotante (Citazione del Giorno, Oroscopo & Previsioni Meteo)
- **Descrizione**: Integrazione in Homepage di un widget rotante/ciclico che alterna la Citazione del giorno, l'Oroscopo quotidiano e le Previsioni Meteo. Cliccando sul box della citazione o del widget, viene aperta una modale / vista espansa che mostra contemporaneamente tutte e tre le informazioni (Citazione, Oroscopo e Meteo).
- **Stato**: ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Iniziare (Interfaccia Desktop & Mobile).

#### [SHOPPING-004] Ricerca & Visualizzazione Prezzi nel Modale Dettaglio Prodotto (per Brand)
- **Descrizione**: Aggiunta della barra di ricerca e della griglia/lista di consultazione prezzi all'interno del modale di dettaglio di ciascun prodotto nell'archivio spesa, includendo il raggruppamento dei prodotti prezzati suddivisi per Brand/Marca.
- **Stato**: ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Iniziare (Interfaccia Desktop & Mobile).

#### [SEED-001] Pulizia Dati Seed Prodotti (Rimozione Marca e QuantitÃƒÂƒÃ‚Â  dal Nome)
- **Descrizione**: Bonifica dei dati del DB iniziale (prodotti SEED): pulire i nomi dei prodotti rimuovendo l'indicazione della marca e della quantitÃƒÂƒÃ‚Â  dal titolo del prodotto (es. da "Biscotti Mulino Bianco 500g" a "Biscotti"), spostando marca e quantitÃƒÂƒÃ‚Â  nei rispettivi campi dedicati.
- **Stato**: ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Iniziare (Script di migrazione/seed backend).

#### [SEED-002] Verifica e Risoluzione Prodotti Seed Mancanti nelle Liste
- **Descrizione**: Indagine e fix del problema di visualizzazione per cui alcuni prodotti seed (prodotti di sistema iniziale) non vengono mostrati o risultano nascosti nelle liste e nello storico dell'applicazione.
- **Stato**: ÃƒÂ°Ã…Â¸Ã¢Â€ÂÃ‚Â´ Da Iniziare (Analisi query repository e filtri frontend).

---

## 📺 1. Media & Trackers (Serie TV, Film, Libri)

### [TRACKERS-005] Ottimizzazione Latenza: Aggiornamento Ottimistico Spunta/Rewatch & Citazioni, Audit Notifiche
- **Descrizione**:
  - **Aggiornamento Ottimistico Spunta/Rewatch**: Verificare e garantire che al tocco della spunta dell'episodio (o del cambio visualizzazioni rewatch) lo stato visivo si aggiorni istantaneamente nel frontend/React RAM prima dell'esito della chiamata asincrona al backend, eliminando qualsiasi ritardo o latenza percepita.
  - **Aggiornamento Ottimistico Citazioni**: Applicare il salvataggio ottimistico immediato anche all'inserimento, modifica ed eliminazione delle citazioni dell'episodio per una reattività touch istantanea.
  - **Audit Notifiche**: Effettuare un check completo sul flusso delle notifiche generate dal sistema per definire chiaramente dove e quando farle comparire a schermo (evitando sovrapposizioni o disturbo nelle viste mobile).
- **Stato**: 🔴 Da Iniziare *(Priorità: Media-Alta)*.

### [TRACKERS-007] Ordinamento Serie nella Sezione Principale
- **Descrizione**: Configurare l'ordinamento predefinito delle serie TV nella libreria principale prioritizzando lo stato di visione nel seguente ordine:
  1. **In Visione** (`watching` / blu / in corso)
  2. **Non ancora iniziate** (`to_watch` / grigio / da iniziare)
  3. **In Pausa** (`paused` / viola)
  4. **Completate** (`completed` / verde)
  *(e a seguire eventuali serie abbandonate `dropped`)*.
- **Stato**: 🔴 Da Implementare *(Priorità: Media-Alta)*.

### [TRACKERS-010] Gestione Serie Abbandonate ("Drop"): Criteri, Azioni & Ripristino
- **Obiettivo**: Definire come gestire l'abbandono delle serie TV ("Cimitero delle serie" / stato `dropped`), sia per l'esperienza utente (UI/UX) sia a livello di logica applicativa e statistiche.
- **Punti Chiave & Domande Aperte**:
  1. **Azione Utente Esplicita**:
     - Aggiungere un comando "Abbandona serie" (o "Sposta nel Cimitero") nel menu opzioni serie (`MobileSeriesOptionsModal`) o nel drawer di gestione dello stato (`MobileWatchActionDrawer`).
     - Richiedere eventuale data di abbandono (default odierna) o motivo opzionale.
  2. **Criteri Automatici o Suggerimenti Intelligenti**:
     - Valutare se proporre un suggerimento automatico (es. *"Non guardi questa serie da oltre 6 mesi: vuoi contrassegnarla come abbandonata?"*), evitando cambi di stato arbitrari senza consenso.
  3. **Visualizzazione & Ripristino (Revival)**:
     - Dal modale Statistiche (sezione "Il Cimitero delle Serie") o dal Catalogo, consentire con un tocco di ripristinare la serie (*"Riprendi visione"* -> torna in `watching` o `to_watch`).
  4. **Impatto sui Conteggi & Statistiche**:
     - Mantenere distinte le serie "Abbandonate" da quelle in pausa o non iniziate. Non contano come completate, ma gli episodi già visti restano conteggiati nelle ore e negli episodi totali.
- **Stato**: 🔴 Da Definire / Da Valutare *(Priorità: Media-Alta)*.

### [UI-003] Sostituzione Pulsante "Reset Filtri" con Freccia (Serie TV Web Desktop)
- **Descrizione**: Nella vista Desktop Web delle Serie TV ([`TVSeriesLibrary.tsx`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/components/trackers/TVSeriesLibrary.tsx)), sostituire il pulsante testuale "Reset filtri" con un'icona freccia di ripristino per uniformare l'interfaccia grafica e ridurre l'ingombro visivo.
- **Stato**: 🔴 Da Implementare *(Priorità: Bassa)*.

### [FEAT-004] Estensione Sezione Media: Libri, Film & Funzionalità Evolutive

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
- **[FEAT-015] Saghe & Collections TMDB**: Sfruttare il campo `belongs_to_collection` di TMDB per raggruppare automaticamente i film appartenenti alla stessa saga (es. MCU, Star Wars, Harry Potter), consentendo di tracciare l'intera collection.

#### 3. Funzionalità Evolutive Media (Roadmap Futura)
- **Incrocio Liste Amici**: Comparare e incrociare le serie TV salvate tra due o più amici.
- **Incrocio Liste Miste**: Spostare il componente `SeriesMatchModal` in una futura Homepage Trackers dedicata per incrociare contenuti misti (Serie TV, Film e altre categorie).
- **Voto Community**: Visualizzare il voto medio della community dell'applicazione accanto o in alternativa al voto TMDB.
- **Suggerimenti Homepage**: Sezione con raccomandazioni dinamiche basate sugli ultimi titoli completati o guardati di frequente.
- **Sincronizzazione via CSV/Export**: Importazione ed esportazione catalogo tramite file CSV o JSON per backup o allineamento con app terze.

---

## 🛒 2. Spesa, Dispensa, Ricettario & Marchi

### [FEAT-001] Liste Spesa: Preferite & Pinnate (`pin_status`)
- **Descrizione**: Possibilità per l'utente di contrassegnare le liste della spesa come **Preferite** (stella/cuore), **Pinnate / Fissate in alto** (puntina) o entrambe.
- **Backend (🟢 Già Pronto)**: Colonna `shopping_lists.pin_status` (`VARCHAR(2)`, valori `PN`, `FV`, `PF`, `None`) con modelli, schemi e validazioni.
- **Frontend da Completare (🔴 Da Implementare)**:
  - **Desktop**: Icone stella/puntina nelle card delle liste, toggle rapido con chiamata API PATCH, ordinamento con liste pinnate in cima, filtro "Solo Preferite".
  - **Mobile**: Badge visivo nel drawer liste, toggle preferita/pinnata nelle azioni della lista, riorganizzazione dell'ordine di visualizzazione.

### [SHOPPING-004] Ricerca & Visualizzazione Prezzi nel Modale Dettaglio Prodotto (per Brand)
- **Descrizione**: Aggiunta della barra di ricerca e della griglia/lista di consultazione prezzi all'interno del modale di dettaglio di ciascun prodotto nell'archivio spesa, includendo il raggruppamento dei prodotti prezzati suddivisi per Brand/Marca.
- **Stato**: 🔴 Da Iniziare *(Desktop & Mobile)*.

### [SHOPPING-005] Finestra Laterale Recensioni & Giudizio Marchi all'Aggiunta Prodotto
- **Descrizione**: Durante l'inserimento o aggiunta di un nuovo prodotto a una lista spesa, integrare un pannello laterale a comparsa (o drawer su mobile) che visualizzi le recensioni, le valutazioni qualitative (👍/👎) e i giudizi precedentemente espressi per i diversi marchi di quello specifico prodotto, con ultimo prezzo registrato e negozio abituale.
- **Stato**: 🔴 Da Implementare.

### [SEED-002] Verifica e Risoluzione Prodotti Seed Mancanti nelle Liste
- **Descrizione**: Indagine e risoluzione del problema per cui alcuni prodotti seed (prodotti di sistema iniziale) non vengono mostrati o risultano nascosti nelle liste e nello storico dell'applicazione.
- **Stato**: 🔴 Da Iniziare.

### [FEAT-006] Riorganizzazione Hub Spesa, Ricettario, Meal Prep & Wishlist Oggetti
- **Descrizione**: Evoluzione della sezione Spesa in un ecosistema integrato per la pianificazione alimentare, ricette e acquisti:
  1. **Ricettario Personale (Cookbook)**: Ricette con foto, tempi, porzioni, categoria, passaggi e ingredienti strutturati; pulsante rapido per aggiungere gli ingredienti mancanti alla lista spesa.
  2. **Meal Prep & Pianificazione Pasti**: Griglia settimanale suddivisa per fasce (Colazione, Pranzo, Cena, Snack); generatore automatico di lista della spesa sommando gli ingredienti dei pasti pianificati per i giorni scelti.
  3. **Wishlist Oggetti & Desideri (Non Alimentari)**: Spazio separato dalla spesa quotidiana per salvare oggetti, attrezzi, tecnologia, idee regalo, con prezzo stimato, link allo store e priorità.
  4. **Dashboard Spesa Riassuntiva**: Box pasti del giorno, widget liste spesa attive con barre di avanzamento, alert prodotti in scadenza.
- **Stato**: 🔴 Da Strutturare / Da Implementare *(Passo Fondamentale)*.

### [FEAT-003] Dashboard Analytics & Storico Prezzi
- **Descrizione**: Grafici sull'andamento della spesa mensile, ripartizione per categorie merceologiche, confronto prezzi nel tempo per singolo prodotto e statistiche sui fornitori più convenienti.
- **Stato**: Backend 🟢 Pronto | Frontend 🔴 Da Implementare.

---

## 📅 3. Calendario, Agenda & Turni di Lavoro

### [CAL-002] Filtro Categorie Eventi nel Calendario Homepage (Menu Ingranaggio ⚙️)
- **Descrizione**: Integrazione di un menu di filtraggio rapido rappresentato da un'icona ingranaggio ⚙️ nella vista Calendario della Homepage (Desktop e Mobile), per scegliere dinamicamente quali categorie mostrare:
  - Eventi Agenda Standard.
  - Eventi & Turni di Lavoro (collegato a `FEAT-011`).
  - Eventi importati da Google Calendar.
  - Altre categorie / Tag personalizzati.
- **Persistenza**: Preferenze salvate in memoria locale dell'utente per mantenere attiva la configurazione scelta.
- **Stato**: 🔴 Da Iniziare *(Priorità: Media-Alta)*.

### [FEAT-011] Sezione Lavoro & Gestione Turni di Lavoro
- **Descrizione**: Modulo dedicato alla gestione delle attività lavorative, tracciamento orari e organizzazione turni.
- **Punti da Definire con Daniela**:
  - Modello dei turni (turni rotanti, riposi, orari spezzati, reperibilità, straordinari).
  - Modalità di visualizzazione (vista calendario turni dedicata, badge nei giorni dell'agenda o prospetto mensile).
  - Calcolo delle ore lavorate e statistiche periodiche.
- **Stato**: 🔴 Da Definire con Daniela *(Priorità: Media-Alta)*.

### [GENERAL-001] / [UI-002] Fix Selezione Orario e Minuti Eventi & Controllo Categorie
- **Descrizione**:
  - Correggere l'input dei minuti nei modali evento che talvolta risulta difficoltoso da digitare.
  - Sistemare il controllo delle categorie per distinguere chiaramente se una categoria è dedicata solo a task, solo a eventi o se è condivisa/comune.
- **Stato**: 🔴 Da Implementare *(Priorità: Media)*.

---

## 🏃‍♂️ 4. Abitudini & Benessere (Habits)

### [HABITS-001] Recap Mensile: Ripetizioni Multiple
- **Descrizione**: Sistemare le habits/routines nel recap mensile in modo da mostrare correttamente il progresso per le routine con più ripetizioni giornaliere (es. se una routine prevede 3 ripetizioni al giorno e l'utente ne ha completate 2, mostrare **`2/3`** nel riepilogo anziché una semplice spunta binaria sì/no).
- **Stato**: 🔴 Da Iniziare *(Priorità: Media)*.

---

## 📋 5. Liste Tematiche & Personalizzate

### [FEAT-005] Creazione Sezione "Liste" (Liste Tematiche & Personalizzate)
- **Descrizione**: Modulo per creare e organizzare liste di idee, interessi, mete e desideri, completamente slegate dalla spesa alimentare quotidiana:
  1. **Posti da Visitare / Luoghi & Viaggi**: Città, musei, ristoranti, mete vacanza, con link Google Maps, note, checklist attrazioni e stato (*Da visitare / Visitato*).
  2. **Siti da Vedere / Link Utili & Risorse**: Strumenti online, articoli da leggere (*Read it later*), documentazioni, video, con anteprima/favicon automatica e tag tematici.
  3. **Oggetti da Comprare / Wishlist**: Desideri non alimentari, link allo store, prezzo stimato, priorità e stato (*In lista desideri, In attesa offerta, Ordinato, Acquistato*).
  4. **Giochi & Videogiochi**: Titoli PC/Console/Boardgame da provare o finire, con piattaforma, genere, ore di gioco e stato (*Da giocare, In corso, Finito, Platinato, Abbandonato*).
  5. **Liste Generiche & Flessibili**: Liste libere create dall'utente con nome, icona/emoji a scelta, colore e formato (checklist, note o link).
- **Stato**: 🟡 Parziale *(UI liste serie TV avviata; modulo generale da strutturare - Passo Fondamentale)*.

---

## 🔔 6. Notifiche, Social & Condivisione

### [FEAT-013] Archivio Notifiche / Sezione Storico Notifiche Permanente
- **Descrizione**: Creare una sezione dedicata (es. in Archivio o pagina apposita) per consultare lo storico completo di tutte le notifiche di sistema, inviti e alert, conformemente alla regola per cui le notifiche non sono effimere ma permanenti.
- **UI/UX**: Lista a scorrimento, filtri per tipologia (Social, Spesa, Sistema) e raggruppamento per data (Oggi, Ieri, Questa Settimana, Mese).
- **Stato**: Backend 🟢 Supportato | Frontend 🟡 Da Implementare.

### [FEAT-014] Notifiche per Nuove Liste nei Gruppi Condivisi
- **Descrizione**: Ricevere una notifica quando un membro di un gruppo di cui si fa parte crea una nuova lista (es. una nuova lista all'interno di un gruppo Shopping o Media).
- **Stato**: 🔴 Da Implementare.

---

## ⚙️ 7. Amministrazione, Citazioni & Sistema

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

## 🤖 8. Ricerca, Studio di Fattibilità & Integrazione AI (Intelligenza Artificiale)

### [AI-001] Assistente Intelligente, Voice-to-Action & Automazioni LLM
- **Descrizione**: Studio di fattibilità, analisi architetturale e prototipazione per integrare modelli LLM, Speech-to-Text e Structured Outputs all'interno di Vita per trasformare l'app in un assistente proattivo e contestuale.
- **Architettura Provider**: Supporto modulare per inferenza locale privata (Ollama / Whisper.cpp su NAS Docker) oppure API Cloud ad alte prestazioni (Gemini 2.0 Flash, OpenAI) selezionabili dalle impostazioni.
- **Casi d'Uso Chiave**:
  1. **Voice-to-Action**: Registrazione vocale rapida da smartphone e creazione automatica strutturata di task con scadenza o inserimento articoli nella lista spesa corretta.
  2. **Assistente Personale & Daily Briefing**: Sintesi vocale/testuale del giorno all'apertura dell'app e query in linguaggio naturale sulla propria agenda (*"Quando scade l'assicurazione auto?"*, *"Cosa devo comprare da Leroy Merlin?"*).
  3. **AI Task Breakdown**: Scomposizione automatica di un macro-obiettivo in sotto-task sequenziali con scadenze suggerite.
  4. **Correlazioni Benessere (Mood & Habits)**: Analisi periodica che incrocia l'umore (*Mood Entries*) con le abitudini completate per individuare pattern positivi o fattori di stress.
- **Stato**: 🔴 Da Analizzare / Prototipare *(Priorità: Media-Alta)*.

---

## 🚀 9. Progetti Futuri & Idee di Roadmap

### 9.1 Mobile & Esperienza Utente
- [ ] **[HOME-001] Widget Homepage Rotante (Citazione, Oroscopo & Meteo)**: Widget rotante in homepage che alterna citazione, oroscopo del giorno e meteo locale, con apertura espansa al click che mostra tutte e tre le informazioni.
- [ ] **Notifiche Push Native Android (FCM / Local Notifications)**: Avvisi automatici per scadenze di task, eventi di calendario, promemoria serie ed episodi in uscita.
- [ ] **Scansione Codici a Barre (Barcode Scanner)**: Utilizzo fotocamera smartphone per aggiungere al volo prodotti alla lista spesa o libri tramite ISBN.
- [ ] **Widget Android**: Widget per la schermata home dello smartphone per spuntare i task rapidi del giorno, la lista spesa e visualizzare la puntata in corso.

### 9.2 Agenda, Task & Pianificazione
- [ ] **Visualizzazione Vista Gantt / Timeline**: Per progetti complessi con sotto-task gerarchici e scadenze concatenate.
- [ ] **Integrazione Meteo nella DayPage**: Previsioni meteo contestuali nella vista Giorno basate su coordinate o città configurata.
- [ ] **Report Settimanale / Mensile PDF**: Esportazione automatica di un documento riassuntivo con impegni svolti, abitudini rispettate, statistiche media consumati e bilancio dell'umore (*Mood Entries*).
