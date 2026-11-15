#!/bin/bash
# ==========================================================================
#  Vita (VxAme14) - Script di Backup Automatico (Proxmox + NAS QNAP)
#  Posizione: /opt/docker-apps/vita/auto_backup.sh
#
#  Frequenze ammesse:
#    bash auto_backup.sh daily   (eseguito ogni notte via cron)
#    bash auto_backup.sh weekly  (eseguito ogni domenica via cron)
#
#  Caratteristiche:
#  - Generazione dump compresso (.json.gz) dell'intero DB da container backend
#  - Creazione difensiva delle cartelle target (locale e remota su NAS)
#  - Retention FIFO rigorosa: massimo 2 copie per frequenza (corrente + precedente)
#  - Replica automatica immediata verso il NAS QNAP
#  - Per la frequenza 'weekly': backup speculare anche della cartella uploads/
# ==========================================================================

FREQ="${1:-daily}"
if [ "$FREQ" != "daily" ] && [ "$FREQ" != "weekly" ]; then
    echo "⚠️ Frequenza '$FREQ' non valida. Usa 'daily' o 'weekly'."
    exit 1
fi

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_DIR="$DEPLOY_DIR/backups"
TARGET_LOCAL_DIR="$BACKUP_DIR/$FREQ"
UPLOADS_DIR="$DEPLOY_DIR/uploads"

NAS_USER="${NAS_USER:-admin}"
NAS_HOST="${NAS_HOST:-192.168.11.20}"
NAS_BACKUP_DIR="${NAS_BACKUP_DIR:-/share/CACHEDEV1_DATA/Container/backups/vita}"
NAS_TARGET_DIR="$NAS_BACKUP_DIR/$FREQ"
NAS_UPLOADS_DIR="${NAS_UPLOADS_DIR:-/share/CACHEDEV1_DATA/Container/uploads}"

CONTAINER_NAME="${CONTAINER_NAME:-vita_backend}"

echo "==========================================================="
echo " 🛡️ Avvio Backup Automatico Vita ($FREQ)"
echo " Data: $(date '+%Y-%m-%d %H:%M:%S')"
echo " Host: $(hostname)"
echo "==========================================================="

# ------------------------------------------------------------------
# [1/4] Creazione difensiva delle cartelle locali e remote sul NAS
# ------------------------------------------------------------------
echo ""
echo "[1/4] Verifica e creazione cartelle target..."
mkdir -p "$TARGET_LOCAL_DIR" "$BACKUP_DIR/database"
echo "  → Cartella locale pronta: $TARGET_LOCAL_DIR"

if ssh -o BatchMode=yes -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new "$NAS_USER@$NAS_HOST" "mkdir -p '$NAS_TARGET_DIR' '$NAS_BACKUP_DIR/database'" 2>/dev/null; then
    echo "  → Cartella remota sul NAS pronta: $NAS_TARGET_DIR"
else
    echo "  ⚠️ [AVVISO] NAS non raggiungibile via SSH o credenziali non configurate. Il backup locale proseguirà comunque."
fi

# ------------------------------------------------------------------
# [2/4] Generazione dump nel container backend
# ------------------------------------------------------------------
echo ""
echo "[2/4] Esecuzione backup nel container '$CONTAINER_NAME'..."

if ! docker ps --filter "name=^${CONTAINER_NAME}$" --filter "status=running" | grep -q "$CONTAINER_NAME"; then
    echo "❌ [ERRORE CRITICO] Il container '$CONTAINER_NAME' non è in esecuzione!"
    exit 1
fi

docker exec "$CONTAINER_NAME" python -c "
import sys
from backend.core.database import SessionLocal
from backend.core.backup_manager import create_full_database_backup, rotate_backups

freq = '$FREQ'
with SessionLocal() as db:
    res = create_full_database_backup(db, note=f'Automatico ({freq.capitalize()})', subdir=freq)
    print(f'✅ Backup creato con successo: {res[\"filename\"]}')
    print(f'   Dimensione: {res[\"size_kb\"]} KB | Record: {res[\"total_records\"]}')

    # Politica di retention: mantiene solo gli ultimi 2 file
    deleted = rotate_backups(subdir=freq, keep=2)
    if deleted:
        print(f'🧹 Rotazione retention (max 2 copie): rimossi vecchi file: {deleted}')
    else:
        print('📌 Nessun file obsoleto da rimuovere (entro limite di 2 copie).')
"

# ------------------------------------------------------------------
# [3/4] Sincronizzazione copia verso il NAS QNAP
# ------------------------------------------------------------------
echo ""
echo "[3/4] Sincronizzazione verso il NAS ($NAS_HOST)..."

if command -v rsync >/dev/null 2>&1; then
    if rsync -avz --delete "$TARGET_LOCAL_DIR/" "$NAS_USER@$NAS_HOST:$NAS_TARGET_DIR/" 2>/dev/null; then
        echo "✅ Sincronizzazione rsync verso $NAS_TARGET_DIR completata"
    else
        echo "⚠️  rsync fallito, tentativo fallback via scp..."
        scp "$TARGET_LOCAL_DIR/"*.json.gz "$NAS_USER@$NAS_HOST:$NAS_TARGET_DIR/" 2>/dev/null || echo "❌ Copia remota NAS non riuscita."
    fi
else
    scp "$TARGET_LOCAL_DIR/"*.json.gz "$NAS_USER@$NAS_HOST:$NAS_TARGET_DIR/" 2>/dev/null || echo "❌ Copia remota NAS non riuscita."
fi

# ------------------------------------------------------------------
# [4/4] Copia settimanale allegati/immagini (se frequenza weekly)
# ------------------------------------------------------------------
if [ "$FREQ" = "weekly" ]; then
    echo ""
    echo "[4/4] Sincronizzazione settimanale uploads multimediali verso il NAS..."
    if [ -d "$UPLOADS_DIR" ]; then
        ssh -o BatchMode=yes -o ConnectTimeout=5 "$NAS_USER@$NAS_HOST" "mkdir -p '$NAS_UPLOADS_DIR'" 2>/dev/null || true
        if rsync -avz "$UPLOADS_DIR/" "$NAS_USER@$NAS_HOST:$NAS_UPLOADS_DIR/" 2>/dev/null; then
            echo "✅ Cartella uploads sincronizzata sul NAS con successo"
        else
            echo "⚠️  Sincronizzazione uploads verso il NAS fallita o saltata"
        fi
    fi
else
    echo ""
    echo "[4/4] Backup giornaliero completato (la sincronizzazione uploads avviene nel backup settimanale)."
fi

echo ""
echo "==========================================================="
echo " 🎉 Backup ($FREQ) terminato regolarmente alle $(date '+%H:%M:%S')"
echo "==========================================================="
