#Requires -Version 5.1
<#
.SYNOPSIS
  Verify Prospectus dual-hostname requirement after custom-domain deploy.

.DESCRIPTION
  Confirms both https://prospectus.delphi-me.com and
  https://dgnilygbxuhxd.cloudfront.net serve the SPA (and optional quote path)
  without a cross-hostname redirect that would break old bookmarks.
#>
[CmdletBinding()]
param(
  [string]$CustomHost = 'https://prospectus.delphi-me.com',
  [string]$LegacyHost = 'https://dgnilygbxuhxd.cloudfront.net',
  [string]$Path = '/pricing'
)

$ErrorActionPreference = 'Stop'

function Test-HostServing {
  param(
    [Parameter(Mandatory)][string]$BaseUrl,
    [Parameter(Mandatory)][string]$RelPath,
    [Parameter(Mandatory)][string]$Label
  )
  $url = ($BaseUrl.TrimEnd('/') + '/' + $RelPath.TrimStart('/'))
  Write-Host "==> $Label : $url"
  $resp = Invoke-WebRequest -Uri $url -MaximumRedirection 0 -SkipHttpErrorCheck -UseBasicParsing
  $loc = $resp.Headers['Location']
  $code = [int]$resp.StatusCode
  Write-Host ("    status={0} location={1}" -f $code, $(if ($loc) { $loc } else { '(none)' }))

  if ($code -ge 300 -and $code -lt 400 -and $loc) {
    $locHost = ([Uri]$loc).Host
    $srcHost = ([Uri]$BaseUrl).Host
    if ($locHost -and $locHost -ne $srcHost) {
      throw "$Label redirected across hostnames ($srcHost -> $locHost). Old bookmarks would break."
    }
  }
  if ($code -lt 200 -or $code -ge 400) {
    # Follow redirects on same host only for content check
    $follow = Invoke-WebRequest -Uri $url -MaximumRedirection 5 -UseBasicParsing
    if ([int]$follow.StatusCode -lt 200 -or [int]$follow.StatusCode -ge 400) {
      throw "$Label failed HTTP $code (follow=$($follow.StatusCode))"
    }
    $body = $follow.Content
  } else {
    $body = $resp.Content
  }
  if ($body -notmatch 'root|Delphinium|prospectus|Pricing|vite' -and $body.Length -lt 50) {
    Write-Warning "$Label response body looks unexpectedly small ($($body.Length) bytes)"
  } else {
    Write-Host ("    ok bodyBytes={0}" -f $body.Length)
  }
}

Test-HostServing -BaseUrl $CustomHost -RelPath $Path -Label 'custom'
Test-HostServing -BaseUrl $LegacyHost -RelPath $Path -Label 'legacy'
Write-Host ''
Write-Host 'Both hostnames OK (no cross-host redirect).' -ForegroundColor Green
