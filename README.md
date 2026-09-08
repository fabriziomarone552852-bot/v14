# 📅 Smart Agenda

Applicazione per la gestione intelligente dell'agenda personale, impegni, compiti, liste della spesa e tracciamento abitudini.
Il progetto è strutturato con un'architettura moderna **Dual-UI** (Desktop Web + Mobile App nativa Android) supportata da un backend sicuro collegato tramite **Tailscale WireGuard**.

---

## 🏛️ Architettura del Progetto

Il frontend è sviluppato in **React 19 + TypeScript + Vite + Tailwind CSS** e condivide al 100% la logica di business, le chiamate API e l'autenticazione JWT, separando in modo pulito l'interfaccia Desktop da quella Mobile.

```text
frontend/src/
│
├── 🧠 [MODULI CONDIVISI (CORE)]
│   ├── api/                   # Tutte le chiamate HTTP e websocket al server backend
│   ├── context/               # AuthContext (JWT, permessi, utente corrente), DayContext
│   ├── types/                 # Interfacce TypeScript (Eventi, Task, Spesa, Categorie)
│   └── utils/                 # Utility per formattazione date, conversioni, filtri
│
├── 💻 [VISTE DESKTOP WEB] (Visualizzazione classica per browser PC)
│   ├── components/            # AppShellLayout, Sidebar laterale estesa, Navbar PC
│   └── views/                 # HomePage, DayPage, WeekPage, MonthPage, YearPage, ecc.
│
├── 📱 [VISTE MOBILE APP] (Visualizzazione ottimizzata per smartphone Android)
│   └── mobile/
│       ├── components/        # MobileHeader, MobileBottomNav, AgendaViewSwitcher
│       ├── layouts/           # MobileAppShell.tsx (Layout nativo con supporto Safe-Area)
│       ├── views/             # MobileSettingsView (Hub unico: Profilo, Archivio, Admin, Logout)
│       └── routes/            # MobileRoutes.tsx (Rotte per smartphone)
│
└── 🔀 [ROUTING INTELLIGENTE]
    └── router/AppRouter.tsx   # Rileva se l'app gira su Android (Capacitor) o se è in modalità anteprima PC
```

---

## 📱 Struttura dell'App Mobile

L'applicazione per smartphone è progettata per l'uso ad una mano:

1. **Barra di Navigazione Inferiore (Bottom Bar)** con 3 macro-sezioni:
   - 📅 **Agenda**: vista principale degli appuntamenti e delle attività.
   - 🛒 **Spesa**: gestione liste spesa con checklist touch rapida.
   - ⚙️ **Impostazioni & Altro**: hub unificato che raggruppa:
     - Gestione Profilo e Cambio Password
     - **Archivio Dati** (Task completati, Note, Eventi, Obiettivi, Abitudini, Fornitori, Tag)
     - **Pannello Amministrazione / Superuser** (se admin)
     - Pulsante **Esci (Logout)**
2. **In Alto nella sezione Agenda**:
   - Selettore orizzontale a 4 pulsanti per cambiare al volo tra **Giorno (Day)**, **Settimana (Week)**, **Mese (Month)** e **Anno (Year)**.

---

## 💻 Come Sviluppare e Testare su PC (Senza passare l'APK)

Puoi sviluppare e testare sia l'interfaccia Desktop che quella Mobile direttamente dal browser del tuo computer con **hot-reload istantaneo in meno di 1 secondo**:

1. Apri un terminale nella cartella `frontend/` e avvia il server di sviluppo:
   ```bash
   npm run dev
   ```
2. Apri il browser all'indirizzo `http://localhost:5173`.
3. **Per passare alla vista Mobile**:
   - Clicca sul pulsante **"📱 Vista Mobile"** in basso nella sidebar desktop, oppure aggiungi `?mode=mobile` all'URL.
   - Premi `F12` nel browser e clicca sull'icona dello smartphone (*Toggle Device Toolbar*) per visualizzare l'app nelle dimensioni esatte di un telefono.
4. Ogni modifica salvata nei file della cartella `frontend/src/mobile/` si aggiornerà istantaneamente a schermo.

---

## 📦 Compilazione dell'APK Android

La compilazione dell'APK è completamente automatizzata tramite Docker e non richiede l'installazione manuale di Android Studio o SDK locali:

1. Apri un terminale PowerShell nella root del progetto:
   ```powershell
   .\build_apk.ps1
   ```
2. Lo script:
   - Compila il bundle web ottimizzato con Vite (`npm run build`).
   - Sincronizza gli asset nell'applicazione Android (`npx cap sync android`).
   - Compila e firma l'APK nativo con la chiave permanente `smartagenda.keystore`.
   - Genera il file finale **`smartagenda.apk`** nella cartella principale del progetto.

### 🔄 Aggiornamenti In-Place
Tutte le compilazioni utilizzano lo stesso certificato crittografico (`smartagenda.keystore`). Quando installi una nuova versione dell'APK sullo smartphone, Android la riconoscerà automaticamente come un aggiornamento ufficiale, senza dover disinstallare l'app e senza perdere credenziali o dati memorizzati.

---

## 🔒 Connessione Sicura Tailscale (`tsnet`)

L'APK include un micro-proxy WireGuard integrato compilato in Go (`android-tsnet/tsnetproxy.go`):
- All'avvio dell'app, stabilisce un tunnel crittografato direttamente con il MagicDNS del server (`smartagenda.tailf3b58c.ts.net:8181`).
- Utilizza chiamate native `getifaddrs` da libc Bionic per garantire piena compatibilità con i criteri di sicurezza SELinux di Android 11+.
- Le credenziali del nodo vengono salvate nella memoria privata protetta dell'app (`/data/data/com.smartagenda.app/files/tsnet/`).
