param(
    [Parameter(Mandatory = $true)]
    [string]$ApkPath,

    [string]$RootDir = (Split-Path -Parent $PSScriptRoot),

    [switch]$DryRun
)

# Impedisce a PowerShell 5.1 di interrompere lo script sui flussi stderr dei comandi esterni
$ErrorActionPreference = "Continue"

$uploadScript = Join-Path $PSScriptRoot "upload_to_drive.py"
$driveReqs = Join-Path $PSScriptRoot "requirements-drive.txt"

if (!(Test-Path $ApkPath)) {
    Write-Host "[ERRORE] File APK non trovato per l'upload su Drive: $ApkPath" -ForegroundColor Red
    exit 1
}

if (!(Test-Path $uploadScript)) {
    Write-Host "[ERRORE] Script di upload non trovato: $uploadScript" -ForegroundColor Red
    exit 1
}

function Invoke-SilentPythonCheck {
    param(
        [string]$ExePath,
        [string[]]$PrefixArgs = @(),
        [string]$Code
    )
    try {
        $output = & $ExePath @PrefixArgs -c $Code 2>$null
        return @{
            Success = ($LASTEXITCODE -eq 0)
            Output  = ($output | Out-String).Trim()
        }
    } catch {
        return @{
            Success = $false
            Output  = ""
        }
    }
}

function Resolve-DrivePython {
    param([string]$ProjectRoot)

    $candidates = New-Object System.Collections.Generic.List[hashtable]

    $venvPython = Join-Path $ProjectRoot ".venv\Scripts\python.exe"
    if (Test-Path $venvPython) {
        $candidates.Add(@{ Exe = $venvPython; Args = @(); Label = ".venv" })
    }

    $pathPythonCmd = Get-Command python -ErrorAction SilentlyContinue
    if ($pathPythonCmd -and $pathPythonCmd.Source -and ($pathPythonCmd.Source -notlike "*\WindowsApps\*")) {
        $candidates.Add(@{ Exe = $pathPythonCmd.Source; Args = @(); Label = "PATH python" })
    }

    $pyCmd = Get-Command py -ErrorAction SilentlyContinue
    if ($pyCmd) {
        $pyResolved = Invoke-SilentPythonCheck -ExePath $pyCmd.Source -PrefixArgs @("-3") -Code "import sys; print(sys.executable)"
        if ($pyResolved.Success -and $pyResolved.Output) {
            $candidates.Add(@{ Exe = $pyResolved.Output; Args = @(); Label = "py -3" })
        }
    }

    $localPythonRoot = Join-Path $env:LOCALAPPDATA "Programs\Python"
    if (Test-Path $localPythonRoot) {
        $localPythons = Get-ChildItem -Path $localPythonRoot -Directory -Filter "Python*" -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending
        foreach ($dir in $localPythons) {
            $exe = Join-Path $dir.FullName "python.exe"
            if (Test-Path $exe) {
                $candidates.Add(@{ Exe = $exe; Args = @(); Label = $dir.Name })
            }
        }
    }

    # Deduplica per percorso eseguibile
    $uniqueCandidates = New-Object System.Collections.Generic.List[hashtable]
    $seen = @{}
    foreach ($c in $candidates) {
        $key = $c.Exe.ToLowerInvariant()
        if (-not $seen.ContainsKey($key)) {
            $seen[$key] = $true
            $uniqueCandidates.Add($c)
        }
    }

    # 1) Preferisci un Python che ha gia' le librerie Google Drive installate
    foreach ($c in $uniqueCandidates) {
        $check = Invoke-SilentPythonCheck -ExePath $c.Exe -PrefixArgs $c.Args -Code "import googleapiclient, google.auth, google_auth_oauthlib"
        if ($check.Success) {
            return $c
        }
    }

    # 2) Altrimenti installa automaticamente i pacchetti Drive su .venv (con uv) o sul primo Python disponibile
    if (Test-Path $driveReqs) {
        $uvCmd = Get-Command uv -ErrorAction SilentlyContinue
        if ((Test-Path $venvPython) -and $uvCmd) {
            Write-Host "[SETUP] Installazione librerie Google Drive in .venv tramite uv..." -ForegroundColor Cyan
            & $uvCmd.Source pip install --python $venvPython -r $driveReqs
            if ($LASTEXITCODE -eq 0) {
                $recheck = Invoke-SilentPythonCheck -ExePath $venvPython -Code "import googleapiclient, google.auth, google_auth_oauthlib"
                if ($recheck.Success) {
                    return @{ Exe = $venvPython; Args = @(); Label = ".venv" }
                }
            }
        }

        foreach ($c in $uniqueCandidates) {
            $pipCheck = Invoke-SilentPythonCheck -ExePath $c.Exe -PrefixArgs $c.Args -Code "import pip"
            if ($pipCheck.Success) {
                Write-Host "[SETUP] Installazione librerie Google Drive in $($c.Label)..." -ForegroundColor Cyan
                & $c.Exe @($c.Args) -m pip install -r $driveReqs
                if ($LASTEXITCODE -eq 0) {
                    $recheck = Invoke-SilentPythonCheck -ExePath $c.Exe -PrefixArgs $c.Args -Code "import googleapiclient, google.auth, google_auth_oauthlib"
                    if ($recheck.Success) {
                        return $c
                    }
                }
            }
        }
    }

    return $null
}

$selectedPython = Resolve-DrivePython -ProjectRoot $RootDir
if ($null -eq $selectedPython) {
    Write-Host "[ERRORE] Nessun interprete Python con i moduli Google Drive disponibile." -ForegroundColor Red
    Write-Host "         Installa manualmente con: pip install -r scripts/requirements-drive.txt" -ForegroundColor Yellow
    exit 2
}

Write-Host "Interprete Python per Drive: $($selectedPython.Exe)" -ForegroundColor DarkGray

$scriptArgs = @($uploadScript, "--file", $ApkPath)
if ($DryRun) {
    $scriptArgs += "--dry-run"
}

& $selectedPython.Exe @($selectedPython.Args) @scriptArgs
$uploadExitCode = $LASTEXITCODE
exit $uploadExitCode
