#!/bin/bash
# ==========================================================================
#  Vita (VxAme14) - Script di SYNC FINALE del DB (fase di cutover)
#
#  Eseguito subito DOPO la sospensione del servizio sul QNAP,
#  per catturare le ultime scritture avvenute prima dello spegnimento.
#
#  Da eseguire sul Proxmox (192.168.11.19) oppure da PC in LAN.
# ==========================================================================

QNAP_HOST="192.168.11.20"
QNAP_USER="admin"
PG_NEW_HOST="192.168.11.15"
PG_USER="PostGre"
PG_PASSWORD="Password-Robusta"
PG_DB="family-smart"
DUMP_FILE="sync_finale_$(date +%Y%m%d_%H%M%S).dump"

echo "==========================================================="
echo " ⚡ SYNC FINALE DB - CUTOVER"
echo " ⏱️  Avviato: $(date '+%Y-%m-%d %H:%M:%S')"
echo " !! ESEGUIRE SOLO A SERVIZIO QNAP SOSPESO !!"
echo "==========================================================="

echo ""
echo "[1/3] Dump finale dal QNAP (servizio già fermo)..."
ssh $QNAP_USER@$QNAP_HOST "docker exec -t PostGre-Server pg_dump -U PostGre -d family-smart -F c -b -f /tmp/$DUMP_FILE"
scp $QNAP_USER@$QNAP_HOST:/tmp/$DUMP_FILE ./$DUMP_FILE
echo "✅ Dump finale: $DUMP_FILE ($(du -sh ./$DUMP_FILE | cut -f1))"

echo ""
echo "[2/4] Drop e ripristino database nel nuovo PostgreSQL..."
# Drop e ricreazione per ripristino pulito
PGPASSWORD="$PG_PASSWORD" psql -h "$PG_NEW_HOST" -U "$PG_USER" -d postgres \
    -c "DROP DATABASE IF EXISTS \"$PG_DB\";"
PGPASSWORD="$PG_PASSWORD" createdb -h "$PG_NEW_HOST" -U "$PG_USER" "$PG_DB"
PGPASSWORD="$PG_PASSWORD" psql -h "$PG_NEW_HOST" -U "$PG_USER" -d postgres -c "ALTER DATABASE \"$PG_DB\" SET client_encoding TO 'UTF8';"


PGPASSWORD="$PG_PASSWORD" pg_restore \
    -h "$PG_NEW_HOST" \
    -U "$PG_USER" \
    -d "$PG_DB" \
    --no-owner \
    --role="$PG_USER" \
    "./$DUMP_FILE"
echo "✅ Database ripristinato con i dati finali"

echo ""
echo "[3/4] Sincronizzazione delta cartella uploads..."
rsync -avz $QNAP_USER@$QNAP_HOST:/share/CACHEDEV1_DATA/Container/uploads/ ./uploads/ 2>/dev/null || \
scp -r $QNAP_USER@$QNAP_HOST:/share/CACHEDEV1_DATA/Container/uploads/* ./uploads/
echo "✅ Cartella uploads allineata all'ultimo secondo"

echo ""
echo "[4/4] Allineamento schema Alembic sul nuovo backend..."
PGPASSWORD="$PG_PASSWORD" psql -h "$PG_NEW_HOST" -U "$PG_USER" -d "$PG_DB" \
    -c "UPDATE alembic_version SET version_num='f2a3b4c5d6e7';"
docker exec vita_backend alembic upgrade head
echo "✅ Schema allineato"

echo ""
echo "==========================================================="
echo " ✅ SYNC FINALE COMPLETATO: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo " ⏭️  PROSSIMI PASSI (cutover):"
echo "   1. Aprire https://login.tailscale.com/admin/machines"
echo "   2. Rinominare 'smartagenda' (QNAP) in 'smartagenda-old'"
echo "   3. Rinominare 'tailproxfg' in 'smartagenda'"
echo "   4. Verificare: curl http://smartagenda.tailf3b58c.ts.net:8181"
echo "   5. Testare accesso app mobile su Tailscale"
echo "==========================================================="
