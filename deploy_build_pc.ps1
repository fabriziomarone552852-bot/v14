# Script di build ed export per NAS QNAP (Eseguire su PC Windows)
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host " 🚀 Avvio Build Docker per NAS QNAP (Smart Agenda VxAme14) " -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan

# 1. Build Backend
Write-Host "`n[1/4] Build immagine Backend Python/FastAPI..." -ForegroundColor Yellow
docker build -t vxame14_backend:latest -f Dockerfile.backend .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errore durante il build del Backend!" -ForegroundColor Red
    exit 1
}

# 2. Build Frontend
Write-Host "`n[2/4] Build immagine Frontend React/Nginx..." -ForegroundColor Yellow
docker build -t vxame14_frontend:latest -f frontend/Dockerfile frontend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errore durante il build del Frontend!" -ForegroundColor Red
    exit 1
}

# 3. Export Backend tar
Write-Host "`n[3/4] Esportazione immagine Backend in vxame14_backend.tar..." -ForegroundColor Yellow
docker save -o vxame14_backend.tar vxame14_backend:latest

# 4. Export Frontend tar
Write-Host "`n[4/4] Esportazione immagine Frontend in vxame14_frontend.tar..." -ForegroundColor Yellow
docker save -o vxame14_frontend.tar vxame14_frontend:latest

Write-Host "`n===========================================================" -ForegroundColor Green
Write-Host " ✅ Build ed esportazione completati con successo!" -ForegroundColor Green
Write-Host " 📁 File generati nella cartella del progetto:" -ForegroundColor Green
Write-Host "    - vxame14_backend.tar" -ForegroundColor White
Write-Host "    - vxame14_frontend.tar" -ForegroundColor White
Write-Host " 👉 Ora copia i file sul NAS ed esegui: sh deploy_nas.sh" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Green
