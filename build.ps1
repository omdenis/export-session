# Build AI Export Session into dist/ and produce an installable zip.
# Usage:  powershell -ExecutionPolicy Bypass -File build.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$src  = Join-Path $root 'src'
$out  = Join-Path $root 'dist'
$pkg  = Join-Path $out 'AI Export Session'
$zip  = Join-Path $out 'ai-export-session.zip'

if (-not (Test-Path $src)) { throw "Missing src/ folder" }

# clean previous build
if (Test-Path $out) { Remove-Item $out -Recurse -Force }
New-Item -ItemType Directory -Path $pkg | Out-Null

# copy entire source tree into the package
Copy-Item (Join-Path $src '*') -Destination $pkg -Recurse

# zip the package contents (Chrome loads the inner folder; zip is for sharing/store)
Compress-Archive -Path (Join-Path $pkg '*') -DestinationPath $zip -Force

$count = (Get-ChildItem $pkg -Recurse -File).Count
Write-Host "Built $count files -> $pkg"
Write-Host "Zip -> $zip"
