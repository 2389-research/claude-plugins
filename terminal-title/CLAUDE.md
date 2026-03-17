# Terminal Title Plugin

## Overview

This plugin automatically updates the terminal title with emoji + project + topic context to provide visual cues when switching between terminal windows.

## Skills Included

### terminal-title

Auto-invoked skill that:
1. Detects current project from working directory, git repo, or package.json
2. Infers topic from conversation context
3. Reads emoji from `$TERMINAL_TITLE_EMOJI` environment variable (defaults to 🎉)
4. Updates terminal title via platform-specific shell script
5. Detects topic changes throughout the conversation and updates title accordingly

## Environment Variables

- `TERMINAL_TITLE_EMOJI` -- emoji prefix for the title. User sets this in their shell profile to distinguish contexts (e.g. 💼 for work, 🎉 for personal). Defaults to 🎉 if not set.
- `CLAUDE_CODE_DISABLE_TERMINAL_TITLE` -- set to `1` to disable Claude Code's *built-in* terminal title updater. Required so it doesn't conflict with this plugin.

## Title Format

```
$EMOJI ProjectName - Topic
```

Examples:
- `💼 OneOnOne - Firebase Config`
- `🎉 dotfiles - zsh config`

## Hook Configuration

The plugin includes a session start hook:

```json
{
  "hooks": {
    "sessionStart": {
      "skill": "terminal-title"
    }
  }
}
```

This ensures the terminal title is set automatically when Claude Code starts.

## How It Works

### Project Detection

Determines project name using Claude's understanding of context:
- Git repository name or remote URL
- package.json name field
- README.md first heading
- Working directory basename (fallback)

### Topic Inference

Infers topic from:
- Current conversation context (what user is working on)
- Defaults to "Claude Code" at session start

### Shell Scripts

Cross-platform scripts in `skills/scripts/`:
- `set_title.sh` -- Unix/Linux/macOS (bash)
- `set_title.ps1` -- Windows (PowerShell)

Both read `$TERMINAL_TITLE_EMOJI` from the environment, sanitize inputs, and send terminal escape sequences.

## Development Workflow

1. **Session start**: Hook auto-invokes skill
2. **Context detection**: Analyzes project and topic
3. **Title update**: Calls shell script with formatted title
4. **Runtime updates**: Detects topic changes during conversation and re-invokes

## Testing

Tests are located in `tests/integration/`:
- `terminal-title.test.md` - Tests auto-invocation and title updates

## Documentation

- [Design Document](docs/2025-11-14-terminal-title-skill-design.md)
- [Implementation Plan](docs/2025-11-14-terminal-title-implementation.md)
