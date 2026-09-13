# build_apk.ps1 - Script per la compilazione automatica dell'APK Android con Tailscale integrato

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  COMPILAZIONE SMART AGENDA APK (CON TAILSCALE TSNET)" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

$rootDir = Get-Location
$frontendDir = Join-Path $rootDir "frontend"
$androidDir = Join-Path $frontendDir "android"
$libsDir = Join-Path $androidDir "app\libs"
$tsnetDir = Join-Path $rootDir "android-tsnet"
$outputDir = Join-Path $rootDir "output-apk"

# 1. Assicurati che le cartelle esistano
if (!(Test-Path $libsDir)) {
    New-Item -ItemType Directory -Force -Path $libsDir | Out-Null
}
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

# 2. Compilazione Frontend React (Build Mobile-Only per APK Android)
Write-Host "`n[1/4] Compilazione Frontend React (Vite Mobile)..." -ForegroundColor Yellow
Set-Location $frontendDir
npm run build:mobile
if ($LASTEXITCODE -ne 0) {
    Write-Host "Errore durante la compilazione del frontend!" -ForegroundColor Red
    Set-Location $rootDir
    exit 1
}

# 3. Sincronizzazione Capacitor
Write-Host "`n[2/4] Sincronizzazione asset con Capacitor Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Errore durante la sincronizzazione di Capacitor!" -ForegroundColor Red
    Set-Location $rootDir
    exit 1
}

# 4. Compilazione libreria Go tsnetproxy.aar
Write-Host "`n[3/4] Compilazione Modulo Go tsnet (tsnetproxy.aar)..." -ForegroundColor Yellow
Set-Location $tsnetDir
docker build -t tsnet-builder -f Dockerfile.gomobile .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Errore durante il build dell'immagine tsnet-builder!" -ForegroundColor Red
    Set-Location $rootDir
    exit 1
}

Write-Host "Estrazione di tsnetproxy.aar..." -ForegroundColor Yellow
docker rm -f tsnet-worker-temp 2>$null
docker run --name tsnet-worker-temp tsnet-builder
docker cp tsnet-worker-temp:/output/tsnetproxy.aar "$libsDir/tsnetproxy.aar"
docker cp tsnet-worker-temp:/output/tsnetproxy-sources.jar "$libsDir/tsnetproxy-sources.jar"
docker rm -f tsnet-worker-temp 2>$null

# 5. Compilazione APK con Gradle
Write-Host "`n[4/4] Compilazione APK Android..." -ForegroundColor Yellow
Set-Location $frontendDir
docker build -t apk-builder -f Dockerfile.apk-builder .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Errore durante il build dell'immagine apk-builder!" -ForegroundColor Red
    Set-Location $rootDir
    exit 1
}

$oldApk = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $oldApk) {
    Remove-Item $oldApk -Force -ErrorAction SilentlyContinue
}

Write-Host "Esecuzione Gradle assembleDebug..." -ForegroundColor Yellow
$frontendMount = $frontendDir -replace '\\', '/'
docker rm -f apk-runner 2>$null
docker run --name apk-runner -v "${frontendMount}:/app" -w /app/android apk-builder ./gradlew assembleDebug --no-daemon
$gradleExitCode = $LASTEXITCODE
docker rm -f apk-runner 2>$null

if ($gradleExitCode -ne 0) {
    Write-Host "`nErrore durante la compilazione Gradle (Exit Code: $gradleExitCode)!" -ForegroundColor Red
    Set-Location $rootDir
    exit 1
}

Set-Location $rootDir
$finalApk = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"

if (Test-Path $finalApk) {
    Copy-Item $finalApk (Join-Path $outputDir "smartagenda.apk") -Force
    Copy-Item $finalApk (Join-Path $rootDir "smartagenda.apk") -Force
    Write-Host "`n=====================================================" -ForegroundColor Green
    Write-Host "  APK COMPILATO CON SUCCESSO!" -ForegroundColor Green
    Write-Host "  File pronto: $rootDir\smartagenda.apk" -ForegroundColor Green
    Write-Host "=====================================================" -ForegroundColor Green
} else {
    Write-Host "`nAPK non trovato nel percorso atteso. Controlla i log precedenti." -ForegroundColor Red
}
