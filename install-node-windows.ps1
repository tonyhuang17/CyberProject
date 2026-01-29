# install-node-windows.ps1
# Installs Node.js LTS via winget (or direct MSI on Windows Server).
# Run PowerShell as Administrator.

$ErrorActionPreference = "Stop"

# Enable TLS 1.2 for downloads (required on older PowerShell versions)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Node.js version to install (LTS)
$NodeVersion = "20.18.1"

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

function Install-NodeDirect {
  Write-Host "Installing Node.js v$NodeVersion directly via MSI..." -ForegroundColor Cyan
  
  $tempDir = Join-Path $env:TEMP "node-install"
  New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
  
  try {
    $msiUrl = "https://nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-x64.msi"
    $msiPath = Join-Path $tempDir "node.msi"
    
    Download-File $msiUrl $msiPath "Node.js v$NodeVersion MSI"
    
    Write-Host "Installing Node.js (this may take a few minutes)..."
    # Install Node.js with default options
    $installArgs = "/i `"$msiPath`" /qn /l*v `"$tempDir\node-install.log`""
    $process = Start-Process -FilePath "msiexec.exe" -ArgumentList $installArgs -Wait -PassThru
    
    if ($process.ExitCode -ne 0) {
      Write-Host "MSI install log:" -ForegroundColor Yellow
      Get-Content "$tempDir\node-install.log" -Tail 50 -ErrorAction SilentlyContinue
      throw "Node.js MSI installation failed with exit code: $($process.ExitCode)"
    }
    
    # Refresh PATH so node/npm are available
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    
    Write-Host "Node.js installed successfully!" -ForegroundColor Green
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
    Write-Host "Will install Node.js directly instead." -ForegroundColor Yellow
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
    Write-Host "Will install Node.js directly instead." -ForegroundColor Yellow
    return $false
  }
  finally {
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
  }
}

function Test-NodeVersion {
  $node = Get-Command "node" -ErrorAction SilentlyContinue
  if (-not $node) { return $false }
  
  try {
    $version = & node --version 2>$null
    if ($version -match "^v(\d+)\.") {
      $major = [int]$Matches[1]
      if ($major -ge 18) {
        Write-Host "Node.js $version is already installed and meets requirements (v18+)." -ForegroundColor Green
        return $true
      } else {
        Write-Host "Node.js $version is installed but version 18+ is required." -ForegroundColor Yellow
        return $false
      }
    }
  } catch {}
  return $false
}

# Main script
Assert-Admin

# Check if Node.js is already installed with correct version
if (Test-NodeVersion) {
  Write-Host "Node.js is ready to use." -ForegroundColor Green
  Write-Host "Test with: node --version && npm --version"
  exit 0
}

$useWinget = $false
if (Get-Command "winget" -ErrorAction SilentlyContinue) {
  Write-Host "winget is already installed."
  $useWinget = $true
} else {
  $useWinget = Install-Winget
}

if ($useWinget) {
  Write-Host "Installing Node.js LTS via winget..."
  winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements
  
  # Refresh PATH after winget install
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
} else {
  Install-NodeDirect
}

# Verify installation
Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

# Refresh PATH one more time
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

$nodeCmd = Get-Command "node" -ErrorAction SilentlyContinue
if ($nodeCmd) {
  $nodeVersion = & node --version
  $npmVersion = & npm --version
  Write-Host "Node.js $nodeVersion installed successfully!" -ForegroundColor Green
  Write-Host "npm v$npmVersion" -ForegroundColor Green
  Write-Host ""
  Write-Host "You may need to restart your terminal for the PATH changes to take effect." -ForegroundColor Yellow
} else {
  Write-Host "Node.js was installed but 'node' command not found in current session." -ForegroundColor Yellow
  Write-Host "Please restart your terminal or computer and run 'node --version' to verify." -ForegroundColor Yellow
}
