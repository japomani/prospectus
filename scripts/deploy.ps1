#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

$env:Path = "C:\Program Files\nodejs;" + $env:Path

Write-Host '==> Build frontend'
Push-Location (Join-Path $Root 'frontend')
npm ci
npm run build
Pop-Location

Write-Host '==> Build Go API (requires Go 1.22+ on PATH)'
Push-Location (Join-Path $Root 'backend')
go build -o bootstrap ./cmd/api
sam build
Write-Host 'Run: sam deploy --guided'
Pop-Location

Write-Host '==> After deploy, sync frontend:'
Write-Host 'aws s3 sync frontend/dist/ s3://YOUR_BUCKET/ --delete'
