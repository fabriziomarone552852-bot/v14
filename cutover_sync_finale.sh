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
echo "[1/4] Dump finale dal QNAP (servizio già fermo)..."
ssh $QNAP_USER@$QNAP_HOST "export PATH=\$PATH:/share/CACHEDEV1_DATA/.qpkg/container-station/bin:/usr/local/bin:/usr/bin:/bin; docker exec PostGre-Server pg_dump -U PostGre -d family-smart -F c -b" > "./$DUMP_FILE"

if [ ! -s "./$DUMP_FILE" ]; then
    echo "❌ [ERRORE CRITICO] Il file di dump non è stato creato sul QNAP o è vuoto!"
    echo "   Verificare la connettività SSH e che il container PostGre-Server sia attivo."
    rm -f "./$DUMP_FILE"
    exit 1
fi
echo "✅ Dump finale: $DUMP_FILE ($(du -sh ./$DUMP_FILE | cut -f1))"

echo ""
echo "[2/4] Drop e ripristino database nel nuovo PostgreSQL..."
# Ferma temporaneamente il backend per rilasciare le connessioni al DB
docker stop vita_backend 2>/dev/null || true
sleep 2

# Termina forzatamente le connessioni e ricrea il database da zero
PGPASSWORD="$PG_PASSWORD" psql -h "$PG_NEW_HOST" -U "$PG_USER" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$PG_DB' AND pid <> pg_backend_pid();" 2>/dev/null || true
PGPASSWORD="$PG_PASSWORD" psql -h "$PG_NEW_HOST" -U "$PG_USER" -d postgres -c \
    "DROP DATABASE IF EXISTS \"$PG_DB\" WITH (FORCE);" 2>/dev/null || \
    PGPASSWORD="$PG_PASSWORD" psql -h "$PG_NEW_HOST" -U "$PG_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$PG_DB\";"

PGPASSWORD="$PG_PASSWORD" createdb -h "$PG_NEW_HOST" -U "$PG_USER" "$PG_DB"
PGPASSWORD="$PG_PASSWORD" psql -h "$PG_NEW_HOST" -U "$PG_USER" -d postgres -c "ALTER DATABASE \"$PG_DB\" SET client_encoding TO 'UTF8';"

PGPASSWORD="$PG_PASSWORD" pg_restore \
    -h "$PG_NEW_HOST" \
    -U "$PG_USER" \
    -d "$PG_DB" \
    --clean --if-exists \
    --no-owner \
    --role="$PG_USER" \
    "./$DUMP_FILE"
echo "✅ Database ripristinato con i dati finali"

# Riavvia il backend
docker start vita_backend
sleep 3

echo ""
echo "[3/4] Sincronizzazione delta cartella uploads..."
rsync -avz $QNAP_USER@$QNAP_HOST:/share/CACHEDEV1_DATA/Container/uploads/ ./uploads/ 2>/dev/null || \
scp -r $QNAP_USER@$QNAP_HOST:/share/CACHEDEV1_DATA/Container/uploads/* ./uploads/
echo "✅ Cartella uploads allineata all'ultimo secondo"

echo ""
echo "[4/4] Allineamento schema Alembic sul nuovo backend..."
# Se presente il file corretto di migrazione broadcasts, sincronizzalo nel container
if [ -f "./i5c6d7e8f9a0_add_system_broadcasts_table.py" ]; then
    docker exec vita_backend rm -f /app/alembic/versions/g3b4c5d6e7f8_add_system_broadcasts_table.py 2>/dev/null || true
    docker cp ./i5c6d7e8f9a0_add_system_broadcasts_table.py vita_backend:/app/alembic/versions/ 2>/dev/null || true
fi
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
