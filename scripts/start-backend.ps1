# Start Mini Docto+ Spring Boot backend (port 5000)
$ErrorActionPreference = "Stop"
$backend = Join-Path $PSScriptRoot "..\backend"
Set-Location $backend

if (-not $env:JAVA_HOME) {
    $jdk = "$env:LOCALAPPDATA\Programs\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
    if (Test-Path $jdk) { $env:JAVA_HOME = $jdk }
}

# Stop stale Java process blocking port 5000
$conn = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($conn) {
    Write-Host "Stopping process $($conn.OwningProcess) on port 5000..."
    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host "Starting backend on http://localhost:5000 ..."
Write-Host "MongoDB must be running on mongodb://localhost:27017"
& .\mvnw.cmd spring-boot:run
