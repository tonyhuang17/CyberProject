# Install all dependencies for the project
Write-Host "Installing dependencies for 01-fundflow..." -ForegroundColor Cyan

Write-Host "`nInstalling root dependencies..." -ForegroundColor Yellow
npm install

Write-Host "`nInstalling server dependencies..." -ForegroundColor Yellow
Push-Location server
npm install
Pop-Location

Write-Host "`nInstalling client dependencies..." -ForegroundColor Yellow
Push-Location client
npm install
Pop-Location

Write-Host "`nAll dependencies installed!" -ForegroundColor Green
