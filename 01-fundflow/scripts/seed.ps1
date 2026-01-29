# Seeds MongoDB for this app (Windows PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "Seeding database for 01-fundflow..."

if (-not $env:MONGO_URL) {
  $env:MONGO_URL = "mongodb://localhost:27017/fundflowdb"
}

node .\server\seed\run-seed.js
