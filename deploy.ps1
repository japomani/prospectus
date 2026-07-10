#Requires -Version 5.1
<#
.SYNOPSIS
  One-command deploy for Delphinium Prospectus (frontend and/or backend).

.DESCRIPTION
  Detects what changed, deploys only that, then commits and pushes to GitHub.

.EXAMPLE
  .\deploy.ps1

.EXAMPLE
  cd C:\Users\10618071\Projects\prospectus; .\deploy.ps1

.EXAMPLE
  .\deploy.ps1 -ForceAll
  .\deploy.ps1 -FrontendOnly
  .\deploy.ps1 -BackendOnly
  .\deploy.ps1 -SkipGit
#>
[CmdletBinding()]
param(
  [switch]$ForceAll,
  [switch]$FrontendOnly,
  [switch]$BackendOnly,
  [switch]$SkipGit
)

$ErrorActionPreference = 'Stop'
$Root = $PSScriptRoot
Set-Location $Root

# --- Defaults (override with env vars) ---
$StackName        = if ($env:PROSPECTUS_STACK_NAME)   { $env:PROSPECTUS_STACK_NAME }   else { 'delphinium-prospectus' }
$AwsRegion        = if ($env:PROSPECTUS_AWS_REGION)   { $env:PROSPECTUS_AWS_REGION }   else { 'us-east-1' }
$FrontendBucket   = if ($env:PROSPECTUS_S3_BUCKET)    { $env:PROSPECTUS_S3_BUCKET }    else { 'delphinium-prospectus-frontendbucket-wmyrnj6h9qay' }
$CloudFrontId     = if ($env:PROSPECTUS_CF_DIST_ID)   { $env:PROSPECTUS_CF_DIST_ID }   else { 'E2UVEOPVDSKJ0I' }
$ApiUrl           = if ($env:VITE_API_URL)            { $env:VITE_API_URL }            else { 'https://g6yxi9yar3.execute-api.us-east-1.amazonaws.com' }
$CloudFrontUrl    = if ($env:PROSPECTUS_WEB_URL)      { $env:PROSPECTUS_WEB_URL }      else { 'https://dgnilygbxuhxd.cloudfront.net' }
$StampFile        = Join-Path $Root '.last-deploy'

# --- Helpers ---
function Write-Step([string]$Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Ok([string]$Message) {
  Write-Host "    $Message" -ForegroundColor Green
}

function Write-Warn([string]$Message) {
  Write-Host "    $Message" -ForegroundColor Yellow
}

function Write-Fail([string]$Message) {
  Write-Host "ERROR: $Message" -ForegroundColor Red
}

function Refresh-ToolPath {
  $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $user    = [Environment]::GetEnvironmentVariable('Path', 'User')
  if ($machine -or $user) {
    $env:Path = @($machine, $user) -join ';'
  }

  $extras = @(
    "${env:ProgramFiles}\Amazon\AWSSAMCLI\bin",
    "${env:ProgramFiles}\Amazon\AWSCLIV2",
    "${env:ProgramFiles}\Go\bin",
    "${env:ProgramFiles}\nodejs",
    "${env:LOCALAPPDATA}\Programs\nodejs",
    "${env:USERPROFILE}\go\bin",
    "${env:USERPROFILE}\.local\bin",
    "${env:USERPROFILE}\AppData\Roaming\npm",
    "${env:ProgramFiles(x86)}\Go\bin"
  )
  foreach ($p in $extras) {
    if ($p -and (Test-Path -LiteralPath $p) -and ($env:Path -notlike "*$p*")) {
      $env:Path = "$p;$env:Path"
    }
  }
}

function Test-Command([string]$Name) {
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

# Git often writes warnings (LF/CRLF, etc.) to stderr. With $ErrorActionPreference=Stop,
# Windows PowerShell / PS7 treat that as a terminating NativeCommandError. Run git with
# Continue so stderr is captured, then check $LASTEXITCODE for real failures.
function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments,
    [switch]$AllowFail
  )
  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $raw = & git @Arguments 2>&1
    $code = $LASTEXITCODE
    $text = if ($null -eq $raw) {
      ''
    } else {
      # NativeCommandError / ErrorRecord .ToString() is the stderr line; strings are stdout
      ($raw | ForEach-Object { "$_" }) -join "`n"
    }
    if (-not $AllowFail -and $code -ne 0) {
      throw "git $($Arguments -join ' ') failed (exit $code): $text"
    }
    return @{ ExitCode = $code; Output = $text }
  } finally {
    $ErrorActionPreference = $prevEap
  }
}

