# ABOUTME: SessionStart hook wrapper that detects project name and sets terminal title (Windows PowerShell)
# ABOUTME: Called automatically by Claude Code when session starts

$ErrorActionPreference = "SilentlyContinue"

# Get current working directory
$CWD = Get-Location

# Intelligent project name detection
$ProjectName = ""

# Check for package.json name field (Node.js projects)
$PackageJsonPath = Join-Path $CWD "package.json"
if (Test-Path $PackageJsonPath) {
    try {
        $PackageJson = Get-Content $PackageJsonPath | ConvertFrom-Json
        if ($PackageJson.name) {
            # Convert kebab-case to Title Case
            $ProjectName = ($PackageJson.name -split '-' | ForEach-Object {
                $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower()
            }) -join ' '
        }
    } catch {
        # Silently continue if package.json parsing fails
    }
}

# Check git remote URL
if (-not $ProjectName) {
    $GitDir = Join-Path $CWD ".git"
    if (Test-Path $GitDir) {
        try {
            $GitRemote = git -C $CWD config --get remote.origin.url 2>$null
            if ($GitRemote) {
                # Extract repo name from URL (e.g., github.com/user/repo.git -> repo)
                $RepoName = [System.IO.Path]::GetFileNameWithoutExtension($GitRemote)
                # Convert kebab-case to Title Case
                $ProjectName = ($RepoName -split '-' | ForEach-Object {
                    $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower()
                }) -join ' '
            }
        } catch {
            # Silently continue if git remote fails
        }
    }
}

# Check README.md first heading
if (-not $ProjectName) {
    $ReadmePath = Join-Path $CWD "README.md"
    if (Test-Path $ReadmePath) {
        try {
            $FirstHeading = Get-Content $ReadmePath | Select-String -Pattern '^#' | Select-Object -First 1
            if ($FirstHeading) {
                $ProjectName = $FirstHeading.Line -replace '^#+ ', ''
            }
        } catch {
            # Silently continue if README.md fails
        }
    }
}

# Fallback: Use directory basename and humanize it
if (-not $ProjectName) {
    $DirName = Split-Path -Leaf $CWD
    # Convert kebab-case or snake_case to Title Case
    $ProjectName = ($DirName -replace '[-_]', ' ' -split ' ' | ForEach-Object {
        $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower()
    }) -join ' '
}

# Find the set_title.ps1 script (relative to this hook script)
$HookDir = Split-Path -Parent $PSCommandPath
$PluginRoot = Split-Path -Parent $HookDir
$SetTitleScript = Join-Path $PluginRoot "skills\scripts\set_title.ps1"

# Call set_title.ps1 with detected project name and "Claude Code" as topic
if (Test-Path $SetTitleScript) {
    try {
        & $SetTitleScript -ProjectName $ProjectName -Topic "Claude Code" 2>$null
    } catch {
        # Silently continue if set_title.ps1 fails
    }
} else {
    # Fallback: try to find it in Claude's plugin directory
    $SetTitleScript = Join-Path $env:USERPROFILE ".claude\plugins\terminal-title\skills\scripts\set_title.ps1"
    if (Test-Path $SetTitleScript) {
        try {
            & $SetTitleScript -ProjectName $ProjectName -Topic "Claude Code" 2>$null
        } catch {
            # Silently continue if fallback fails
        }
    }
}

# Output JSON with additionalContext for Claude Code to inject as system reminder
@"
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<CRITICAL_SESSION_START_INSTRUCTION>\n\nBEFORE responding to the user, you MUST:\n\n1. Use the Skill tool to invoke: terminal-title\n2. This will refine the terminal title from the default set by the command hook\n3. Only THEN respond to the user's message\n\nThis is NOT optional. This is NOT negotiable. The terminal title skill MUST run at session start.\n\nIf you respond to the user without invoking terminal-title first, you have FAILED.\n\n</CRITICAL_SESSION_START_INSTRUCTION>"
  }
}
"@

exit 0
