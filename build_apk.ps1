$rootDir = Get-Location
$frontendDir = Join-Path $rootDir "frontend"
$androidDir = Join-Path $frontendDir "android"
$libsDir = Join-Path $androidDir "app\libs"
$tsnetDir = Join-Path $rootDir "android-tsnet"
$outputDir = Join-Path $rootDir "apk"

# Estrazione dinamica della versione da package.json
$packageJsonPath = Join-Path $frontendDir "package.json"
$appVersion = "14.0.0"
if (Test-Path $packageJsonPath) {
    try {
        $pkg = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
        if ($pkg.version) {
            $appVersion = $pkg.version
        }
    } catch {}
}

# Auto-finalizzazione dello stato changelog (se la versione era in sviluppo/bozza)
$changelogPath = Join-Path $frontendDir "src\data\changelogData.ts"
if (Test-Path $changelogPath) {
    $clContent = Get-Content $changelogPath -Raw -Encoding UTF8
    if ($clContent -match 'published:\s*false') {
        Write-Host "Marcatura versione v$appVersion come pubblicata (published: true)..." -ForegroundColor Cyan
        $clContent = $clContent -replace 'published:\s*false', 'published: true'
        Set-Content -Path $changelogPath -Value $clContent -Encoding UTF8
    }
}

# Calcolo del versionCode intero basato su major/minor (default: 14)
$versionCode = 14
if ($appVersion -match '^(\d+)') {
    $versionCode = [int]$matches[1]
}

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  COMPILAZIONE VITA APK v$appVersion" -ForegroundColor Cyan
Write-Host "  (CON TAILSCALE TSNET - versionCode: $versionCode)" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Assicurati che le cartelle esistano
if (!(Test-Path $libsDir)) {
    New-Item -ItemType Directory -Force -Path $libsDir | Out-Null
}
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

# 2. Compilazione Frontend React (Build Mobile-Only per APK Android)
Write-Host "`n[1/4] Compilazione Frontend React (Vite Mobile v$appVersion)..." -ForegroundColor Yellow
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

Write-Host "Esecuzione Gradle assembleDebug (versionName=$appVersion, versionCode=$versionCode)..." -ForegroundColor Yellow
$frontendMount = $frontendDir -replace '\\', '/'
docker rm -f apk-runner 2>$null
docker run --name apk-runner -v "${frontendMount}:/app" -w /app/android apk-builder ./gradlew assembleDebug -PversionName="$appVersion" -PversionCode="$versionCode" --no-daemon
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
    # Copia nella cartella apk/
    Copy-Item $finalApk (Join-Path $outputDir "vita-v$appVersion.apk") -Force
    Copy-Item $finalApk (Join-Path $outputDir "vita.apk") -Force

    Write-Host "`n=====================================================" -ForegroundColor Green
    Write-Host "  VITA APK COMPILATO CON SUCCESSO (v$appVersion)!" -ForegroundColor Green
    Write-Host "  File generati in $($outputDir):" -ForegroundColor Green
    Write-Host "    - $outputDir\vita-v$appVersion.apk" -ForegroundColor Green
    Write-Host "    - $outputDir\vita.apk" -ForegroundColor Green
    Write-Host "=====================================================" -ForegroundColor Green
} else {
    Write-Host "`nAPK non trovato nel percorso atteso. Controlla i log precedenti." -ForegroundColor Red
}
