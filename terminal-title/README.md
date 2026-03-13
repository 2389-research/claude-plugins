# Terminal title

Automatically updates your terminal title with emoji + project + topic context. Works on Windows, macOS, and Linux.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install terminal-title@2389-research
```

### Environment variables

Add these to your `.bashrc`, `.zshrc`, or shell profile:

```bash
# Set to 1 to disable automatic terminal title updates
export CLAUDE_CODE_DISABLE_TERMINAL_TITLE=0

# Optional: set an emoji prefix for your terminal title.
# Useful for distinguishing work vs personal terminals at a glance.
export TERMINAL_TITLE_EMOJI=💼
```

If `TERMINAL_TITLE_EMOJI` is not set, the plugin defaults to 🎉.

### Platform-specific setup

Windows users need PowerShell 7+ (`pwsh`) installed and on PATH. The plugin picks it up automatically.

Unix/Linux/macOS users don't need to do anything extra.

## What this plugin does

One skill: `terminal-title` -- manages your terminal title based on project and topic context.

The title updates automatically at session start, and again whenever the topic changes. The emoji prefix gives you a quick visual cue when switching between terminal windows.

## How it works

A session start hook fires the terminal-title skill, which:

1. Detects your OS (Windows, macOS, Linux)
2. Figures out the current project from the working directory, git repo, or package.json
3. Infers the topic from conversation context
4. Reads `TERMINAL_TITLE_EMOJI` from the environment (or defaults to 🎉)
5. Updates the terminal title via a platform-specific script (`.ps1` on Windows, `.sh` everywhere else)

The title format is: `$EMOJI ProjectName - Topic`

## Examples

```text
💼 OneOnOne - Firebase Config
💼 Claude Plugins - Terminal Title
🎉 dotfiles - zsh config
```

## Documentation

- [Design document](docs/2025-11-14-terminal-title-skill-design.md)
- [Implementation plan](docs/2025-11-14-terminal-title-implementation.md)
