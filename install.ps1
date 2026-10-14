<#
.SYNOPSIS
  Installs Jibe (the template/ folder) into a project. Never overwrites by default.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\install.ps1 -Target C:\code\my-app
  powershell -ExecutionPolicy Bypass -File .\install.ps1 -Target C:\code\my-app -Force   # overwrite kit files

  Then open the project in Claude Code and run:  /adapt-setup
#>
param(
    [Parameter(Mandatory = $true)][string]$Target,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
$source = Join-Path $PSScriptRoot 'template'
if (-not (Test-Path $source)) { throw "Template folder not found: $source" }
if (-not (Test-Path $Target)) { throw "Target folder not found: $Target" }
$Target = (Resolve-Path $Target).Path

# Files a project often already has: instead of skipping them, Jibe's version is saved
# next to them as a *.starter.* copy, and /adapt-setup merges it in.
$mergeable = @{
    'CLAUDE.md'             = 'CLAUDE.starter.md'
    '.claude\settings.json' = '.claude\settings.starter.json'
}

$created = 0; $skipped = 0; $overwritten = 0; $toMerge = @()
Get-ChildItem -Path $source -Recurse -File -Force | ForEach-Object {
    $rel = $_.FullName.Substring($source.Length).TrimStart('\', '/')
    $dest = Join-Path $Target $rel
    $destDir = Split-Path $dest -Parent
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Force -Path $destDir | Out-Null }

    if ((Test-Path $dest) -and -not $Force -and $mergeable.ContainsKey($rel)) {
        $alt = $mergeable[$rel]
        $altPath = Join-Path $Target $alt
        if ((Test-Path $altPath) -or ((Get-FileHash $dest).Hash -eq (Get-FileHash $_.FullName).Hash)) {
            Write-Host "  skipped    $rel (exists)" -ForegroundColor DarkGray
            $skipped++
        } else {
            Copy-Item -LiteralPath $_.FullName -Destination $altPath
            Write-Host "  merge      $rel exists -> kit version saved as $alt" -ForegroundColor Magenta
            $toMerge += $alt
            $created++
        }
    } elseif (Test-Path $dest) {
        if ($Force) {
            Copy-Item -LiteralPath $_.FullName -Destination $dest -Force
            Write-Host "  overwrote  $rel" -ForegroundColor Yellow
            $overwritten++
        } else {
            Write-Host "  skipped    $rel (exists)" -ForegroundColor DarkGray
            $skipped++
        }
    } else {
        Copy-Item -LiteralPath $_.FullName -Destination $dest
        Write-Host "  created    $rel" -ForegroundColor Green
        $created++
    }
}

# Personal/local files must not be committed (idempotent append).
$gitignore = Join-Path $Target '.gitignore'
$wanted = @('CLAUDE.local.md', '.claude/settings.local.json', '.claude/worktrees/')
$existing = @()
if (Test-Path $gitignore) { $existing = Get-Content $gitignore }
$missing = $wanted | Where-Object { $existing -notcontains $_ }
if ($missing) {
    $block = @('', '# Claude Code (personal files)') + $missing
    Add-Content -Path $gitignore -Value $block
    Write-Host "  updated    .gitignore (+$($missing.Count) entries)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Done: $created created, $overwritten overwritten, $skipped skipped." -ForegroundColor Cyan
if ($toMerge.Count -gt 0) {
    Write-Host "Needs merging (/adapt-setup does this): $($toMerge -join ', ')" -ForegroundColor Magenta
}

# The hooks run on Node. Without it, the guard hooks silently do nothing.
$node = Get-Command node -ErrorAction SilentlyContinue
$major = 0
if ($node) { try { $major = [int]((& node --version) -replace '^v(\d+).*', '$1') } catch { $major = 0 } }
if ($major -lt 20) {
    Write-Host ""
    Write-Host "WARNING: Node 20+ was not found on PATH (found: $(if ($node) { & node --version } else { 'none' }))." -ForegroundColor Red
    Write-Host "         The hooks in .claude/hooks (command blocking, file protection, auto-format) will NOT run." -ForegroundColor Red
    Write-Host "         Install Node 20+ from https://nodejs.org or remove the hooks from .claude/settings.json." -ForegroundColor Red
}

Write-Host "Next: open $Target in Claude Code and run /adapt-setup" -ForegroundColor Cyan
