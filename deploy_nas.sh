#!/bin/sh
# Script di deployment ed esecuzione automatica su NAS QNAP
# Posizione: /share/CACHEDEV1_DATA/Container/VxAme14/deploy_nas.sh

echo "==========================================================="
echo " 🚀 Deployment Smart Agenda (VxAme14) su NAS QNAP "
echo "==========================================================="

# 1. Creazione rete Docker condivisa se non esiste
echo "\n[1/6] Configurazione rete Docker interna (vxame14_net)..."
docker network create vxame14_net 2>/dev/null || true

# 2. Collegamento di PostgreSQL alla rete
echo "[2/6] Connessione di PostGre-Server alla rete interna..."
docker network connect vxame14_net PostGre-Server 2>/dev/null || true

# 3. Caricamento delle immagini tar se presenti
if [ -f vxame14_backend.tar ]; then
    echo "[3/6] Caricamento immagine Backend..."
    docker load -i vxame14_backend.tar
fi

if [ -f vxame14_frontend.tar ]; then
    echo "[3/6] Caricamento immagine Frontend..."
    docker load -i vxame14_frontend.tar
fi

# 4. Avvio Backend
echo "\n[4/6] Avvio container Backend..."
docker rm -f backend 2>/dev/null || true
docker run -d \
  --name backend \
  --network vxame14_net \
  --restart always \
  --privileged \
  -p 8000:8000 \
  -v /share/CACHEDEV1_DATA/Container/uploads:/app/uploads \
  -e DATABASE_URL="postgresql+psycopg://PostGre:Password-Robusta@PostGre-Server:5432/family-smart" \
  -e APP_ENV=prod \
  -e SECRET_KEY="DB_POOL_RECYCLE=1800DB_POOL_TIMEOUT=30DEFAULT_MAX_SUBTASK_DEPTH=3" \
  -e GOOGLE_CLIENT_ID="948133104741-hsv9jk7ujtsavhq315m6j0oklcabu995.apps.googleusercontent.com" \
  -e GOOGLE_CLIENT_SECRET="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" \
  -e GOOGLE_REDIRECT_URI="https://smartagenda.tailf3b58c.ts.net/api/v1/google-calendar/callback" \
  vxame14_backend:latest

# 5. Allineamento Database con Alembic
echo "\n[5/6] Allineamento automatico schema database (Alembic)..."
sleep 2
docker exec backend alembic upgrade head || true

# 6. Avvio Frontend
echo "\n[6/6] Avvio container Frontend..."
docker rm -f vxame14_frontend 2>/dev/null || true
docker run -d \
  --name vxame14_frontend \
  --network vxame14_net \
  --restart always \
  --privileged \
  -p 8181:80 \
  vxame14_frontend:latest

echo "\n==========================================================="
echo " ✅ Deployment completato!"
echo " 🌐 Web App: http://192.168.11.20:8181"
echo " 📚 API Docs: http://192.168.11.20:8000/docs"
echo "==========================================================="
docker ps | grep -E "vxame14|backend|PostGre"
