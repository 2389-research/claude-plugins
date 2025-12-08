# Terminal Title Plugin

Automatically updates terminal title with emoji + project + topic context. **Cross-platform support for Windows, macOS, and Linux.** Also establishes 2389 workflow conventions for TodoWrite task tracking.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install terminal-title@2389-research
```

### Platform-Specific Setup

**Windows users:** Ensure PowerShell 7+ (`pwsh`) is installed and available in your PATH. The plugin automatically uses PowerShell scripts on Windows.

**Unix/Linux/macOS users:** No additional setup required. The plugin uses bash scripts automatically.

## What This Plugin Provides

**Skills provided:**

- `terminal-title` – Automatically manages the terminal title based on project and topic context

**Automatic terminal title management:**

- **Auto-invokes at session start**: Sets initial title based on project context
- **Updates on topic changes**: Reflects current work in terminal title
- **Emoji indicators**: Visual cues for quick context switching

**2389 workflow conventions:**

- **TodoWrite patterns**: Granular 2-5 minute task tracking
- **Task lifecycle management**: One task in-progress at a time
- **Shared conventions**: Used across all 2389 plugins

## How It Works

The plugin includes a session start hook that automatically invokes the terminal-title skill. The skill:

1. **Detects your operating system** (Windows, macOS, Linux)
2. **Detects current project** from working directory, git repo, or package.json
3. **Infers topic** from recent files or conversation context
4. **Selects appropriate emoji** from environment variable or defaults to 🎉
5. **Updates terminal title** via platform-specific script:
   - Windows: PowerShell (`.ps1`)
   - Unix/Linux/macOS: Bash (`.sh`)

## Example

```text
🔥 firebase-app > authentication setup
```

## TodoWrite Conventions

This plugin establishes task tracking patterns used across all 2389 plugins:

```javascript
{
  content: "Write the failing test",      // Imperative form
  status: "pending",                       // or "in_progress" or "completed"
  activeForm: "Writing the failing test"   // Present continuous form
}
```

**Task lifecycle:**
1. Create todos for all steps (2-5 minutes each)
2. Mark ONE task as in_progress
3. Complete the task
4. Mark as completed immediately
5. Move to next task

## Documentation

- [Design Document](docs/2025-11-14-terminal-title-skill-design.md)
- [Implementation Plan](docs/2025-11-14-terminal-title-implementation.md)


