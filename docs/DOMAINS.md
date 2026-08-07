# Catalogo dei Domini Applicativi Backend

Il backend è composto da **19 domini modulari**, ciascuno responsabile di uno specifico ambito funzionale.

---

## 📋 Elenco Domini

| Dominio | Directory | Descrizione e Responsabilità |
| :--- | :--- | :--- |
| **`admin`** | `backend/domains/admin` | Rotte e pannello riservato agli amministratori/superuser. |
| **`analytics`** | `backend/domains/analytics` | Metriche, storici prezzi fornitori e statistiche di utilizzo. |
| **`audit`** | `backend/domains/audit` | Tracciamento e logging delle attività condivise di sistema. |
| **`auth`** | `backend/domains/auth` | Login, refresh token JWT, registrazione e cambio password obbligatorio. |
| **`catalogs`** | `backend/domains/catalogs` | Cataloghi pubblici e di amministrazione. |
| **`categories`** | `backend/domains/categories` | Categorie personalizzabili user-scoped (Task, Eventi, Mood, Comuni). |
| **`config`** | `backend/domains/config` | Configurazioni applicative e codici di registro (`ConfigCode`). |
| **`countdowns`** | `backend/domains/countdowns` | Gestione timer e punti di riferimento temporali/scadenze. |
| **`events`** | `backend/domains/events` | Gestione eventi di calendario e regole di ricorrenza RRULE. |
| **`habits`** | `backend/domains/habits` | Monitoraggio abitudini, periodi di validità e log giornalieri. |
| **`monthly_entries`** | `backend/domains/monthly_entries` | Ingressi mensili, bilancio delle emozioni e valutazioni. |
| **`notifications`** | `backend/domains/notifications` | Notifiche utente generiche e di sistema. |
| **`planning`** | `backend/domains/planning` | Ingressi e pianificazione giornaliera (*Daily Entries*). |
| **`shopping`** | `backend/domains/shopping` | Liste spesa collaborative, gruppi, articoli, prodotti, fornitori ed inventario. |
| **`sync`** | `backend/domains/sync` | Sincronizzazione dati multi-dispositivo. |
| **`system_boot`** | `backend/domains/system_boot` | Diagnostica di avvio, creazione schema, seeding e creazione SuperUser. |
| **`tasks`** | `backend/domains/tasks` | Gestione attività, priorità, scadenze e sotto-task ricorsivi (con rilevamento cicli). |
| **`users`** | `backend/domains/users` | Gestione profili utenti, credenziali e impostazioni personali. |

---

## 🧱 Convenzione di Struttura File di Dominio

```
backend/domains/<nome_dominio>/
├── __init__.py        # Export puliti del dominio
├── models.py          # Modelli SQLAlchemy
├── schemas.py         # DTO Pydantic
├── repository.py      # Query e accesso al database
├── service.py         # Logica di business e regole applicative (+ seeder)
└── router.py          # Endpoint HTTP FastAPI
```
