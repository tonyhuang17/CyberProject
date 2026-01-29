# install-mongodb-windows.ps1
# Installs MongoDB Community Server via winget (or direct MSI on Windows Server) and starts the MongoDB service.
# Run PowerShell as Administrator.

$ErrorActionPreference = "Stop"

# Enable TLS 1.2 for downloads (required on older PowerShell versions)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Assert-Admin {
  $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()
  ).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
  if (-not $isAdmin) { throw "Run this script as Administrator." }
}

function Test-WindowsServer {
  $os = Get-CimInstance -ClassName Win32_OperatingSystem
  return $os.ProductType -ne 1  # 1 = Workstation, 2 = Domain Controller, 3 = Server
}

function Download-File($url, $outPath, $description) {
  $maxRetries = 3
  for ($i = 1; $i -le $maxRetries; $i++) {
    try {
      Write-Host "Downloading $description (attempt $i of $maxRetries)..."
      $webClient = New-Object System.Net.WebClient
      $webClient.DownloadFile($url, $outPath)
      Write-Host "  Downloaded successfully." -ForegroundColor Green
      return
    }
    catch {
      Write-Host "  Download failed: $_" -ForegroundColor Yellow
      if ($i -eq $maxRetries) {
        throw "Failed to download $description after $maxRetries attempts."
      }
      Start-Sleep -Seconds 2
    }
    finally {
      if ($webClient) { $webClient.Dispose() }
    }
  }
}

function Install-MongoDBDirect {
  Write-Host "Installing MongoDB directly via MSI..." -ForegroundColor Cyan
  
  $tempDir = Join-Path $env:TEMP "mongodb-install"
  New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
  
  try {
    # MongoDB 7.0 MSI download URL
    $mongoVersion = "7.0.14"
    $msiUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-$mongoVersion-signed.msi"
    $msiPath = Join-Path $tempDir "mongodb.msi"
    
    Download-File $msiUrl $msiPath "MongoDB $mongoVersion MSI"
    
    Write-Host "Installing MongoDB (this may take a few minutes)..."
    # Install MongoDB with default options, including service
    $installArgs = "/i `"$msiPath`" /qn /l*v `"$tempDir\mongodb-install.log`" SHOULD_INSTALL_COMPASS=0 ADDLOCAL=ServerService"
    $process = Start-Process -FilePath "msiexec.exe" -ArgumentList $installArgs -Wait -PassThru
    
    if ($process.ExitCode -ne 0) {
      Write-Host "MSI install log:" -ForegroundColor Yellow
      Get-Content "$tempDir\mongodb-install.log" -Tail 50 -ErrorAction SilentlyContinue
      throw "MongoDB MSI installation failed with exit code: $($process.ExitCode)"
    }
    
    Write-Host "MongoDB installed successfully!" -ForegroundColor Green
  }
  finally {
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
  }
}

function Install-Winget {
  Write-Host "winget not found. Attempting to install winget (App Installer)..."
  
  # Check if this is Windows Server - winget doesn't work well on Server
  if (Test-WindowsServer) {
    Write-Host "Windows Server detected. winget is not supported on Windows Server." -ForegroundColor Yellow
    Write-Host "Will install MongoDB directly instead." -ForegroundColor Yellow
    return $false
  }
  
  $tempDir = Join-Path $env:TEMP "winget-install"
  New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
  
  try {
    $vcLibsUrl = "https://aka.ms/Microsoft.VCLibs.x64.14.00.Desktop.appx"
    $uiXamlUrl = "https://github.com/microsoft/microsoft-ui-xaml/releases/download/v2.8.6/Microsoft.UI.Xaml.2.8.x64.appx"
    $wingetUrl = "https://github.com/microsoft/winget-cli/releases/latest/download/Microsoft.DesktopAppInstaller_8wekyb3d8bbwe.msixbundle"
    
    $vcLibsPath = Join-Path $tempDir "Microsoft.VCLibs.x64.14.00.Desktop.appx"
    $uiXamlPath = Join-Path $tempDir "Microsoft.UI.Xaml.2.8.x64.appx"
    $wingetPath = Join-Path $tempDir "Microsoft.DesktopAppInstaller.msixbundle"
    
    Download-File $vcLibsUrl $vcLibsPath "VCLibs dependency"
    Download-File $uiXamlUrl $uiXamlPath "UI.Xaml dependency"
    Download-File $wingetUrl $wingetPath "winget"
    
    Write-Host "Installing dependencies..."
    try { Add-AppxPackage -Path $vcLibsPath -ErrorAction Stop; Write-Host "  VCLibs installed." -ForegroundColor Green } 
    catch { Write-Host "  VCLibs: $_" -ForegroundColor Yellow }
    
    try { Add-AppxPackage -Path $uiXamlPath -ErrorAction Stop; Write-Host "  UI.Xaml installed." -ForegroundColor Green } 
    catch { Write-Host "  UI.Xaml skipped: $_" -ForegroundColor Yellow }
    
    Write-Host "Installing winget..."
    Add-AppxPackage -Path $wingetPath
    Write-Host "  winget installed." -ForegroundColor Green
    
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    Start-Sleep -Seconds 3
    
    if (-not (Get-Command "winget" -ErrorAction SilentlyContinue)) {
      $wingetExe = Get-ChildItem -Path "$env:ProgramFiles\WindowsApps" -Filter "winget.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
      if ($wingetExe) {
        $env:Path += ";" + $wingetExe.DirectoryName
      } else {
        Write-Host "winget command not found after installation." -ForegroundColor Yellow
        return $false
      }
    }
    
    Write-Host "winget installed successfully!" -ForegroundColor Green
    return $true
  }
  catch {
    Write-Host "Failed to install winget: $_" -ForegroundColor Yellow
    Write-Host "Will install MongoDB directly instead." -ForegroundColor Yellow
    return $false
  }
  finally {
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
  }
}

# Main script
Assert-Admin

$useWinget = $false
if (Get-Command "winget" -ErrorAction SilentlyContinue) {
  Write-Host "winget is already installed."
  $useWinget = $true
} else {
  $useWinget = Install-Winget
}

if ($useWinget) {
  Write-Host "Installing MongoDB Community Server via winget..."
  winget install --id MongoDB.Server -e --accept-package-agreements --accept-source-agreements
} else {
  Install-MongoDBDirect
}

Write-Host "Starting MongoDB service..."
$svc = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if (-not $svc) {
  Write-Host "MongoDB service not found. Listing possible services:"
  Get-Service | Where-Object { $_.Name -like "*mongo*" -or $_.DisplayName -like "*mongo*" } |
    Format-Table Name, DisplayName, Status -AutoSize
  throw "MongoDB service not found."
}

if ($svc.Status -ne "Running") { Start-Service -Name "MongoDB" }
Write-Host "MongoDB is running."
Write-Host "Test with: mongosh mongodb://localhost:27017"
