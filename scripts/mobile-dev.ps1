$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot

& (Join-Path $PSScriptRoot 'setup-mobile-oauth.ps1')

Push-Location (Join-Path $root 'mobile')
try {
  flutter run
}
finally {
  Pop-Location
}
