$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent $PSScriptRoot
$root = Split-Path -Parent $workspace
$tsxPath = Join-Path $root "bplo-backend\node_modules\.bin\tsx.cmd"

if (-not (Test-Path -LiteralPath $tsxPath)) {
  throw "tsx executable not found at $tsxPath"
}

Set-Location $workspace

& $tsxPath src/tests/super-admin-regression.test.ts
exit $LASTEXITCODE
