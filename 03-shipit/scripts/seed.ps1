# Seeds MongoDB for this app (Windows PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "Seeding database for 03-shipit..."

if (-not $env:MONGO_URL) {
  $env:MONGO_URL = "mongodb://localhost:27017/shipitdb"
}

node .\server\seed\run-seed.js
