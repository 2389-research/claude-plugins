# Windows Support for Terminal Title Plugin

## Overview

As of December 2025, the terminal-title plugin now has full cross-platform support for Windows, macOS, and Linux.

## Problem Solved

Previously, Windows users would encounter this error on session start:

```text
Plugin hook error: /bin/bash: C:UsersNat.claudeplugins...
```

This occurred because:
1. Windows uses different path formats (`C:\Users\...` vs `/Users/...`)
2. Windows may not have bash at `/bin/bash`
3. The hook was hardcoded to run bash scripts

## Solution Architecture

The solution uses a **multi-script approach** with automatic OS detection:

### Components Created

1. **PowerShell Scripts** (Windows-specific)
   - `skills/scripts/set_title.ps1` - Sets terminal title on Windows
   - `hooks/session-start-title.ps1` - Session start hook for Windows

2. **Cross-Platform Launcher**
   - `hooks/session-start-launcher.sh` - Detects OS and calls appropriate script
   - Modified `hooks/hooks.json` to use launcher instead of direct bash invocation

3. **Updated Skill Documentation**
   - Added OS detection steps to `skills/SKILL.md`
   - Added Windows-specific examples
   - Updated setup requirements for both platforms

### How It Works

```text
SessionStart Hook Fired
         ↓
session-start-launcher.sh
         ↓
    Detect $OSTYPE
         ↓
    ┌────┴────┐
    ↓         ↓
Windows    Unix/Mac
    ↓         ↓
  .ps1      .sh
    ↓         ↓
PowerShell  Bash
    └────┬────┘
         ↓
  Title Updated
```

## Windows-Specific Implementation

### PowerShell Script Features

The `set_title.ps1` script:
- Uses PowerShell parameter validation
- Reads from `$env:TERMINAL_TITLE_EMOJI` environment variable
- **Sanitizes all inputs including emoji** to prevent ANSI escape sequence injection
- Removes control characters (0x00-0x1F) from all user input
- Limits string lengths to prevent buffer issues
- Sends ANSI escape sequences via `Write-Host`
- Supports Windows Terminal, PowerShell, and CMD

### Session Start Hook

The `session-start-title.ps1` script:
- Detects project name from:
  - `package.json` (using `ConvertFrom-Json`)
  - Git remote URL (using `git` command)
  - `README.md` first heading
  - Directory basename (fallback)
- Uses PowerShell path handling (`Join-Path`, `Split-Path`)
- Has fallback paths for plugin directory

### OS Detection

The launcher uses bash's `$OSTYPE` variable:

```bash
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
    # Windows - use PowerShell
    pwsh -NoProfile -ExecutionPolicy Bypass -File script.ps1
else
    # Unix - use bash
    bash script.sh
fi
```

## Installation for Windows Users

### Prerequisites

**PowerShell 7+** must be installed and available as `pwsh` in PATH:

```powershell
# Check PowerShell version
pwsh --version

# If not installed, download from:
# https://github.com/PowerShell/PowerShell/releases
```

### Plugin Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install terminal-title@2389-research
```

### Permissions Setup

Add to `~/.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(pwsh *skills/scripts/set_title.ps1:*)"
    ]
  }
}
```

### Environment Variable (Optional)

Set custom emoji in PowerShell profile:

```powershell
# In $PROFILE
$env:TERMINAL_TITLE_EMOJI = "💻"
```

## Testing on Windows

### Manual Test

From PowerShell in the plugin directory:

```powershell
# Test set_title.ps1 directly
pwsh -NoProfile -ExecutionPolicy Bypass -File skills/scripts/set_title.ps1 "Test Project" "Testing"

# Test session start hook
pwsh -NoProfile -ExecutionPolicy Bypass -File hooks/session-start-title.ps1
```

### Expected Behavior

1. Terminal title updates to: `[emoji] Project Name - Topic`
2. No error messages in console
3. Claude session continues normally

## Backwards Compatibility

The solution maintains **100% backwards compatibility** with Unix systems:

- Launcher detects OS automatically
- Unix systems continue using bash scripts
- No changes to Unix user experience
- Same logging and fallback behavior

### Testing Unix Compatibility

```bash
# Test launcher on Unix
bash hooks/session-start-launcher.sh

# Test set_title.sh directly
bash skills/scripts/set_title.sh "Test" "Testing"
```

## Troubleshooting

### Windows: "pwsh not found"

**Problem:** PowerShell 7+ not installed or not in PATH

**Solution:**
1. Install PowerShell 7+ from [the PowerShell releases page](https://github.com/PowerShell/PowerShell/releases)
2. Add to PATH, or
3. Edit launcher to use `powershell.exe` instead (legacy PowerShell)

### Windows: "Execution Policy" Error

**Problem:** PowerShell script execution blocked

**Solution:** The launcher uses `-ExecutionPolicy Bypass` to avoid this issue. If it persists:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Windows: Terminal Title Not Updating

**Problem:** Terminal doesn't support ANSI escape sequences

**Solution:**
1. Use Windows Terminal (recommended)
2. Or upgrade to PowerShell 7+ which has better ANSI support
3. Check if `$env:TERMINAL_TITLE_EMOJI` is set (optional)

### Unix: Launcher Not Working

**Problem:** Launcher script not executable

**Solution:**
```bash
chmod +x hooks/session-start-launcher.sh
```

## Files Modified/Created

### New Files
- `skills/scripts/set_title.ps1` - PowerShell title setter
- `hooks/session-start-title.ps1` - PowerShell session start hook
- `hooks/session-start-launcher.sh` - Cross-platform launcher

### Modified Files
- `hooks/hooks.json` - Changed to use launcher instead of direct bash
- `skills/SKILL.md` - Added OS detection steps and Windows example
- `README.md` - Added platform-specific setup instructions

### Unchanged Files (Backwards Compatible)
- `skills/scripts/set_title.sh` - Original bash script
- `hooks/session-start-title.sh` - Original bash hook

## Future Enhancements

Potential improvements for Windows support:

1. **Batch file alternative** - For systems without PowerShell 7+
2. **Auto-install pwsh** - Detect and offer to install PowerShell
3. **Windows-specific emoji defaults** - Different defaults for Windows Terminal
4. **Path normalization** - Handle mixed path separators (/ vs \)
5. **Git Bash support** - Optimize for Git Bash environment on Windows

## Related Issues

- Original error report: Windows user "Nat" encountering bash path errors
- Platform: Windows 10/11 with Claude Code CLI
- Terminal: Likely Windows Terminal or Git Bash

## Testing Matrix

| Platform | Terminal | PowerShell Version | Status |
|----------|----------|-------------------|--------|
| macOS | Terminal.app | N/A (uses bash) | ✅ Tested |
| macOS | iTerm2 | N/A (uses bash) | ✅ Tested |
| Linux | gnome-terminal | N/A (uses bash) | ✅ Expected to work |
| Windows | Windows Terminal | 7.4+ | ⚠️ Needs testing |
| Windows | PowerShell | 7.4+ | ⚠️ Needs testing |
| Windows | Git Bash | Via pwsh | ⚠️ Needs testing |
| Windows | CMD | Via pwsh | ⚠️ Needs testing |

## Next Steps

1. **Windows user testing** - Need real Windows user to test the fix
2. **Git Bash verification** - Confirm launcher works in Git Bash environment
3. **Documentation** - Update main repo docs with Windows support
4. **CI/CD** - Add Windows testing to any automated tests

## Contact

For Windows-specific issues or testing feedback:
- Report issues at: <https://github.com/2389-research/claude-plugins/issues>
- Tag with: `windows`, `terminal-title`, `cross-platform`
