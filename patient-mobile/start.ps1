# Run Mini Docto+ patient app (Flutter)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "API URL (auto): Android emulator -> http://10.0.2.2:5000/api"
Write-Host "              Windows/Web/iOS sim -> http://localhost:5000/api"
Write-Host ""
Write-Host "Backend must be running: ..\backend\start.ps1"
Write-Host ""

$backendUp = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
if (-not $backendUp) {
    Write-Warning "Port 5000 is not listening — start the backend first."
}

flutter pub get
flutter devices
Write-Host ""
Write-Host "Starting app (Windows desktop)..."
flutter run -d windows