function Get-Fingerprint([string]$RelPath) {
  Push-Location $Root
  try {
    # Committed tree for this path (stable across unrelated commits elsewhere)
    $treeResult = Invoke-Git -Arguments @('rev-parse', "HEAD:$RelPath") -AllowFail
    $tree = $treeResult.Output.Trim()
    if ($treeResult.ExitCode -ne 0 -or -not $tree -or $tree -match 'fatal') { $tree = 'none' }

    $status = (Invoke-Git -Arguments @('status', '--porcelain', '--', $RelPath) -AllowFail).Output
    $diff   = (Invoke-Git -Arguments @('diff', 'HEAD', '--', $RelPath) -AllowFail).Output
    $text   = "$tree`n$status`n$diff"
    $bytes  = [System.Text.Encoding]::UTF8.GetBytes($text)
    $sha    = [System.Security.Cryptography.SHA256]::Create()
    try {
      $hash = $sha.ComputeHash($bytes)
      return ([BitConverter]::ToString($hash) -replace '-', '').ToLowerInvariant()
    } finally {
      $sha.Dispose()
    }
  } finally {
    Pop-Location
  }
}

function Read-DeployStamp {
  $map = @{}
  if (-not (Test-Path -LiteralPath $StampFile)) { return $map }
  Get-Content -LiteralPath $StampFile | ForEach-Object {
    if ($_ -match '^\s*([^=]+)=(.*)$') {
      $map[$Matches[1].Trim()] = $Matches[2].Trim()
    }
  }
  return $map
}

function Write-DeployStamp([string]$FrontendFp, [string]$BackendFp) {
  $lines = @(
    "frontend=$FrontendFp"
    "backend=$BackendFp"
    "deployed_at=$((Get-Date).ToUniversalTime().ToString('o'))"
    "stack=$StackName"
    "region=$AwsRegion"
  )
  Set-Content -LiteralPath $StampFile -Value $lines -Encoding UTF8
}

function Test-PathNeedsDeploy([string]$RelPath, [string]$StampKey, $Stamp) {
  $fp = Get-Fingerprint $RelPath
  if (-not $Stamp.ContainsKey($StampKey) -or [string]::IsNullOrWhiteSpace($Stamp[$StampKey])) {
    return @{ Needs = $true; Fingerprint = $fp; Reason = 'no previous deploy stamp' }
  }
  if ($Stamp[$StampKey] -ne $fp) {
    return @{ Needs = $true; Fingerprint = $fp; Reason = 'files changed since last deploy' }
  }

  # Unpushed commits that touch this path
  $upResult = Invoke-Git -Arguments @('rev-parse', '--abbrev-ref', '@{u}') -AllowFail
  $upstream = $upResult.Output.Trim()
  if ($upResult.ExitCode -eq 0 -and $upstream -and $upstream -ne '@{u}' -and $upstream -notmatch 'fatal') {
    $unpushed = (Invoke-Git -Arguments @('log', "$upstream..HEAD", '--oneline', '--', $RelPath) -AllowFail).Output.Trim()
    if ($unpushed) {
      return @{ Needs = $true; Fingerprint = $fp; Reason = 'unpushed commits since last deploy' }
    }
  }

  return @{ Needs = $false; Fingerprint = $fp; Reason = 'up to date' }
}

function Invoke-Checked([string]$Label, [scriptblock]$Block) {
  Write-Step $Label
  $prevEap = $ErrorActionPreference
  # Native CLIs (sam, aws, npm) often write progress to stderr; don't treat as fatal.
  $ErrorActionPreference = 'Continue'
  try {
    & $Block
    if ($LASTEXITCODE -ne $null -and $LASTEXITCODE -ne 0) {
      throw "$Label failed (exit $LASTEXITCODE)"
    }
  } finally {
    $ErrorActionPreference = $prevEap
  }
}

# --- Start ---
Write-Host ""
Write-Host "Delphinium Prospectus deploy" -ForegroundColor White
Write-Host "Repo: $Root"
Write-Host "Stack: $StackName  Region: $AwsRegion"

Refresh-ToolPath

