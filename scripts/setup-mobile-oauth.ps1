$ErrorActionPreference = 'Stop'

function Find-Adb {
  $adb = Get-Command adb -ErrorAction SilentlyContinue
  if ($adb) {
    return $adb.Source
  }

  $defaultAdb = Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe'
  if (Test-Path $defaultAdb) {
    return $defaultAdb
  }

  throw 'adb.exe was not found. Install Android platform-tools or add adb to PATH.'
}

$adbPath = Find-Adb

& $adbPath start-server | Out-Null
$devices = & $adbPath devices
$hasDevice = $devices | Select-String -Pattern "`tdevice$"
if (-not $hasDevice) {
  throw 'No Android emulator/device is connected. Start the emulator first.'
}

& $adbPath reverse tcp:3000 tcp:3000 | Out-Null
& $adbPath reverse tcp:3001 tcp:3001 | Out-Null

Write-Host 'Android OAuth port forwarding is ready:'
& $adbPath reverse --list
