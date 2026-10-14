# 🚀 Manuale Operativo e Deployment su NAS QNAP (Smart Agenda VxAme14)

Questa guida raccoglie in modo organico e permanente l'intera procedura operativa per il rilascio, la gestione, il monitoraggio e l'aggiornamento dell'applicazione **Smart Agenda (VxAme14)** sull'ambiente di produzione del **NAS QNAP**.

---

## 📑 Indice dei Contenuti

1. [🌐 Accesso all'Applicazione](#1-accesso-allapplicazione)
2. [🏗️ Architettura e Container Attivi](#2-architettura-e-container-attivi)
3. [⚙️ Parametri e Credenziali di Configurazione](#3-parametri-e-credenziali-di-configurazione)
4. [🛠️ Comandi Utili di Gestione sul NAS (SSH)](#4-comandi-utili-di-gestione-sul-nas-ssh)
5. [🔄 Procedura per il Rilascio di Futuri Aggiornamenti](#5-procedura-per-il-rilascio-di-futuri-aggiornamenti)
6. [🧠 Note Tecniche e Peculiarità del NAS QNAP](#6-note-tecniche-e-peculiarità-del-nas-qnap)
7. [🔍 Diagnostica e Risoluzione dei Problemi](#7-diagnostica-e-risoluzione-dei-problemi)

---

## 1. 🌐 Accesso all'Applicazione

Da qualsiasi computer, smartphone o tablet connesso alla rete locale (LAN o Wi-Fi di casa/ufficio):

| Servizio | URL di Accesso | Descrizione |
| :--- | :--- | :--- |
| **Applicazione Web (Frontend)** | [`http://192.168.11.20:8181`](http://192.168.11.20:8181) | Interfaccia utente React SPA |
| **Schermata di Login** | [`http://192.168.11.20:8181/login`](http://192.168.11.20:8181/login) | Accesso con credenziali utente |
| **Pannello Amministrazione SU** | [`http://192.168.11.20:8181/admin`](http://192.168.11.20:8181/admin) | Gestione variabili, codici catalogo e utenti |
| **API Docs & Swagger (Frontend Proxy)** | [`http://192.168.11.20:8181/docs`](http://192.168.11.20:8181/docs) | Swagger UI inoltrato tramite Nginx (Porta 8181) |
| **API Docs & Swagger (Backend Diretto)** | [`http://192.168.11.20:8000/docs`](http://192.168.11.20:8000/docs) | Swagger UI diretto su FastAPI (Porta 8000) |
| **API ReDoc** | [`http://192.168.11.20:8181/redoc`](http://192.168.11.20:8181/redoc) | Documentazione alternativa ReDoc |

---

## 2. 🏗️ Architettura e Container Attivi

```
[ BROWSER CLIENT (PC / Tablet / Mobile in LAN) ]
                       │
                       ▼  Porta LAN :8181
┌──────────────────────────────────────────────────────────────────┐
│  NAS QNAP (192.168.11.20)                                        │
│                                                                  │
│  ┌─────────────────────────┐                                     │
│  │ vxame14_frontend        │ Nginx + React Single Page App       │
│  │ (Porta 8181 -> 80)      │                                     │
│  └────────────┬────────────┘                                     │
│               │ Proxy interno HTTP (rete virtuale vxame14_net)   │
│               ▼                                                  │
│  ┌─────────────────────────┐    Rete interna Docker              │
│  │ backend                 │ ─────────────────────────┐          │
│  │ (FastAPI, Porta 8000)   │                          │          │
│  └─────────────────────────┘                          ▼          │
│                                          ┌────────────────────┐  │
│                                          │ PostGre-Server     │  │
│                                          │ (PostgreSQL 11.0,  │  │
│                                          │  Porta :5432,      │  │
│                                          │  DB: family-smart) │  │
│                                          └────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Scheda dei Container Attivi

| Container | Immagine | Rete Docker | Porte Mappate | Ruolo |
| :--- | :--- | :--- | :--- | :--- |
| **`vxame14_frontend`** | `vxame14_frontend:latest` | `vxame14_net` | `0.0.0.0:8181->80/tcp` | Web server Nginx, file statici e reverse proxy verso `/api/` e rotte backend |
| **`backend`** | `vxame14_backend:latest` | `vxame14_net` | `0.0.0.0:8000->8000/tcp` | FastAPI backend, business logic, migrazioni Alembic automatiche al boot |
| **`PostGre-Server`** | `postgres:11.0` | `bridge`, `vxame14_net` | `0.0.0.0:5432->5432/tcp` | Database relazionale persistente |

---

## 3. ⚙️ Parametri e Credenziali di Configurazione

### Configurazione Database di Produzione
- **Host interno Docker**: `PostGre-Server` (porta standard `5432`)
- **Host esterno LAN**: `192.168.11.20:5432`
- **Nome Database**: `family-smart` *(con trattino)*
- **Utente**: `PostGre` *(con P e G maiuscole)*
- **Password**: `Password-Robusta`
- **Stringa di Connessione (SQLAlchemy / Alembic)**:
  `postgresql+psycopg://PostGre:Password-Robusta@PostGre-Server:5432/family-smart`

### Variabili d'Ambiente Backend (`.env.prod`)
- `APP_ENV=prod`
- `SECRET_KEY=DB_POOL_RECYCLE=1800DB_POOL_TIMEOUT=30DEFAULT_MAX_SUBTASK_DEPTH=3`
- `ALGORITHM=HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES=60`
- `REFRESH_TOKEN_EXPIRE_DAYS=7`
- `TMDB_API_KEY`: chiave API v3 TheMovieDatabase per il catalogo Serie TV e film
- `TMDB_READ_ACCESS_TOKEN`: Bearer Token v4 per le chiamate REST a TheMovieDatabase

---

## 4. 🛠️ Comandi Utili di Gestione sul NAS (SSH)

Connettiti al NAS via terminale:
```powershell
ssh admin@192.168.11.20
```

### Visualizzazione Stato
```bash
# Mostra tutti i container in esecuzione
docker ps

# Mostra tutti i container (inclusi quelli fermi o con errore)
docker ps -a
```

### Monitoraggio Log in Tempo Reale
```bash
# Log del Backend (FastAPI, query, migrazioni, errori di runtime)
docker logs -f backend

# Log del Frontend (richieste HTTP web e reverse proxy Nginx)
docker logs -f vxame14_frontend

# Log del Database
docker logs -f PostGre-Server
```

### Avvio, Arresto e Riavvio
```bash
# Riavviare l'applicazione (Frontend + Backend)
docker restart backend vxame14_frontend

# Fermare l'applicazione
docker stop backend vxame14_frontend

# Avviare l'applicazione dopo uno stop
docker start backend vxame14_frontend
```

### Manutenzione e Pulizia Immagini Vecchie
```bash
# Rimuove immagini orfane / non utilizzate per liberare spazio sul NAS
docker image prune -f
```

---

## 5. 🔄 Procedura per il Rilascio di Futuri Aggiornamenti

Il sistema utilizza una **versione unica unificata per tutto l'ecosistema Vita** (`package.json`, `version.json`, Web e APK Android). A seconda delle tue esigenze, puoi scegliere tra 3 script di compilazione:

### 🌟 Opzione 1: Rilascio Completo Unificato (CONSIGLIATA) — `.\build_all.ps1`
Quando vuoi rilasciare contemporaneamente sia l'aggiornamento per il NAS sia il nuovo APK Android per gli smartphone:
```powershell
.\build_all.ps1
```
Lo script esegue automaticamente tutto in un unico comando:
1. Allinea `version.json` con la versione attuale di `package.json`.
2. Compila ed esporta i container NAS (`vxame14_backend.tar` e `vxame14_frontend.tar`).
3. Compila l'APK Android per gli smartphone (`apk/vita-vX.Y.Z.apk`).
4. Genera il report finale con i percorsi di tutti i file pronti per NAS e Google Drive.

---

### 🌐 Opzione 2: Rilascio Solo-Web / NAS — `.\deploy_build_pc.ps1`
Quando hai fatto modifiche al solo backend o al sito web desktop/LAN e vuoi aggiornare esclusivamente i container del NAS:
```powershell
.\deploy_build_pc.ps1
```
- Allinea `version.json` e verifica l'integrità del sistema.
- Compila ed esporta i container `vxame14_backend.tar` e `vxame14_frontend.tar`.

---

### 📱 Opzione 3: Compilazione Solo-Mobile APK — `.\build_apk.ps1`
Quando vuoi compilare esclusivamente il nuovo pacchetto APK per smartphone:
```powershell
.\build_apk.ps1
```
- Compila il bundle mobile Vite e genera l'APK nativo in `apk/vita-vX.Y.Z.apk`.
- Allinea `version.json` locale.

> 💡 **Nota Operativa**: Se devi rilasciare sia l'aggiornamento NAS sia l'APK, **usa direttamente `.\build_all.ps1`**: compila entrambi in parallelo e garantisce che il sito sul NAS e l'APK su Drive abbiano esattamente lo stesso numero di versione. Se usi gli script separati, esegui prima `.\build_apk.ps1` e poi `.\deploy_build_pc.ps1`.

---

### FASE B: Trasferimento e Avvio sul NAS
1. Copia i file `.tar` e lo script `deploy_nas.sh` nella cartella condivisa del NAS:
   `\\192.168.11.20\Container\VxAme14\`
2. Dal terminale SSH del NAS, esegui:
   ```bash
   cd /share/CACHEDEV1_DATA/Container/VxAme14
   sh deploy_nas.sh
   ```

Lo script `deploy_nas.sh` carica le nuove immagini, riavvia i container con tutti i parametri corretti e applica automaticamente eventuali nuove migrazioni del database con Alembic.

### FASE C: Caricamento APK su Google Drive (Se compilato)
Carica il nuovo file `apk/vita-vX.Y.Z.apk` nella cartella Google Drive condivisa:
`https://drive.google.com/drive/folders/1UrahhXpwuU4xPXjF1aT83LflnhIeEkPz?usp=sharing`
Gli utenti riceveranno automaticamente il popup di invito all'aggiornamento appena apriranno l'app sul telefono!

---

## 6. 🧠 Note Tecniche e Peculiarità del NAS QNAP

### 1. Docker Engine Datato (v17.09.1-ce)
- **Motivo**: Il firmware QNAP monta Docker CE 17.09 con kernel Linux 4.2.8.
- **Conseguenza**: Il comando `docker compose` (con spazio) non esiste, e `docker build` da NAS fallisce con `missing signature key` a causa dei nuovi manifest OCI v2 di Docker Hub.
- **Regola**: Compilare sempre le immagini sul PC Windows con Docker Desktop aggiornato ed esportarle via `docker save` / `docker load`.

### 2. Flag Obbligatorio `--privileged`
- **Motivo**: Il sottosistema di sicurezza *seccomp* del kernel 4.2.8 blocca chiamate `pwrite` su file di processo Nginx (`/run/nginx.pid`).
- **Regola**: Entrambi i container `backend` e `vxame14_frontend` devono essere avviati con il flag `--privileged`.

### 3. Conflitto Porta 8080 (Apache Proxy QNAP)
- **Motivo**: La porta standard `8080` è utilizzata internamente dai servizi di sistema del NAS (`apache_proxy` e `thttpd`).
- **Regola**: Il frontend espone la porta **`8181`** verso l'esterno (`-p 8181:80`).

### 4. Rete Interna Condivisa `vxame14_net`
- **Motivo**: Se un container cerca di contattare l'IP LAN `192.168.11.20`, il router NAT interno del NAS chiude la connessione (*hairpinning failure*).
- **Regola**: I tre container (`vxame14_frontend`, `backend`, `PostGre-Server`) comunicano tramite la rete Docker `vxame14_net` usando direttamente i loro nomi come hostname DNS interni (`backend:8000` e `PostGre-Server:5432`).

### 5. Reverse Proxy Nginx in `frontend/nginx.conf`
- **Motivo**: Il frontend React invia le chiamate API sui percorsi radice (`/auth/`, `/tasks`, `/shopping/`, `/admin/`, ecc.).
- **Regola**: Il file `frontend/nginx.conf` intercetta tutti questi percorsi e li inoltra a `http://backend:8000`, mentre tutte le altre richieste vengono gestite dalla SPA (`try_files $uri $uri/ /index.html;`).

---

## 7. 🔍 Diagnostica e Risoluzione dei Problemi

### Sintomo: Il frontend risponde `502 Bad Gateway`
1. Il container `backend` non è attivo o sta riavviandosi.
2. Controlla lo stato con `docker ps` e i log con `docker logs backend`.
3. Se è crashato per il database, verifica che `PostGre-Server` sia connesso a `vxame14_net` (`docker network connect vxame14_net PostGre-Server`).

### Sintomo: Errore `405 Method Not Allowed` al Login
1. La configurazione di Nginx non ha il blocco proxy per `/auth/login`.
2. Riesegui `sh deploy_nas.sh` per caricare la versione corretta di `frontend/nginx.conf`.

### Sintomo: `Connection refused` su PostgreSQL
1. Assicurati che `DATABASE_URL` contenga `PostGre-Server` e NON `192.168.11.20`.
2. Verifica che il container `PostGre-Server` sia in stato `Up` (`docker ps`).
