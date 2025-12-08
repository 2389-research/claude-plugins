#!/bin/bash
# ABOUTME: Cross-platform launcher for session-start hook
# ABOUTME: Detects OS and calls appropriate script (bash or PowerShell)

# Detect OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
    # Windows detected - use PowerShell
    HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    POWERSHELL_SCRIPT="${HOOK_DIR}/session-start-title.ps1"

    # Check if PowerShell script exists
    if [ ! -f "$POWERSHELL_SCRIPT" ]; then
        echo "Error: PowerShell script not found: $POWERSHELL_SCRIPT" >&2
        exit 1
    fi

    # Try to find PowerShell (pwsh or powershell.exe)
    if command -v pwsh >/dev/null 2>&1; then
        exec pwsh -NoProfile -ExecutionPolicy Bypass -File "$POWERSHELL_SCRIPT"
    elif command -v powershell.exe >/dev/null 2>&1; then
        exec powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$POWERSHELL_SCRIPT"
    else
        echo "Error: PowerShell not found on Windows" >&2
        exit 1
    fi
else
    # Unix-like system (Linux, macOS, etc.) - use bash
    HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    BASH_SCRIPT="${HOOK_DIR}/session-start-title.sh"

    if [ -f "$BASH_SCRIPT" ]; then
        exec bash "$BASH_SCRIPT"
    else
        echo "Error: Bash script not found: $BASH_SCRIPT" >&2
        exit 1
    fi
fi
