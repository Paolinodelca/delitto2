[CmdletBinding()]
param(
    [string]$OutputDirectory = [Environment]::GetFolderPath('Desktop'),
    [string]$ArchivePrefix = 'imago-builder-handover',
    [switch]$KeepStagingFolder
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Copy-IfExists {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Destination
    )

    if (Test-Path -LiteralPath $Source) {
        Copy-Item -LiteralPath $Source -Destination $Destination -Recurse -Force
    }
}

try {
    # Lo script deve essere salvato nella cartella repository-level "scripts".
    $scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
    $repositoryRoot = Split-Path -Parent $scriptDirectory

    $builderSource = Join-Path $repositoryRoot 'tools\imago-builder'
    $scriptsSource = Join-Path $repositoryRoot 'scripts'
    $binSource = Join-Path $repositoryRoot 'bin'

    if (-not (Test-Path -LiteralPath $builderSource)) {
        throw "Cartella Builder non trovata: $builderSource"
    }

    if (-not (Test-Path -LiteralPath $scriptsSource)) {
        throw "Cartella scripts non trovata: $scriptsSource"
    }

    if (-not (Test-Path -LiteralPath $OutputDirectory)) {
        New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
    }

    $timestamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
    $handoverName = "$ArchivePrefix-$timestamp"
    $stagingRoot = Join-Path $OutputDirectory $handoverName
    $zipPath = "$stagingRoot.zip"

    Write-Step "Repository rilevato"
    Write-Host $repositoryRoot

    Write-Step "Preparazione cartella temporanea"
    if (Test-Path -LiteralPath $stagingRoot) {
        Remove-Item -LiteralPath $stagingRoot -Recurse -Force
    }
    if (Test-Path -LiteralPath $zipPath) {
        Remove-Item -LiteralPath $zipPath -Force
    }

    New-Item -ItemType Directory -Path (Join-Path $stagingRoot 'tools') -Force | Out-Null

    Write-Step "Copia tools/imago-builder"
    Copy-Item -LiteralPath $builderSource -Destination (Join-Path $stagingRoot 'tools') -Recurse -Force

    Write-Step "Copia scripts"
    Copy-Item -LiteralPath $scriptsSource -Destination $stagingRoot -Recurse -Force

    Write-Step "Copia bin e metadati del repository"
    Copy-IfExists -Source $binSource -Destination $stagingRoot

    foreach ($fileName in @(
        'package.json',
        'package-lock.json',
        'npm-shrinkwrap.json',
        '.nvmrc',
        '.node-version'
    )) {
        Copy-IfExists -Source (Join-Path $repositoryRoot $fileName) -Destination $stagingRoot
    }

    # Evita di inserire vecchi archivi dentro il nuovo handover.
    Write-Step "Rimozione ZIP annidati"
    Get-ChildItem -LiteralPath $stagingRoot -Recurse -File -Filter '*.zip' |
        Remove-Item -Force

    # Rimuove cartelle normalmente inutili per l'handover, se presenti nelle copie.
    Get-ChildItem -LiteralPath $stagingRoot -Recurse -Directory |
        Where-Object { $_.Name -in @('node_modules', '.git', 'tmp') } |
        Sort-Object FullName -Descending |
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

    Write-Step "Creazione archivio ZIP"
    Compress-Archive -LiteralPath $stagingRoot -DestinationPath $zipPath -CompressionLevel Optimal -Force

    if (-not (Test-Path -LiteralPath $zipPath)) {
        throw 'Creazione dello ZIP non riuscita.'
    }

    $zipInfo = Get-Item -LiteralPath $zipPath
    $sizeMb = [Math]::Round($zipInfo.Length / 1MB, 2)

    if (-not $KeepStagingFolder) {
        Write-Step "Pulizia cartella temporanea"
        Remove-Item -LiteralPath $stagingRoot -Recurse -Force
    }

    Write-Host "`nHandover Builder creato correttamente." -ForegroundColor Green
    Write-Host "ZIP: $zipPath"
    Write-Host "Dimensione: $sizeMb MB"

    if ($KeepStagingFolder) {
        Write-Host "Cartella mantenuta: $stagingRoot"
    }
}
catch {
    Write-Host "`nERRORE: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
