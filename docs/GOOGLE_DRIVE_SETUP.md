# Guida alla Configurazione di Google Drive API per Vita

Questa guida spiega come configurare le credenziali di Google Drive (100% gratuite e sicure) per consentire agli script di build (`build_all.ps1` e `build_apk.ps1`) di caricare automaticamente i nuovi file APK nella cartella condivisa di Google Drive.

---

## ⏱️ Tempo stimato: 3-5 minuti (Solo la prima volta)

### Passo 1: Crea un Progetto su Google Cloud (Gratuito)
1. Apri la [Google Cloud Console](https://console.cloud.google.com/) nel browser effettuando l'accesso con il tuo account Google.
2. In alto a sinistra (accanto al logo "Google Cloud"), clicca sul selettore dei progetti e poi su **Nuovo progetto** (New Project).
3. Inserisci come nome: `Vita-Uploader` (o il nome che preferisci).
4. Clicca su **Crea**. Assicurati che in alto sia selezionato il nuovo progetto appena creato.

---

### Passo 2: Abilita la Google Drive API
1. Nel menu laterale a sinistra, vai su **API e servizi** > **Libreria** (APIs & Services > Library).
2. Nella barra di ricerca digita: `Google Drive API` e premi Invio.
3. Clicca sul riquadro **Google Drive API** e poi sul pulsante blu **Abilita** (Enable).

---

### Passo 3: Configura la Schermata di Consenso OAuth
1. Nel menu laterale, vai su **API e servizi** > **Schermata consenso OAuth** (OAuth consent screen).
2. Seleziona **Esterno** (External) e clicca su **Crea**.
3. Compila solo i campi essenziali:
   - **Nome applicazione**: `Vita`
   - **Email di supporto utente**: seleziona la tua email Gmail
   - **Dati di contatto dello sviluppatore**: inserisci la tua email Gmail
4. Clicca su **Salva e continua**.
5. Nella schermata **Ambiti** (Scopes): scorri in fondo e clicca direttamente su **Salva e continua**.
6. Nella schermata **Utenti di test** (Test users):
   - Clicca su **+ ADD USERS** (Aggiungi utenti).
   - Inserisci la tua email Gmail (quella proprietaria della cartella Drive).
   - Clicca su **Aggiungi** e poi su **Salva e continua**.

---

### Passo 4: Crea e Scarica le Credenziali (`credentials.json`)
1. Nel menu laterale, vai su **API e servizi** > **Credenziali** (Credentials).
2. In alto, clicca su **+ CREA CREDENZIALI** (+ CREATE CREDENTIALS) e seleziona **ID client OAuth** (OAuth client ID).
3. Nel campo **Tipo di applicazione**, seleziona: **Applicazione desktop** (Desktop app).
4. Come nome puoi lasciare `Client desktop 1` o scrivere `Vita Uploader`.
5. Clicca su **Crea**.
6. Si aprirà una finestra di conferma: clicca su **SCARICA JSON** (Download JSON).
7. Rinomina il file scaricato esattamente in:
   `credentials.json`
8. Sposta il file nella cartella:
   `c:\Users\Fabrizio\Desktop\app\smart\v14\scripts\credentials.json`
   *(oppure direttamente nella radice del progetto `v14`)*.

> 🔒 **Nota di Sicurezza**: Il file `credentials.json` e il generato `token.json` sono già inseriti in `.gitignore` e non verranno mai caricati su GitHub.

---

### Passo 5: Primo Avvio & Autorizzazione (Una Tantum)
Per verificare che tutto funzioni subito senza dover fare un'intera build, puoi lanciare da terminale PowerShell:

```powershell
python scripts/upload_to_drive.py --file apk/vita.apk
```

1. Lo script aprirà automaticamente una pagina nel tuo browser.
2. Seleziona il tuo account Google.
3. Se Google mostra l'avviso *"Google non ha verificato questa app"*, clicca su **Avanzate** (in basso) e poi su **Apri Vita (non sicura)**: è del tutto normale perché è un'app privata creata da te per uso personale.
4. Clicca su **Continua** / **Consenti** per autorizzare l'accesso.
5. Torna al terminale: vedrai comparire `[OK] Token salvato con successo in: ...\scripts\token.json`.

---

### 🎉 Fatto!
Da questo momento in poi l'autorizzazione è memorizzata permanentemente. Ogni volta che lancerai `build_all.ps1` o `build_apk.ps1`, l'APK verrà caricato su Google Drive in automatico in background!
