# Gestione Ambienti di Esecuzione (Multi-Environment)

Il sistema supporta tre ambienti isolati e ben distinti, ciascuno con il proprio database PostgreSQL target e parametri runtime dedicati.

---

## 🌍 Panoramica degli Ambienti

| Ambiente | Variabile `APP_ENV` | File Configurazione | Target Server Database | Database | Porta DB | Persistenza | Script Avvio Batch |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Sviluppo (`dev`)** | `dev` | [backend/.env.dev](file:///c:/Users/user/Documents/PYTHON/VxAme14/backend/.env.dev) | PostgreSQL su Docker locale | `family-smart` | `5433` | Non persistente (Effimero) | `dev.bat`, `alembic-dev.bat` |
| **Test (`test`)** | `test` | [backend/.env.test](file:///c:/Users/user/Documents/PYTHON/VxAme14/backend/.env.test) | PostgreSQL su NAS in LAN | `test-smart` | `5432` | Persistente (NAS) | `test.bat`, `alembic-test.bat` |
| **Produzione (`prod`)** | `prod` | [backend/.env.prod](file:///c:/Users/user/Documents/PYTHON/VxAme14/backend/.env.prod) | PostgreSQL su NAS in LAN | `family-smart` | `5432` | Persistente (NAS) | `prod.bat`, `alembic-prod.bat` |

---

## ⚙️ Bootstrap Deterministico delle Variabili d'Ambiente

Il caricamento delle configurazioni avviene all'avvio in modo deterministico tramite [backend/core/env.py](file:///c:/Users/user/Documents/PYTHON/VxAme14/backend/core/env.py):

1. `env.py` viene importato prima di qualunque altro modulo.
2. Legge la variabile d'ambiente `APP_ENV` (default `dev`).
3. Carica il file `.env.<APP_ENV>` corrispondente senza inquinare le variabili d'ambiente globali del sistema operativo.
4. `backend/core/settings.py` valida e converte i valori in un oggetto fortemente tipizzato tramite `Pydantic BaseSettings`.

---

## 🚀 Avvio Rapido da Terminale / Batch

- **Ambiente di Sviluppo Locale**:
  ```cmd
  dev.bat
  ```
  Avvia il backend FastAPI su `http://localhost:8000` (con `APP_ENV=dev` e DB locale su porta `5433`) ed il frontend Vite su `http://localhost:5173`.

- **Ambiente di Test (Database `test-smart` su NAS)**:
  ```cmd
  test.bat
  ```
  Avvia il backend su `http://localhost:8000` collegato al database **`test-smart`** persistente situato sul NAS QNAP (`192.168.11.20:5432`).

- **Ambiente di Produzione (Database `family-smart` su NAS)**:
  ```cmd
  prod.bat
  ```
  Avvia il backend su `http://localhost:8000` collegato al database **`family-smart`** persistente di produzione situato sul NAS QNAP (`192.168.11.20:5432`).

---

## 🗄️ Gestione Migrazioni Database (Alembic)

Per applicare le migrazioni allo schema nei rispettivi ambienti:

- **Sviluppo**: `alembic-dev.bat upgrade head`
- **Test**: `alembic-test.bat upgrade head`
- **Produzione**: `alembic-prod.bat upgrade head`
