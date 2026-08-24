# Architettura Applicativa: Smart Agenda

## 📌 Panoramica del Sistema

**Smart Agenda** è una piattaforma full-stack progettata secondo l'architettura **Monolite Modulare (Domain-Driven Design)** per garantire massima manutenibilità, isolamento delle responsabilità ed estensibilità immediata.

```
 ┌─────────────────────────────────────────────────────────────┐
 │                      Frontend (React 19)                    │
 │               TypeScript + Vite + TailwindCSS 4             │
 └──────────────────────────────┬──────────────────────────────┘
                                │ HTTP / REST API (JSON)
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                  Backend FastAPI (Python)                   │
 │       Middleware system_boot_guard + CORS + Security Scope   │
 ├─────────────────────────────────────────────────────────────┤
 │                19 Domini Modulari Indipendenti              │
 │    [admin, analytics, audit, auth, catalogs, categories,    │
 │     config, countdowns, events, habits, monthly_entries,    │
 │     notifications, planning, shopping, sync, system_boot,   │
 │     tasks, users]                                           │
 └──────────────────────────────┬──────────────────────────────┘
                                │ ORM (SQLAlchemy 2.x + psycopg3)
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                     PostgreSQL Server                       │
 │              (Multi-Ambiente: Dev, Test, Prod)              │
 └─────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Pattern dei 4 Layer per ciascun Dominio

Tutti i domini del sistema rispettano in modo rigoroso la separazione nei 4 layer architetturali:

1. **`models.py` (Persistence Layer)**:
   - Definisce le entità ed i modelli ORM mappati sulle tabelle PostgreSQL.
   - Tutti i modelli ereditano dalla classe dichiarativa condivisa `Base` ([backend/core/database.py](file:///c:/Users/user/Documents/PYTHON/VxAme14/backend/core/database.py)).

2. **`schemas.py` (Validation Layer)**:
   - Definisce i Data Transfer Objects (DTO) tramite Pydantic v2 per la validazione tipizzata di input ed output delle API.

3. **`repository.py` (Data Access Layer)**:
   - Incapsula in modo esclusivo tutte le query di lettura e scrittura sul database tramite SQLAlchemy.
   - Rende il codice di business del servizio indipendente dall'implementazione specifica della persistenza.

4. **`service.py` (Business Logic Layer)**:
   - Contiene la logica di business, le regole applicative, le validazioni complesse e l'invocazione del repository.
   - Implementa eventuale seeder registrato tramite `@register_seeder`.

5. **`router.py` (Presentation / HTTP Layer)**:
   - Espone gli endpoint HTTP FastAPI, valida i parametri delle rotte e delega l'esecuzione a `service.py`.

---

## 🔒 Sicurezza ed Autenticazione

- **Password Hashing**: Utilizza **Argon2** (`argon2-cffi`) per la cifratura sicura delle password.
- **JWT Scope Control**:
  - `scope="app"`: Token standard per l'utilizzo dell'applicazione.
  - `scope="password_change"`: Token a portata limitata assegnato al SuperUser/utente quando `must_change_password=True`. Forza il cambio della password prima di consentire l'accesso a qualsiasi altra rotta.