foreach ($tool in @('git', 'aws', 'sam', 'node', 'npm')) {
  if (-not (Test-Command $tool)) {
    Write-Fail "'$tool' not found on PATH after refresh."
    Write-Host "Close and reopen this terminal, or install $tool, then try again."
    if ($tool -eq 'aws') {
      Write-Host "AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    }
    if ($tool -eq 'sam') {
      Write-Host "SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
    }
    exit 1
  }
}
if (-not (Test-Command 'go')) {
  Write-Warn "Go not found on PATH. Backend sam build may fail if the Makefile needs it."
}

Write-Step 'Checking AWS credentials'
$prevEap = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
  $identityRaw = & aws sts get-caller-identity --output json 2>&1
  $awsCode = $LASTEXITCODE
  $identityText = ($identityRaw | ForEach-Object { "$_" }) -join "`n"
  if ($awsCode -ne 0) { throw $identityText }
  $idObj = $identityText | ConvertFrom-Json
  Write-Ok "Authenticated as $($idObj.Arn)"
} catch {
  Write-Fail 'AWS credentials are missing or expired.'
  Write-Host ''
  Write-Host '  Run one of these, then re-run .\deploy.ps1 :' -ForegroundColor Yellow
  Write-Host '    aws login'
  Write-Host '    aws sso login'
  Write-Host ''
  exit 1
} finally {
  $ErrorActionPreference = $prevEap
}

# --- Detect changes ---
$stamp = Read-DeployStamp
$deployFrontend = $false
$deployBackend  = $false
$frontendFp = Get-Fingerprint 'frontend'
$backendFp  = Get-Fingerprint 'backend'
$frontendReason = ''
$backendReason  = ''

if ($ForceAll) {
  $deployFrontend = $true
  $deployBackend  = $true
  $frontendReason = 'forced (-ForceAll)'
  $backendReason  = 'forced (-ForceAll)'
} elseif ($FrontendOnly) {
  $deployFrontend = $true
  $frontendReason = 'forced (-FrontendOnly)'
} elseif ($BackendOnly) {
  $deployBackend = $true
  $backendReason = 'forced (-BackendOnly)'
} else {
  $fe = Test-PathNeedsDeploy 'frontend' 'frontend' $stamp
  $be = Test-PathNeedsDeploy 'backend' 'backend' $stamp
  $deployFrontend = $fe.Needs
  $deployBackend  = $be.Needs
  $frontendFp     = $fe.Fingerprint
  $backendFp      = $be.Fingerprint
  $frontendReason = $fe.Reason
  $backendReason  = $be.Reason
}

Write-Step 'Change detection'
if ($deployFrontend) { Write-Ok "Frontend: DEPLOY ($frontendReason)" } else { Write-Host "    Frontend: skip ($frontendReason)" }
if ($deployBackend)  { Write-Ok "Backend:  DEPLOY ($backendReason)" }  else { Write-Host "    Backend:  skip ($backendReason)" }

if (-not $deployFrontend -and -not $deployBackend) {
  Write-Warn 'Nothing to deploy (frontend and backend match last deploy).'
  Write-Host '    Use -ForceAll, -FrontendOnly, or -BackendOnly to deploy anyway.'
}

$deployedFrontend = $false
$deployedBackend  = $false

# --- Backend ---
if ($deployBackend) {
  Invoke-Checked 'Backend: sam build' {
    Push-Location (Join-Path $Root 'backend')
    try {
      sam build
    } finally {
      Pop-Location
    }
  }

  Invoke-Checked 'Backend: sam deploy' {
    Push-Location (Join-Path $Root 'backend')
    try {
      # Non-interactive; uses backend/samconfig.toml (includes ApiPassword=delphinium)
      sam deploy `
        --no-confirm-changeset `
        --no-fail-on-empty-changeset `
        --stack-name $StackName `
        --region $AwsRegion
    } finally {
      Pop-Location
    }
  }
  $deployedBackend = $true
  Write-Ok 'Backend deployed.'
}

# --- Frontend ---
if ($deployFrontend) {
  Invoke-Checked 'Frontend: install dependencies' {
    Push-Location (Join-Path $Root 'frontend')
    try {
      if (Test-Path -LiteralPath 'package-lock.json') {
        npm ci
      } else {
        npm install
      }
    } finally {
      Pop-Location
    }
  }

  Invoke-Checked 'Frontend: build' {
    Push-Location (Join-Path $Root 'frontend')
    try {
      $env:VITE_API_URL = $ApiUrl
      npm run build
    } finally {
      Pop-Location
    }
  }

  Invoke-Checked "Frontend: sync to s3://$FrontendBucket" {
    aws s3 sync (Join-Path $Root 'frontend\dist') "s3://$FrontendBucket/" --delete --region $AwsRegion
  }

  Invoke-Checked "Frontend: CloudFront invalidation ($CloudFrontId)" {
    aws cloudfront create-invalidation --distribution-id $CloudFrontId --paths '/*' --region $AwsRegion | Out-Null
  }
  $deployedFrontend = $true
  Write-Ok 'Frontend deployed.'
}

