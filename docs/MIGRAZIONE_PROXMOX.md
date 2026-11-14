# 🚀 Migrazione Vita — QNAP → Proxmox & Procedura di Cutover

Questo documento descrive lo stato attuale della nuova infrastruttura su **Proxmox**, la modalità di funzionamento attuale come **ambiente di staging / beta testing**, e la **checklist operativa per il cutover definitivo**.

---

## 📌 Modalità Attuale: Proxmox come Staging / Beta Tester

Fino al momento del passaggio definitivo:
1. **Ambiente di Produzione Attivo**: Il vecchio **NAS QNAP** (`192.168.11.20`) rimane il server di produzione primario a cui si collegano tutti gli utenti via Web e tramite l'APK mobile (via Tailscale `smartagenda.tailf3b58c.ts.net`).
2. **Ambiente di Beta Testing / Staging**: Il nuovo **server Proxmox** (`192.168.11.14` per le app, `192.168.11.15` per PostgreSQL, `192.168.11.16` per Tailscale) ospita la copia speculare e aggiornata di Vita, accessibile localmente su:
   👉 `http://192.168.11.14:8181`

---

## 🌟 Procedura per il Cutover Definitivo (Promemoria Operativo)

Al momento stabilito per la messa in servizio definitiva (orario notturno a minimo disservizio):

### 1. Build Congiunta e Allineata su PC Windows (`build_all.ps1`)
Dal PC Windows, eseguire la build totale congiunta che unifica sia i container Docker per il server sia il nuovo pacchetto APK per gli smartphone, incrementando e allineando la versione in tutto l'ecosistema:
```powershell
powershell -ExecutionPolicy Bypass -File .\build_all.ps1
```
* Genera: `vxame14_backend.tar` e `vxame14_frontend.tar`.
* Genera: `apk/vita-vX.Y.Z.apk`.

### 2. Caricamento APK Mobile su Google Drive
Caricare il nuovo file `apk/vita-vX.Y.Z.apk` nella cartella condivisa Google Drive:
`https://drive.google.com/drive/folders/1UrahhXpwuU4xPXjF1aT83LflnhIeEkPz?usp=sharing`  
*(Gli utenti riceveranno il popup in-app per scaricare l'aggiornamento appena apriranno l'app).*

### 3. Trasferimento dei Nuovi `.tar` su Proxmox
Dal PC Windows:
```powershell
scp vxame14_backend.tar root@192.168.11.14:/opt/docker-apps/vita/
scp vxame14_frontend.tar root@192.168.11.14:/opt/docker-apps/vita/
```

### 4. Congelamento del QNAP (Inizio Fermo Macchina ~2-3 min)
Dal terminale del NAS QNAP:
```bash
docker stop backend vxame14_frontend
```

### 5. Sincronizzazione Dati Finale & Aggiornamento Container su Proxmox
Dal terminale dell'LXC Python (`192.168.11.14`):
```bash
cd /opt/docker-apps/vita

# Sincronizza l'ultimo dump DB, il delta uploads e allinea Alembic
bash cutover_sync_finale.sh

# Ricarica i nuovi container compilati al punto 1
bash deploy_proxmox.sh
```

### 6. Switch Hostname su Console Tailscale (30 secondi)
Nel browser su **https://login.tailscale.com/admin/machines**:
1. Ridenominare il vecchio nodo QNAP da `smartagenda` a `smartagenda-old`.
2. Ridenominare il nuovo nodo LXC da `tailproxfg` a `smartagenda`.

### 7. Fine Fermo & Verifica
* Aprire l'app mobile sullo smartphone: si collegherà automaticamente al nuovo server.
* Disattivare l'auto-restart dei vecchi container sul QNAP:
  ```bash
  docker update --restart=no backend vxame14_frontend
  ```
