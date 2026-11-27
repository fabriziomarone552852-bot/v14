# 🚀 Infrastruttura Vita su Proxmox (Migrazione Completata)

Questo documento traccia l'architettura attiva di **Vita** su **Proxmox** (migrazione dal NAS QNAP completata a **Novembre 2026**), lo storico della procedura di cutover eseguita e la configurazione dei backup automatici.

---

## ✅ Stato Attuale: Proxmox Operativo in Produzione

1. **Ambiente di Produzione Attivo**: Il nuovo **server Proxmox** (`192.168.11.19`) è il server di produzione primario operativo per Web e App Android (via Tailscale `smartagenda.tailf3b58c.ts.net`):
   - LXC App Python / Docker: `192.168.11.14:8181` (`http://192.168.11.14:8181`)
   - LXC PostgreSQL: `192.168.11.15:5432`
   - LXC Tailscale Gateway: `192.168.11.16` (con inoltro porte `8181`/`8000` verso `192.168.11.14`)
2. **Ruolo NAS QNAP (`192.168.11.20`)**: Vecchio server dismesso dalla produzione e mantenuto come nodo di **replica esterna per i backup automatici** (strategia 3-2-1).

---

## 🌟 Storico Procedura di Cutover (Riferimento)

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

### 6. Switch Hostname su Console Tailscale & Port Forwarding LXC
1. Nel browser su **https://login.tailscale.com/admin/machines**:
   - Ridenominare il vecchio nodo QNAP da `smartagenda` a `smartagenda-old`.
   - Ridenominare il nuovo nodo LXC da `tailproxfg` a `smartagenda`.
2. **Configurazione Port Forwarding sul container Tailscale (`192.168.11.16`)**:
   L'APK mobile include al suo interno un micro-nodo Tailscale autonomo (`tsnet`) che invia il traffico a `smartagenda.tailf3b58c.ts.net:8181`. Poiché il nodo Tailscale Proxmox risiede su `192.168.11.16` mentre le app risiedono su `192.168.11.14`, sul container `192.168.11.16` è necessario inoltrare le porte verso `192.168.11.14`:
   ```bash
   apt-get update && apt-get install -y rinetd
   echo "0.0.0.0 8181 192.168.11.14 8181" >> /etc/rinetd.conf
   echo "0.0.0.0 8000 192.168.11.14 8000" >> /etc/rinetd.conf
   systemctl restart rinetd && systemctl enable rinetd
   ```
   *(Oppure nativamente via Tailscale: `tailscale serve --bg --tcp 8181 192.168.11.14:8181`)*

### 7. Fine Fermo & Verifica
* Aprire l'app mobile sullo smartphone: si collegherà automaticamente al nuovo server.
* Disattivare l'auto-restart dei vecchi container sul QNAP:
  ```bash
  docker update --restart=no backend vxame14_frontend
  ```

---

## 🛡️ 8. Strategia & Pianificazione Backup Automatici (Proxmox + NAS QNAP)

Per garantire la massima sicurezza dei dati (principio 3-2-1), l'infrastruttura include lo script automatizzato `auto_backup.sh`:
- **Backup Giornaliero (`daily`)**: eseguito ogni notte, genera il dump compresso (`.json.gz`) dell'intero DB in locale (`./backups/daily/`) e lo replica istantaneamente sul NAS QNAP (`/share/CACHEDEV1_DATA/Container/backups/vita/daily/`).
- **Backup Settimanale (`weekly`)**: eseguito ogni domenica notte, genera il dump in `./backups/weekly/`, lo replica sul NAS e sincronizza in modo incrementale anche la cartella immagini/allegati `uploads/`.
- **Politica di Retention (Max 2 copie)**: sia per il giornaliero che per il settimanale vengono conservati unicamente il backup corrente e quello precedente (FIFO), rimuovendo automaticamente i file più vecchi per non saturare lo spazio.
- **Creazione Difensiva delle Cartelle**: lo script crea preventivamente con `mkdir -p` sia le cartelle locali su Proxmox che quelle remote sul NAS prima di avviare il salvataggio o la sincronizzazione.

### Configurazione su `crontab` dell'LXC Proxmox (`192.168.11.14`):
```bash
crontab -e
```
Aggiungere le due righe seguenti:
```cron
# Backup Giornaliero Vita (ogni notte alle 03:00) + replica NAS (max 2 copie)
0 3 * * * /opt/docker-apps/vita/auto_backup.sh daily >> /var/log/vita_backup.log 2>&1

# Backup Settimanale Vita + uploads (ogni domenica alle 03:30) + replica NAS (max 2 copie)
30 3 * * 0 /opt/docker-apps/vita/auto_backup.sh weekly >> /var/log/vita_backup.log 2>&1
```
