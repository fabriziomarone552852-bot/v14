#!/bin/bash
# ==========================================================================
#  Vita (VxAme14) - Script di MIGRAZIONE DATI dal QNAP al Proxmox
#  Da eseguire sul PC Windows tramite Git Bash / WSL, oppure direttamente
#  su una macchina Linux con accesso SSH ad entrambi i server.
#
#  QNAP Source:    192.168.11.20 (via SSH: admin@192.168.11.20)
#  Proxmox Target: 192.168.11.19 (via SSH: root@192.168.11.19)
#  PostgreSQL NEW: 192.168.11.15 (LXC PostGreSqlFG)
#
#  Uso: bash migrate_data_qnap_to_proxmox.sh
# ==========================================================================

set -e

QNAP_HOST="192.168.11.20"
QNAP_USER="admin"
PROXMOX_HOST="192.168.11.19"
PROXMOX_USER="root"
PG_NEW_HOST="192.168.11.15"
PG_USER="PostGre"
PG_PASSWORD="Password-Robusta"
PG_DB="family-smart"

DUMP_FILE="backup_family_smart_migration.dump"
UPLOADS_LOCAL_TEMP="/tmp/vita_uploads_migration"

echo "==========================================================="
echo " 🔄 Migrazione dati QNAP → Proxmox"
echo " Sorgente QNAP: $QNAP_HOST"
echo " Destinazione:  Proxmox $PROXMOX_HOST / PG $PG_NEW_HOST"
echo " $(date '+%Y-%m-%d %H:%M:%S')"
echo "==========================================================="

# ------------------------------------------------------------------
# FASE 1: Dump database dal QNAP
# ------------------------------------------------------------------
echo ""
echo "[FASE 1] Esecuzione dump PostgreSQL dal QNAP..."
ssh $QNAP_USER@$QNAP_HOST "docker exec -t PostGre-Server pg_dump -U PostGre -d family-smart -F c -b -v -f /tmp/$DUMP_FILE"
echo "  → Copia dump in locale..."
scp $QNAP_USER@$QNAP_HOST:/tmp/$DUMP_FILE ./$DUMP_FILE

# Verifica dimensione dump
DUMP_SIZE=$(du -sh "./$DUMP_FILE" | cut -f1)
echo "✅ Dump completato: $DUMP_FILE ($DUMP_SIZE)"

# ------------------------------------------------------------------
# FASE 2: Copia cartella uploads dal QNAP
# ------------------------------------------------------------------
echo ""
echo "[FASE 2] Copia cartella uploads dal QNAP..."
mkdir -p "$UPLOADS_LOCAL_TEMP"
rsync -avz --progress \
    $QNAP_USER@$QNAP_HOST:/share/CACHEDEV1_DATA/Container/uploads/ \
    "$UPLOADS_LOCAL_TEMP/"
echo "✅ Upload copiati localmente"

# ------------------------------------------------------------------
# FASE 3: Creazione database su nuovo LXC PostgreSQL (se non esiste)
# ------------------------------------------------------------------
echo ""
echo "[FASE 3] Verifica / creazione database '$PG_DB' su $PG_NEW_HOST..."
PGPASSWORD="$PG_PASSWORD" psql -h "$PG_NEW_HOST" -U "$PG_USER" -d postgres \
    -c "SELECT 1 FROM pg_database WHERE datname='$PG_DB';" | grep -q 1 || \
    PGPASSWORD="$PG_PASSWORD" createdb -h "$PG_NEW_HOST" -U "$PG_USER" "$PG_DB"
echo "✅ Database '$PG_DB' pronto"

# ------------------------------------------------------------------
# FASE 4: Ripristino dump nel nuovo PostgreSQL
# ------------------------------------------------------------------
echo ""
echo "[FASE 4] Ripristino dump nel nuovo PostgreSQL ($PG_NEW_HOST)..."
PGPASSWORD="$PG_PASSWORD" pg_restore \
    -h "$PG_NEW_HOST" \
    -U "$PG_USER" \
    -d "$PG_DB" \
    --no-owner \
    --role="$PG_USER" \
    -v \
    "./$DUMP_FILE" && echo "✅ Database ripristinato con successo" || \
    echo "⚠️  Ripristino completato con avvisi (normale per tabelle preesistenti)"

# ------------------------------------------------------------------
# FASE 5: Trasferimento uploads nel Proxmox
# ------------------------------------------------------------------
echo ""
echo "[FASE 5] Trasferimento uploads nel Proxmox ($PROXMOX_HOST)..."
ssh $PROXMOX_USER@$PROXMOX_HOST "mkdir -p /opt/vita/uploads"
rsync -avz --progress \
    "$UPLOADS_LOCAL_TEMP/" \
    $PROXMOX_USER@$PROXMOX_HOST:/opt/vita/uploads/
echo "✅ Uploads trasferiti in /opt/vita/uploads"

# ------------------------------------------------------------------
# Pulizia temporanea
# ------------------------------------------------------------------
echo ""
echo "[PULIZIA] File temporanei..."
rm -rf "$UPLOADS_LOCAL_TEMP"
echo "✅ Pulizia completata"

echo ""
echo "==========================================================="
echo " ✅ Migrazione dati completata!"
echo "   - Dump conservato in: ./$DUMP_FILE"
echo "   - Uploads in:         $PROXMOX_HOST:/opt/vita/uploads/"
echo "   - Database in:        $PG_NEW_HOST/$PG_DB"
echo ""
echo " PROSSIMO PASSO: Copiare i file .tar e docker-compose.proxmox.yml"
echo " nel Proxmox ed eseguire: bash deploy_proxmox.sh"
echo "==========================================================="
