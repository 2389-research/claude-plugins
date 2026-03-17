# ABOUTME: Sets terminal window title with emoji, project name, and topic (Windows PowerShell)
# ABOUTME: Usage: .\set_title.ps1 "Project Name" "Topic"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,

    [Parameter(Mandatory=$true)]
    [string]$Topic
)

# Exit silently if arguments are empty (fail-safe behavior)
if ([string]::IsNullOrWhiteSpace($ProjectName) -or [string]::IsNullOrWhiteSpace($Topic)) {
    exit 0
}

# Get emoji from environment, default to 🎉
# Sanitize to prevent ANSI escape sequence injection
$Emoji = if ($env:TERMINAL_TITLE_EMOJI) {
    $env:TERMINAL_TITLE_EMOJI -replace '[\x00-\x1F]', ''
} else {
    "🎉"
}

# Sanitize inputs (remove control characters, limit length)
$ProjectName = $ProjectName -replace '[\x00-\x1F]', ''
$Topic = $Topic -replace '[\x00-\x1F]', ''

if ($ProjectName.Length -gt 40) {
    $ProjectName = $ProjectName.Substring(0, 40)
}
if ($Topic.Length -gt 40) {
    $Topic = $Topic.Substring(0, 40)
}

# Ensure values not empty after sanitization
if ([string]::IsNullOrWhiteSpace($ProjectName) -or [string]::IsNullOrWhiteSpace($Topic)) {
    exit 0
}

# Set the terminal title
# Format: "emoji ProjectName - Topic   " (3 spaces compensate for truncation)
$Title = "$Emoji $ProjectName - $Topic   "

# Try multiple approaches — the Bash tool may capture stdout/Write-Host output,
# so we need to reach the terminal directly.
try {
    # Direct console title set (most reliable on Windows)
    $Host.UI.RawUI.WindowTitle = $Title
} catch {
    # Fallback: ANSI escape sequence via console output stream
    try {
        [Console]::Write("`e]0;$Title`a")
    } catch {
        # Last resort: Write-Host (may not reach terminal from Bash tool)
        Write-Host "`e]0;$Title`a" -NoNewline
    }
}

exit 0
