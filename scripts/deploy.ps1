#Requires -Version 5.1
# Thin wrapper — prefer the root one-command macro:
#   .\deploy.ps1
& (Join-Path (Split-Path -Parent $PSScriptRoot) 'deploy.ps1') @args
