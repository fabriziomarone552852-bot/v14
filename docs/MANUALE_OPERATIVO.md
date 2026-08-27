# Manuale Operativo del Progetto VxAme14 — Guida Dettagliata per Dominio

Il presente documento costituisce il **Manuale Operativo Ufficiale** per la manutenzione, l'estensione e l'esercizio della piattaforma **VxAme14**.  
L'architettura è strutturata in **19 domini modulari**, ciascuno autonomo nella gestione di modelli, schemi di validazione, repository, servizi di business logic e router HTTP.

---

## 📑 Indice dei Domini

1. [Dominio 1: `auth` (Autenticazione & Sicurezza)](#1-dominio-auth-autenticazione--sicurezza)
2. [Dominio 2: `users` (Gestione Utenti & Profilo)](#2-dominio-users-gestione-utenti--profilo)
3. [Dominio 3: `config` & `catalogs` (Configurazioni & Codici Catalogo)](#3-dominio-config--catalogs-configurazioni--codici-catalogo)
4. [Dominio 4: `categories` (Categorie Personalizzate)](#4-dominio-categories-categorie-personalizzate)
5. [Dominio 5: `tasks` (Attività & Sotto-task)](#5-dominio-tasks-attivit%C3%A0--sotto-task)
6. [Dominio 6: `events` (Calendario & Ricorrenze)](#6-dominio-events-calendario--ricorrenze)
7. [Dominio 7: `habits` (Abitudini, Periodi & Log)](#7-dominio-habits-abitudini-periodi--log)
8. [Dominio 8: `planning` (Daily Entries & Diari)](#8-dominio-planning-daily-entries--diari)
9. [Dominio 9: `monthly_entries` (Pianificazione & Note Mensili)](#9-dominio-monthly_entries-pianificazione--note-mensili)
10. [Dominio 10: `yearly_entries` (Visione & Obiettivi Annuali)](#10-dominio-yearly_entries-visione--obiettivi-annuali)
11. [Dominio 11: `countdowns` (Timer & Scadenze)](#11-dominio-countdowns-timer--scadenze)
12. [Dominio 12: `bingo` (Griglia Obiettivi Annuale 5x5)](#12-dominio-bingo-griglia-obiettivi-annuale-5x5)
13. [Dominio 13: `notifications` (Notifiche In-App)](#13-dominio-notifications-notifiche-in-app)
14. [Dominio 14: `analytics` (Aggregazioni & Storico Prezzi)](#14-dominio-analytics-aggregazioni--storico-prezzi)
15. [Dominio 15: `admin` (Pannello Amministrazione & SuperUser)](#15-dominio-admin-pannello-amministrazione--superuser)
16. [Dominio 16: `audit` (Logging Attività Condivise)](#16-dominio-audit-logging-attivit%C3%A0-condivise)
17. [Dominio 17: `sync` (Sincronizzazione Dashboard Aggregata)](#17-dominio-sync-sincronizzazione-dashboard-aggregata)
18. [Dominio 18: `shopping` (Liste Spesa, Prodotti, Fornitori, Lotti)](#18-dominio-shopping-liste-spesa-prodotti-fornitori-lotti)
19. [Dominio 19: `system_boot` (Diagnostica Avvio & Bootstrap)](#19-dominio-system_boot-diagnostica-avvio--bootstrap)

---

## 🏛️ Standard Architetturali Trasversali

- **Convenzione Nomi Normalizzati**: Tutti i campi descrittivi o nominativi su entità catalogate hanno il suffisso `_normalized` (es. `category_name_normalized`, `name_normalized`, `unit_name_normalized`). Il campo generico `name` non è ammesso.
- **DTO Pydantic**: 
  - Richieste in ingresso: ereditano da `StrictBaseModel` (`extra = "forbid"`).
  - Risposte in uscita: ereditano da `ORMBaseModel` (`from_attributes = True`).
- **Autenticazione**: Bearer Token JWT con Access Token (scadenza breve) e Refresh Token (scadenza lunga) con supporto al cambio password obbligatorio (`must_change_password`).
- **Isolamento Dati**: Ogni entità utente contiene `user_id` o `owner_id` indicizzato e non nullo. I repository forzano sempre il filtro `user_id == current_user.id`.

---

## 1. Dominio `auth` (Autenticazione & Sicurezza)

### Responsabilità
Gestisce il ciclo di vita delle sessioni, la registrazione, l'emissione dei token JWT (Access/Refresh), la validazione delle password tramite `bcrypt` e la gestione della sicurezza (revoca e blocco token).

### Modelli e Struttura Dati
- Tabella `users` (chiavi di accesso: `username`, `email`, `password_hash`, `is_superuser`, `must_change_password`, `deleted_at`).
- Tabella `auth_tokens` / blacklist token revocati.

### Endpoint Principali
| Metodo | Rotta | Descrizione | Autenticazione |
|---|---|---|:---:|
| `POST` | `/auth/register` | Registrazione nuovo utente | No |
| `POST` | `/auth/login` | Login con credenziali (OAuth2 Password Request Form) | No |
| `POST` | `/auth/refresh` | Rinnovo dell'Access Token tramite Refresh Token valido | No |
| `POST` | `/auth/logout` | Revoca della sessione corrente | Bearer Token |
| `POST` | `/auth/change-password` | Cambio password utente (anche obbligatorio) | Bearer Token |

### Regole Operative
- Le password devono rispettare i criteri di robustezza minimi (almeno 8 caratteri, caratteri alfanumerici e speciali).
- Un utente con `deleted_at IS NOT NULL` non può effettuare il login.

---

## 2. Dominio `users` (Gestione Utenti & Profilo)

### Responsabilità
Visualizzazione e aggiornamento dei dettagli anagrafici, preferenze di notifica, visualizzazione del profilo corrente.

### Modelli
- `User` (`id`, `username`, `email`, `is_superuser`, `status_id`, `created_at`, `updated_at`, `deleted_at`).

### Endpoint Principali
| Metodo | Rotta | Descrizione |
|---|---|---|
| `GET` | `/users/me` | Recupera profilo e metadati dell'utente autenticato |
| `PATCH` | `/users/me` | Aggiorna email, username o impostazioni |
| `GET` | `/users/{id}` | Recupera dettagli utente (con controllo di permessi) |

---

## 3. Dominio `config` & `catalogs` (Configurazioni & Codici Catalogo)

### Responsabilità
Manutenzione delle costanti di sistema (`config`), chiavi applicative e codici tipizzati (`config_codes`) usati come enumeratori arricchiti su DB.

### Modelli
- `Config` (`key`, `value`, `descrizione`, `created_at`, `updated_at`).
- `ConfigCode` (`id`, `code_type`, `code_value`, `code_name`, `display_name`, `sort_order`, `active`, `description`).

### Endpoint Principali
| Metodo | Rotta | Descrizione |
|---|---|---|
| `GET` | `/catalogs/config` | Lettura di tutte le configurazioni attive |
| `GET` | `/catalogs/codes` | Lettura codici catalogo (filtrabili per `code_type`) |
| `PATCH` | `/admin/catalogs/config/{key}` | Modifica valore chiave (Superuser) |
| `POST` | `/admin/catalogs/codes` | Creazione nuovo codice catalogo (Superuser) |

---

## 4. Dominio `categories` (Categorie Personalizzate)

### Responsabilità
Gestione delle categorie utente per la classificazione trasversale di attività, eventi di calendario e abitudini.

### Modelli
- `UserCategory` (`id`, `user_id`, `category_name_normalized`, `color`, `icon`, `sort_order`, `active`, `created_at`).

### Regole Operative
- Il nome viene normalizzato in minuscolo senza spazi multipli prima del salvataggio.
- Le categorie standard di default vengono generate automaticamente al bootstrap o al primo login dell'utente tramite `seed_default_user_categories_for_user`.

---

## 5. Dominio `tasks` (Attività & Sotto-task)

### Responsabilità
Organizzazione di todo, task pianificati, date di scadenza, priorità (`bassa`, `media`, `alta`), stati di completamento e gerarchie ricorsive con subtask.

### Modelli
- `Task` (`id`, `user_id`, `category_id`, `titolo`, `descrizione`, `fatto`, `priorita`, `data_start`, `data_scadenza`, `data_fatto`, `parent_id`).

### Regole di Business
- **Rilevamento Cicli**: L'assegnazione di `parent_id` controlla l'albero gerarchico per evitare riferimenti circolari infiniti.
- **Transizioni di Stato**: Quando un task passa a `fatto=True`, `data_fatto` viene impostato automaticamente con timestamp UTC corrente.

---

## 6. Dominio `events` (Calendario & Ricorrenze)

### Responsabilità
Gestione degli eventi di calendario a data singola o ricorrenti con motore RRULE (`expand_events_for_range`).

### Modelli
- `Event` (`id`, `user_id`, `category_id`, `titolo`, `descrizione`, `data_inizio`, `data_fine`, `tutto_il_giorno`, `rrule`, `luogo`).

### Regole Operative
- Gli endpoint di lettura range espandono le ricorrenze calcolando le istanze virtuali comprese nell'intervallo `[start_date, end_date]`.

---

## 7. Dominio `habits` (Abitudini, Periodi & Log)

### Responsabilità
Tracking delle abitudini quotidiane, obiettivi di frequenza/target e storico delle esecuzioni.

### Modelli
- `Habit` (`id`, `user_id`, `titolo`, `tipo`, `categoria_id`, `note`, `colore`, `icona`).
- `HabitPeriod` (`id`, `habit_id`, `data_inizio`, `data_fine`, `target`).
- `HabitLog` (`id`, `habit_id`, `data_riferimento`, `valore`, `completato`, `note`).

### Regole Operative
- È garantito il vincolo di unicità `(habit_id, data_riferimento)` per ogni log giornaliero.

---

## 8. Dominio `planning` (Daily Entries & Diari)

### Responsabilità
Pianificazione giornaliera strutturata: Obiettivo del Giorno (`OD`), Priorità (`P1`, `P2`, `P3`), Eventi Positivi (`EP`), Eventi Negativi (`EN`), Note Libere.

### Modelli
- `DailyEntry` (`id`, `user_id`, `data_riferimento`, `tipo`, `testo`, `fatto`, `ordine`).

---

## 9. Dominio `monthly_entries` (Pianificazione & Note Mensili)

### Responsabilità
Gestione degli obiettivi e delle retrospettive a livello di mese (`year`, `month`), inclusi propositi e riflessioni emotive.

### Modelli
- `MonthlyEntry` (`id`, `user_id`, `anno`, `mese`, `tipo`, `testo`, `ordine`).

---

## 10. Dominio `yearly_entries` (Visione & Obiettivi Annuali)

### Responsabilità
Raccoglie la visione a lungo termine e gli obiettivi macro suddivisi per annualità (`anno`).

### Modelli
- `YearlyEntry` (`id`, `user_id`, `anno`, `tipo`, `testo`, `ordine`).

---

## 11. Dominio `countdowns` (Timer & Scadenze)

### Responsabilità
Monitoraggio di eventi con scadenza futura e calcolo automatico dei giorni rimanenti.

### Modelli
- `Countdown` (`id`, `user_id`, `title`, `target_date`, `category_id`, `status`, `notes`).

---

## 12. Dominio `bingo` (Griglia Obiettivi Annuale 5x5)

### Responsabilità
Lavagna 5x5 (esattamente 25 celle) associata a un anno solare, per il tracciamento ludico e visivo dei traguardi personali.

### Modelli
- `BingoCard` (`id`, `user_id`, `year`, `position`, `text`, `is_completed`, `completed_at`).

### Vincoli
- `position` deve essere un intero compreso tra `0` e `24`. Max 25 elementi per combinazione `(user_id, year)`.

---

## 13. Dominio `notifications` (Notifiche In-App)

### Responsabilità
Sistema di messaggistica e alert in-app con supporto per tipi di notifica configurabili, lettura cumulativa e soft-delete.

### Modelli
- `Notification` (`id`, `user_id`, `notification_type_id`, `title`, `message`, `read_at`, `created_at`, `updated_at`, `deleted_at`).

### Endpoint
| Metodo | Rotta | Descrizione |
|---|---|---|
| `GET` | `/notifications` | Lista notifiche attive non eliminate |
| `PATCH` | `/notifications/{id}/read` | Segna notifica singola come letta |
| `POST` | `/notifications/read-all` | Segna tutte le notifiche dell'utente come lette |
| `DELETE` | `/notifications/{id}` | Soft-delete della notifica |

---

## 14. Dominio `analytics` (Aggregazioni & Storico Prezzi)

### Responsabilità
Motore analitico per il monitoraggio della spesa, calcolo dei prezzi medi/migliori per fornitore e storico prezzi acquisto dei prodotti.

### Funzioni Core del Service
- `get_supplier_price_summaries(product_id)`: Calcola per ogni fornitore `last_price`, `best_price` e `avg_normal_price` (escludendo le promozioni dal prezzo medio).
- `get_price_history(product_id)`: Ritorna la cronologia ordinata dei lotti acquistati con data, fornitore, prezzo, quantità e flag offerta.

---

## 15. Dominio `admin` (Pannello Amministrazione & SuperUser)

### Responsabilità
Funzionalità ad accesso controllato per i superuser: gestione utenti, reset password centralizzato, disabilitazione e ripristino account.

### Guard di Sicurezza
Tutti gli endpoint di `/admin` sono protetti dalla dependency `deps.require_superuser`.

---

## 16. Dominio `audit` (Logging Attività Condivise)

### Responsabilità
Event sink per la registrazione delle attività critiche di sistema tra i diversi moduli.

### Modelli
- `SharedActivityLog` (`id`, `module_code_id`, `entity_type_id`, `action_type_id`, `entity_id`, `performed_by_user_id`, `created_at`, `payload_before`, `payload_after`).

---

## 17. Dominio `sync` (Sincronizzazione Dashboard Aggregata)

### Responsabilità
Fornisce payload ottimizzati per il bootstrap e il rendering veloce del client frontend, aggregando in una singola chiamata i dati giornalieri, settimanali o mensili.

### Endpoint
- `GET /sync/day?data_riferimento=YYYY-MM-DD`
- `GET /sync/week?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
- `GET /sync/month?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
- `GET /sync/month-review?year=YYYY&month=MM`

---

## 18. Dominio `shopping` (Liste Spesa, Prodotti, Fornitori, Lotti)

### Responsabilità
Gestione avanzata della spesa collaborativa o privata:
- Liste della spesa con visibilità e stati.
- Catalogo prodotti e fornitori normalizzati.
- Unità di misura standard (`kg`, `pz`, `l`, `g`).
- Lotti di inventario (`InventoryBatch`) per il tracciamento dei prezzi e delle scorte.

---

## 19. Dominio `system_boot` (Diagnostica Avvio & Bootstrap)

### Responsabilità
Gestione degli stati di avvio dell'applicazione, verifica integrità delle tabelle core, migrazioni Alembic e procedura guidata per la creazione del primo SuperUser.

### Stati Possibili (`boot_status`)
- `EMPTY`: Database vuoto, richiede `POST /api/system-boot/run`.
- `LEGACY_SCHEMA_DETECTED`: Tabelle presenti ma metadati assenti, richiede `POST /api/system-boot/metadata/init`.
- `SUPERUSER_REQUIRED`: Schema pronto, richiede `POST /api/system-boot/superuser`.
- `READY`: Sistema completamente operativo, accesso autorizzato all'applicazione.
