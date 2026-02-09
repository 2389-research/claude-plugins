# Terminal title

Automatically updates your terminal title with emoji + project + topic context. Works on Windows, macOS, and Linux. Also establishes 2389 workflow conventions for TodoWrite task tracking.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install terminal-title@2389-research
```

### Platform-specific setup

Windows users need PowerShell 7+ (`pwsh`) installed and on PATH. The plugin picks it up automatically.

Unix/Linux/macOS users don't need to do anything extra.

## What this plugin does

One skill: `terminal-title` -- manages your terminal title based on project and topic context.

The title updates automatically at session start, and again whenever the topic changes. An emoji prefix gives you a quick visual cue when switching between terminal windows.

The plugin also defines the TodoWrite conventions that all 2389 plugins share: granular 2-5 minute tasks, one in-progress at a time.

## How it works

A session start hook fires the terminal-title skill, which:

1. Detects your OS (Windows, macOS, Linux)
2. Figures out the current project from the working directory, git repo, or package.json
3. Infers the topic from recent files or conversation context
4. Picks an emoji from an environment variable (or defaults to a party popper)
5. Updates the terminal title via a platform-specific script (`.ps1` on Windows, `.sh` everywhere else)

## Example

```text
🔥 firebase-app > authentication setup
```

## TodoWrite conventions

This plugin establishes the task tracking patterns used across all 2389 plugins:

```javascript
{
  content: "Write the failing test",      // Imperative form
  status: "pending",                       // or "in_progress" or "completed"
  activeForm: "Writing the failing test"   // Present continuous form
}
```

Task lifecycle:
1. Create todos for all steps (2-5 minutes each)
2. Mark ONE task as in_progress
3. Complete the task
4. Mark as completed immediately
5. Move to next task

## Documentation

- [Design document](docs/2025-11-14-terminal-title-skill-design.md)
- [Implementation plan](docs/2025-11-14-terminal-title-implementation.md)


