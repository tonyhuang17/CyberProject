# Seeds MongoDB for this app (Windows PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "Seeding database for 05-keykeeper..."

if (-not $env:MONGO_URL) {
  $env:MONGO_URL = "mongodb://localhost:27017/keykeeperdb"
}

node .\server\seed\run-seed.js
