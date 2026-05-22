# Start Mini Docto+ backend (port 5000, Java 17)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$jdk17 = "$env:LOCALAPPDATA\Programs\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
if (-not (Test-Path $jdk17)) {
    Write-Error "JDK 17 not found at $jdk17. Install Eclipse Temurin 17 or set JAVA_HOME."
}
$env:JAVA_HOME = $jdk17
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

Write-Host "Using Java:" -NoNewline
& java -version 2>&1 | Select-Object -First 1

$conn = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($conn) {
    Write-Host "Stopping PID $($conn.OwningProcess) on port 5000..."
    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host "Starting Spring Boot on http://localhost:5000 ..."
Write-Host "(MongoDB must run on mongodb://localhost:27017)"
& .\mvnw.cmd spring-boot:run
