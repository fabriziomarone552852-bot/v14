# Script di build completo (NAS Docker + APK Android) per Vita (Eseguire su PC Windows)
$ErrorActionPreference = "Stop"

$rootDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
Set-Location $rootDir
$frontendDir = Join-Path $rootDir "frontend"
$androidDir = Join-Path $frontendDir "android"
$libsDir = Join-Path $androidDir "app\libs"
$tsnetDir = Join-Path $rootDir "android-tsnet"
$outputDir = Join-Path $rootDir "apk"

function Remove-DockerContainerSafe {
    param([string]$ContainerName)
    $prevPref = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $existingId = docker ps -aq --filter "name=^/${ContainerName}$" 2>$null
        if ($existingId) {
            docker rm -f $ContainerName 2>$null | Out-Null
        }
    } finally {
        $ErrorActionPreference = $prevPref
    }
}

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  BUILD TOTALE VITA: DOCKER NAS + APK ANDROID              " -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan

# 0. Estrazione dinamica della versione da package.json
$packageJsonPath = Join-Path $frontendDir "package.json"
$appVersion = "15.0.0"
if (Test-Path $packageJsonPath) {
    try {
        $pkg = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
        if ($pkg.version) {
            $appVersion = $pkg.version
        }
    } catch {}
}

# Auto-finalizzazione dello stato changelog (se in sviluppo/bozza)
$major = 15
if ($appVersion -match '^(\d+)') { $major = $matches[1] }
$targetChangelog = Join-Path $frontendDir "src\data\changelogs\v$major.ts"
if (!(Test-Path $targetChangelog)) {
    $targetChangelog = Join-Path $frontendDir "src\data\changelogData.ts"
}
if (Test-Path $targetChangelog) {
    $clContent = Get-Content $targetChangelog -Raw -Encoding UTF8
    if ($clContent -match 'published:\s*false') {
        Write-Host "Marcatura versione v$appVersion come pubblicata in $(Split-Path $targetChangelog -Leaf) (published: true)..." -ForegroundColor Cyan
        $clContent = $clContent -replace 'published:\s*false', 'published: true'
        [System.IO.File]::WriteAllText($targetChangelog, $clContent, [System.Text.UTF8Encoding]::new($false))
    }
}

# Sincronizzazione automatica di public/version.json
$versionJsonPath = Join-Path $frontendDir "public\version.json"
if (Test-Path $versionJsonPath) {
    try {
        $vJson = Get-Content $versionJsonPath -Raw | ConvertFrom-Json
        $vJson.version = $appVersion
        if ($vJson.PSObject.Properties['apkVersion']) {
            $vJson.PSObject.Properties.Remove('apkVersion')
        }
        [System.IO.File]::WriteAllText($versionJsonPath, ($vJson | ConvertTo-Json -Depth 5), [System.Text.UTF8Encoding]::new($false))
        Write-Host "Allineato version.json alla versione v$appVersion" -ForegroundColor Green
    } catch {}
}

# Calcolo del versionCode intero basato su major/minor (default: 15)
$versionCode = 15
if ($appVersion -match '^(\d+)') {
    $versionCode = [int]$matches[1]
}

# Assicurati che le cartelle esistano
if (!(Test-Path $libsDir)) { New-Item -ItemType Directory -Force -Path $libsDir | Out-Null }
if (!(Test-Path $outputDir)) { New-Item -ItemType Directory -Force -Path $outputDir | Out-Null }

# =====================================================================
# PARTE 1: BUILD DOCKER PER NAS QNAP
# =====================================================================
Write-Host "`n-----------------------------------------------------------" -ForegroundColor Yellow
Write-Host " [1/6] Build immagine Backend Python/FastAPI..." -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------" -ForegroundColor Yellow
docker build -t vxame14_backend:latest -f Dockerfile.backend .
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRORE] Errore durante il build del Backend!" -ForegroundColor Red
    exit 1
}

# Smoke test avvio Backend nel container
Write-Host "Verifica automatica integrità e avvio Backend nel container..." -ForegroundColor Cyan
docker run --rm -e DATABASE_URL="sqlite:///:memory:" -e APP_ENV=dev vxame14_backend:latest python -c "import backend.main; print('[OK] Modulo Backend FastAPI avviato e validato!')"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRORE CRITICO] Il container Backend non riesce ad importare backend.main! Impossibile proseguire." -ForegroundColor Red
    exit 1
}

Write-Host "`n-----------------------------------------------------------" -ForegroundColor Yellow
Write-Host " [2/6] Build immagine Frontend React/Nginx..." -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------" -ForegroundColor Yellow
docker build -t vxame14_frontend:latest -f frontend/Dockerfile frontend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRORE] Errore durante il build del Frontend!" -ForegroundColor Red
    exit 1
}

Write-Host "`n-----------------------------------------------------------" -ForegroundColor Yellow
Write-Host " [3/6] Esportazione archivi tar per NAS QNAP..." -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------" -ForegroundColor Yellow
Write-Host "Esportazione vxame14_backend.tar..." -ForegroundColor Cyan
docker save -o vxame14_backend.tar vxame14_backend:latest
Write-Host "Esportazione vxame14_frontend.tar..." -ForegroundColor Cyan
docker save -o vxame14_frontend.tar vxame14_frontend:latest

# =====================================================================
# PARTE 2: BUILD APK ANDROID CON TAILSCALE TSNET
# =====================================================================
Write-Host "`n-----------------------------------------------------------" -ForegroundColor Yellow
Write-Host " [4/6] Compilazione Frontend Mobile React (Vite Mobile v$appVersion)..." -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------" -ForegroundColor Yellow
Set-Location $frontendDir
npm run build:mobile
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRORE] Errore durante la compilazione del frontend mobile!" -ForegroundColor Red
    Set-Location $rootDir
    exit 1
}

