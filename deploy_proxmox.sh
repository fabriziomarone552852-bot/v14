#!/bin/bash
# ==========================================================================
#  Vita (VxAme14) - Script di Deploy su Nuovo Server Proxmox
#  Posizione suggerita: /opt/vita/deploy_proxmox.sh
#
#  Uso: bash deploy_proxmox.sh
#  Requisiti: docker, docker compose plugin, immagini .tar presenti nella
#             stessa cartella dello script.
# ==========================================================================

set -e  # Interrompi lo script al primo errore

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_TAR="$DEPLOY_DIR/vxame14_backend.tar"
FRONTEND_TAR="$DEPLOY_DIR/vxame14_frontend.tar"
COMPOSE_FILE="$DEPLOY_DIR/docker-compose.proxmox.yml"
UPLOADS_DIR="$DEPLOY_DIR/uploads"
BACKUPS_DIR="$DEPLOY_DIR/backups"

echo "==========================================================="
echo " 🚀 Deployment Vita (VxAme14) su Proxmox"
echo " Host: $(hostname) ($(hostname -I | awk '{print $1}'))"
echo " Data: $(date '+%Y-%m-%d %H:%M:%S')"
echo "==========================================================="

# ------------------------------------------------------------------
# [1/5] Verifica prerequisiti
# ------------------------------------------------------------------
echo ""
echo "[1/5] Verifica prerequisiti..."
command -v docker >/dev/null 2>&1 || { echo "❌ Docker non trovato!"; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "❌ Docker Compose plugin non trovato!"; exit 1; }

if [ ! -f "$BACKEND_TAR" ]; then
    echo "❌ File non trovato: $BACKEND_TAR"
    echo "   Eseguire prima 'deploy_build_pc.ps1' o 'build_all.ps1' dal PC Windows."
    exit 1
fi
if [ ! -f "$FRONTEND_TAR" ]; then
    echo "❌ File non trovato: $FRONTEND_TAR"
    exit 1
fi

# Crea la cartella uploads e la struttura completa backups (database, daily, weekly) se non esistono
mkdir -p "$UPLOADS_DIR"
mkdir -p "$BACKUPS_DIR/database" "$BACKUPS_DIR/daily" "$BACKUPS_DIR/weekly"
chmod +x "$DEPLOY_DIR/auto_backup.sh" 2>/dev/null || true
echo "✅ Prerequisiti OK — cartelle uploads e backups pronte"

# ------------------------------------------------------------------
# [2/5] Caricamento immagini Docker
# ------------------------------------------------------------------
echo ""
echo "[2/5] Caricamento immagini Docker..."
echo "  → Backend..."
docker load -i "$BACKEND_TAR"
echo "  → Frontend..."
docker load -i "$FRONTEND_TAR"
echo "✅ Immagini caricate"

# ------------------------------------------------------------------
# [3/5] Verifica connettività PostgreSQL LXC
# ------------------------------------------------------------------
echo ""
echo "[3/5] Verifica connettività PostgreSQL (192.168.11.15:5432)..."
if docker run --rm postgres:15-alpine \
    sh -c "PGPASSWORD='Password-Robusta' psql -h 192.168.11.15 -U PostGre -d family-smart -c '\\q'" 2>/dev/null; then
    echo "✅ PostgreSQL raggiungibile e database 'family-smart' accessibile"
else
    echo "⚠️  ATTENZIONE: PostgreSQL non risponde o credenziali errate."
    echo "   Continuando comunque — verificare la connessione manualmente."
fi

# ------------------------------------------------------------------
# [4/5] Avvio con Docker Compose
# ------------------------------------------------------------------
echo ""
echo "[4/5] Avvio servizi con Docker Compose..."
cd "$DEPLOY_DIR"

# Ferma eventuali container precedenti (senza abbattere la rete)
docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true

# Avvio in background
docker compose -f "$COMPOSE_FILE" up -d

echo "✅ Container avviati"

# ------------------------------------------------------------------
# [5/5] Allineamento schema database con Alembic
# ------------------------------------------------------------------
echo ""
echo "[5/5] Allineamento schema database (Alembic upgrade head)..."
sleep 5  # Attende che il backend sia pronto

if docker exec vita_backend alembic upgrade head; then
    echo "✅ Schema database allineato"
else
    echo "❌ [ERRORE ALEMBIC] Aggiornamento schema fallito!"
    echo "   Controllare i log: docker logs vita_backend"
    exit 1
fi

# ------------------------------------------------------------------
# Riepilogo finale
# ------------------------------------------------------------------
echo ""
echo "==========================================================="
echo " ✅ Deployment completato!"
echo ""
echo " 🌐 Web App:   http://192.168.11.14:8181"
echo " 📚 API Docs:  http://192.168.11.14:8000/docs"
echo " 🔒 Tailscale: http://tailproxfg.tailf3b58c.ts.net:8181"
echo "              (sarà smartagenda.tailf3b58c.ts.net al cutover)"
echo ""
docker compose -f "$COMPOSE_FILE" ps
echo "==========================================================="