# --- Git commit + push ---
$gitPushed = $false
$gitCommitted = $false
$gitMessage = $null

if (-not $SkipGit) {
  Write-Step 'Git: staging project changes'
  # Respects .gitignore (skips node_modules, dist, .aws-sam, .env, etc.)
  [void](Invoke-Git -Arguments @('add', '-A'))

  # Extra safety: never stage secrets if somehow present
  foreach ($secret in @('.env', 'frontend/.env', 'backend/.env')) {
    [void](Invoke-Git -Arguments @('reset', '--', 'HEAD', '--', $secret) -AllowFail)
  }

  $porcelain = (Invoke-Git -Arguments @('status', '--porcelain') -AllowFail).Output.Trim()
  if (-not $porcelain) {
    Write-Warn 'Nothing to commit (working tree clean).'
  } else {
    $parts = @()
    if ($deployedFrontend) { $parts += 'frontend' }
    if ($deployedBackend)  { $parts += 'backend' }
    if ($parts.Count -eq 0) {
      $gitMessage = 'Deploy: sync project updates'
    } else {
      $gitMessage = "Deploy: $($parts -join ' + ') updates"
    }

    Write-Ok "Commit message: $gitMessage"
    # Use a simple -m for Windows PowerShell (no bash heredoc)
    [void](Invoke-Git -Arguments @('commit', '-m', $gitMessage))
    $gitCommitted = $true
  }

  # Stamp AFTER commit so fingerprints match the clean committed trees
  if ($deployedFrontend -or $deployedBackend -or -not (Test-Path -LiteralPath $StampFile)) {
    Write-Step 'Recording .last-deploy stamp'
    $frontendFp = Get-Fingerprint 'frontend'
    $backendFp  = Get-Fingerprint 'backend'
    Write-DeployStamp -FrontendFp $frontendFp -BackendFp $backendFp
    [void](Invoke-Git -Arguments @('add', '--', '.last-deploy'))
    $stampDirty = (Invoke-Git -Arguments @('status', '--porcelain', '--', '.last-deploy') -AllowFail).Output.Trim()
    if ($stampDirty) {
      [void](Invoke-Git -Arguments @('commit', '-m', 'Deploy: record .last-deploy stamp'))
      $gitCommitted = $true
    }
    Write-Ok 'Updated .last-deploy'
  }

  if ($gitCommitted) {
    Write-Step 'Git: push to GitHub'
    $pushResult = Invoke-Git -Arguments @('push') -AllowFail
    if ($pushResult.ExitCode -ne 0) {
      Write-Fail 'git push failed. Commit is local; fix remote access and run: git push'
      Write-Host '    (This script never force-pushes.)'
      if ($pushResult.Output) { Write-Host "    $($pushResult.Output)" }
      exit 1
    }
    $gitPushed = $true
    Write-Ok 'Pushed to origin.'
  }
} else {
  Write-Warn 'Skipped git commit/push (-SkipGit).'
  if ($deployedFrontend -or $deployedBackend -or -not (Test-Path -LiteralPath $StampFile)) {
    $frontendFp = Get-Fingerprint 'frontend'
    $backendFp  = Get-Fingerprint 'backend'
    Write-DeployStamp -FrontendFp $frontendFp -BackendFp $backendFp
    Write-Ok 'Updated .last-deploy (local only; not committed)'
  }
}

# --- Summary ---
Write-Host ""
Write-Host "========================================" -ForegroundColor White
Write-Host " Deploy summary" -ForegroundColor White
Write-Host "========================================" -ForegroundColor White
Write-Host ("  Backend:   " + $(if ($deployedBackend)  { 'deployed' } else { 'skipped' }))
Write-Host ("  Frontend:  " + $(if ($deployedFrontend) { 'deployed' } else { 'skipped' }))
Write-Host ("  Git:       " + $(
  if ($SkipGit) { 'skipped' }
  elseif ($gitPushed) { "committed + pushed ($gitMessage)" }
  elseif ($gitCommitted) { "committed locally, push failed ($gitMessage)" }
  else { 'nothing to commit' }
))
Write-Host "  Site URL:  $CloudFrontUrl"
Write-Host "  API URL:   $ApiUrl"
Write-Host "========================================" -ForegroundColor White
Write-Host ""
Write-Ok 'Done.'
