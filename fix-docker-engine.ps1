$ErrorActionPreference = 'Stop'

Write-Host 'Enabling required Windows features for Docker Desktop...' -ForegroundColor Cyan

dism /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
dism /online /enable-feature /featurename:Hyper-V /all /norestart

Write-Host 'Installing/updating WSL components...' -ForegroundColor Cyan
wsl --install --no-distribution
wsl --update
wsl --set-default-version 2

Write-Host 'Starting Docker Desktop...' -ForegroundColor Cyan
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

Write-Host 'Done. Please restart Windows, then verify Docker commands.' -ForegroundColor Green