Write-Host "Sincronizzazione asset con Capacitor Android..." -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRORE] Errore durante la sincronizzazione di Capacitor!" -ForegroundColor Red
    Set-Location $rootDir
    exit 1
}

Write-Host "`n-----------------------------------------------------------" -ForegroundColor Yellow
Write-Host " [5/6] Compilazione Modulo Go tsnet (tsnetproxy.aar)..." -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------" -ForegroundColor Yellow
Set-Location $tsnetDir
docker build -t tsnet-builder -f Dockerfile.gomobile .
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRORE] Errore durante il build di tsnet-builder!" -ForegroundColor Red
    Set-Location $rootDir
    exit 1
}

Remove-DockerContainerSafe "tsnet-worker-temp"
docker run --name tsnet-worker-temp tsnet-builder
docker cp tsnet-worker-temp:/output/tsnetproxy.aar "$libsDir/tsnetproxy.aar"
docker cp tsnet-worker-temp:/output/tsnetproxy-sources.jar "$libsDir/tsnetproxy-sources.jar"
Remove-DockerContainerSafe "tsnet-worker-temp"

Write-Host "`n-----------------------------------------------------------" -ForegroundColor Yellow
Write-Host " [6/6] Compilazione APK Android con Gradle..." -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------" -ForegroundColor Yellow
Set-Location $frontendDir
docker build -t apk-builder -f Dockerfile.apk-builder .
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRORE] Errore durante il build di apk-builder!" -ForegroundColor Red
    Set-Location $rootDir
    exit 1
}

$oldApk = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $oldApk) {
    Remove-Item $oldApk -Force -ErrorAction SilentlyContinue
}

Write-Host "Esecuzione Gradle assembleDebug (versionName=$appVersion, versionCode=$versionCode)..." -ForegroundColor Cyan
$frontendMount = $frontendDir -replace '\\', '/'
Remove-DockerContainerSafe "apk-runner"
docker run --name apk-runner -v "${frontendMount}:/app" -w /app/android apk-builder ./gradlew assembleDebug -PversionName="$appVersion" -PversionCode="$versionCode" --no-daemon
$gradleExitCode = $LASTEXITCODE
Remove-DockerContainerSafe "apk-runner"

if ($gradleExitCode -ne 0) {
    Write-Host "`n[ERRORE] Errore durante la compilazione Gradle (Exit Code: $gradleExitCode)!" -ForegroundColor Red
    Set-Location $rootDir
    exit 1
}

Set-Location $rootDir
$finalApk = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"
if (!(Test-Path $finalApk)) {
    Write-Host "`n[ERRORE] APK non trovato nel percorso atteso: $finalApk" -ForegroundColor Red
    exit 1
}

$versionedApk = Join-Path $outputDir "vita-v$appVersion.apk"
Copy-Item $finalApk $versionedApk -Force
Copy-Item $finalApk (Join-Path $outputDir "vita.apk") -Force

# =====================================================================
# UPLOAD SU GOOGLE DRIVE
# =====================================================================
$syncDriveScript = Join-Path $rootDir "scripts\sync_apk_to_drive.ps1"
$driveExitCode = 1
if (Test-Path $syncDriveScript) {
    Write-Host "`n-----------------------------------------------------------" -ForegroundColor Yellow
    Write-Host " Sincronizzazione automatica con Google Drive..." -ForegroundColor Yellow
    Write-Host "-----------------------------------------------------------" -ForegroundColor Yellow
    $prevPref = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        & $syncDriveScript -ApkPath $versionedApk -RootDir $rootDir
        $driveExitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $prevPref
    }
} else {
    Write-Host "[ERRORE] Script sync_apk_to_drive.ps1 non trovato!" -ForegroundColor Red
}

# =====================================================================
# RIEPILOGO FINALE
# =====================================================================
Write-Host "`n===========================================================" -ForegroundColor Green
Write-Host "  BUILD TOTALE COMPLETATO (v$appVersion)" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Green
Write-Host " File generati per il NAS QNAP:" -ForegroundColor Cyan
Write-Host "   - vxame14_backend.tar" -ForegroundColor White
Write-Host "   - vxame14_frontend.tar" -ForegroundColor White
Write-Host "   -> Copiali sul NAS ed esegui: sh deploy_nas.sh`n" -ForegroundColor DarkGray

Write-Host " APK locale generato:" -ForegroundColor Cyan
Write-Host "   - $versionedApk" -ForegroundColor White

if ($driveExitCode -eq 0) {
    Write-Host " File caricato su Google Drive (App Mobile):" -ForegroundColor Cyan
    Write-Host "   - vita-v$appVersion.apk" -ForegroundColor White
    Write-Host "   -> APK sincronizzato! Le versioni precedenti sono archiviate in 'old versions/'" -ForegroundColor Green
    Write-Host "===========================================================`n" -ForegroundColor Green
} elseif ($driveExitCode -eq 3) {
    Write-Host " Google Drive:" -ForegroundColor Yellow
    Write-Host "   -> Upload saltato: 'credentials.json' non configurato su questo PC (vedi docs/GOOGLE_DRIVE_SETUP.md)." -ForegroundColor Yellow
    Write-Host "===========================================================`n" -ForegroundColor Yellow
} else {
    Write-Host " Google Drive:" -ForegroundColor Red
    Write-Host "   -> [ERRORE] Upload su Google Drive FALLITO (Exit Code: $driveExitCode)!" -ForegroundColor Red
    Write-Host "   -> Controlla i messaggi sopra e rilancia: .\scripts\sync_apk_to_drive.ps1 -ApkPath `"$versionedApk`"" -ForegroundColor Red
    Write-Host "===========================================================`n" -ForegroundColor Red
    exit 1
}
