# Script di build ed export per NAS QNAP (Eseguire su PC Windows)
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  Avvio Build Docker per NAS QNAP (Vita VxAme14)   " -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan

# 0. Auto-finalizzazione dello stato changelog (se in sviluppo/bozza)
$changelogPath = Join-Path (Get-Location) "frontend\src\data\changelogData.ts"
if (Test-Path $changelogPath) {
    $clContent = Get-Content $changelogPath -Raw -Encoding UTF8
    if ($clContent -match 'published:\s*false') {
        Write-Host "Marcatura versione changelog come pubblicata (published: true)..." -ForegroundColor Cyan
        $clContent = $clContent -replace 'published:\s*false', 'published: true'
        Set-Content -Path $changelogPath -Value $clContent -Encoding UTF8
    }
}

# 1. Build Backend
Write-Host "`n[1/4] Build immagine Backend Python/FastAPI..." -ForegroundColor Yellow
docker build -t vxame14_backend:latest -f Dockerfile.backend .
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRORE] Errore durante il build del Backend!" -ForegroundColor Red
    exit 1
}

# 1.1 Smoke test avvio Backend nel container
Write-Host "Verifica automatica integrità e avvio Backend nel container..." -ForegroundColor Cyan
docker run --rm -e DATABASE_URL="sqlite:///:memory:" -e APP_ENV=dev vxame14_backend:latest python -c "import backend.main; print('[OK] Modulo Backend FastAPI avviato e validato!')"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRORE CRITICO] Il container Backend non riesce ad importare backend.main! Impossibile proseguire col deploy." -ForegroundColor Red
    exit 1
}

# Sincronizzazione automatica di public/version.json da package.json
$pkgPath = Join-Path (Get-Location) "frontend\package.json"
$versionJsonPath = Join-Path (Get-Location) "frontend\public\version.json"
if ((Test-Path $pkgPath) -and (Test-Path $versionJsonPath)) {
    try {
        $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
        if ($pkg.version) {
            $vJson = Get-Content $versionJsonPath -Raw | ConvertFrom-Json
            $vJson.version = $pkg.version
            if ($vJson.PSObject.Properties['apkVersion']) {
                $vJson.PSObject.Properties.Remove('apkVersion')
            }
            [System.IO.File]::WriteAllText($versionJsonPath, ($vJson | ConvertTo-Json -Depth 5), [System.Text.UTF8Encoding]::new($false))
        }
    } catch {}
}

# Verifica preventiva integrità rotte Nginx e versioning
node frontend/scripts/checkSync.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRORE] Verifica integrità o allineamento rotte Nginx fallita!" -ForegroundColor Red
    exit 1
}

# 2. Build Frontend
Write-Host "`n[2/4] Build immagine Frontend React/Nginx..." -ForegroundColor Yellow
docker build -t vxame14_frontend:latest -f frontend/Dockerfile frontend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRORE] Errore durante il build del Frontend!" -ForegroundColor Red
    exit 1
}

# 3. Export Backend tar
Write-Host "`n[3/4] Esportazione immagine Backend in vxame14_backend.tar..." -ForegroundColor Yellow
docker save -o vxame14_backend.tar vxame14_backend:latest

# 4. Export Frontend tar
Write-Host "`n[4/4] Esportazione immagine Frontend in vxame14_frontend.tar..." -ForegroundColor Yellow
docker save -o vxame14_frontend.tar vxame14_frontend:latest

Write-Host "`n===========================================================" -ForegroundColor Green
Write-Host " [OK] Build ed esportazione completati con successo!" -ForegroundColor Green
Write-Host " File generati nella cartella del progetto:" -ForegroundColor Green
Write-Host "    - vxame14_backend.tar" -ForegroundColor White
Write-Host "    - vxame14_frontend.tar" -ForegroundColor White
Write-Host " -> Ora copia i file sul NAS ed esegui: sh deploy_nas.sh" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Green
