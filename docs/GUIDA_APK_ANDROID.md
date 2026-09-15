# Guida Installazione e Compilazione APK Android (con Tailscale Integrato)

Questa guida illustra il funzionamento dell'applicazione Android **Smart Agenda**, come installarla sullo smartphone e come ricompilarla in futuro.

---

## 📱 1. Come Installare l'APK sullo Smartphone

Il file APK già pronto per l'installazione si trova nella cartella **`apk/`** del progetto:
👉 [`apk/smartagenda.apk`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/apk/smartagenda.apk) (oppure la specifica versione versionata [`apk/smartagenda-v14.1.0.apk`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/apk/smartagenda-v14.1.0.apk))

### Passaggi:
1. **Trasferimento del file**:
   - Invia il file `smartagenda.apk` (dalla cartella `apk/`) al tuo smartphone (o a quello dei tuoi amici) tramite cavo USB, WhatsApp, Telegram, Google Drive, email o Nearby Share / Quick Share.
2. **Installazione**:
   - Fai tap sul file `.apk` scaricato sullo smartphone.
   - Se Android mostra l'avviso di sicurezza, seleziona **"Impostazioni"** e consenti l'installazione da questa sorgente ("Origini sconosciute" o "Consenti da questa fonte").
   - Tocca **"Installa"** e infine **"Apri"**.
3. **Primo Accesso (Configurazione Una Tantum)**:
   - Al primissimo avvio, l'applicazione avvia il micro-proxy WireGuard interno (`tsnet`).
   - Verrà aperto automaticamente il browser del telefono con la schermata di login a Tailscale.
   - Effettua l'accesso con la tua email (o il tuo amico con la propria email di Tailscale) e approva la connessione del dispositivo.
   - Da questo momento in poi, le chiavi crittografiche rimangono memorizzate nella memoria interna protetta dell'app: **ai successivi avvii l'app si aprirà subito in background senza chiedere più nulla**, come una normale app nativa.

---

## 🔁 2. Come Funziona lo Script `.\build_apk.ps1`

Sì, eseguendo semplicemente il comando nel terminale PowerShell:

```powershell
.\build_apk.ps1
```

lo script fa **completamente tutto in automatico**:

1. **Compila il Frontend React** (`npm run build:mobile` con Vite): genera la versione ottimizzata e minificata dell'interfaccia mobile escludendo i file desktop per ridurre al minimo il peso dell'app.
2. **Sincronizza gli Asset** (`npx cap sync android`): copia i file web aggiornati dentro i sorgenti Android di Capacitor.
3. **Compila il micro-proxy Tailscale Go** (`tsnetproxy.aar`): garantisce che il modulo WireGuard nativo per smartphone Android ARM64 sia aggiornato.
4. **Compila l'APK Android con Gradle e JDK 21**: esegue il build in un container Docker isolato, risolve tutte le dipendenze e firma l'APK in modalità debug.
5. **Salvataggio dei file finali**: rilascia i file **`smartagenda.apk`** e **`smartagenda-vX.Y.Z.apk`** direttamente nella cartella dedicata **[`apk/`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/apk/)**.

> [!NOTE]
> L'unico prerequisito per eseguire `.\build_apk.ps1` è avere **Docker Desktop** aperto e in esecuzione sul PC.
