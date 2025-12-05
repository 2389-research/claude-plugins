# Terminal Title Plugin

## Overview

This plugin automatically updates the terminal title with emoji + project + topic context to provide visual cues when switching between terminal windows.

## Skills Included

### terminal-title

Auto-invoked skill that:
1. Detects current project from working directory
2. Infers topic from recent files or conversation context
3. Selects appropriate emoji based on project type
4. Updates terminal title via shell script

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

Determines project from:
- Working directory name
- Git repository name
- Project-specific files (package.json, pyproject.toml, etc.)

### Topic Inference

Infers topic from:
- Recent git commits
- Modified files in working directory
- Conversation context

### Emoji Selection

Maps project types to emojis:
- 🔥 Firebase projects
- ⚛️  React projects
- 🐍 Python projects
- 📦 Node.js projects
- 🎨 CSS/design work
- 🔧 General development

### Shell Script

Uses `scripts/set_title.sh` to update terminal title:

```bash
#!/bin/bash
echo -ne "\033]0;$1\007"
```

## Development Workflow

1. **Session start**: Hook auto-invokes skill
2. **Context detection**: Analyzes project and topic
3. **Title update**: Calls shell script with formatted title
4. **Runtime updates**: Responds to topic changes during session

## Testing

Tests are located in `tests/integration/`:
- `terminal-title.test.md` - Tests auto-invocation and title updates

## Documentation

- [Design Document](docs/2025-11-14-terminal-title-skill-design.md)
- [Implementation Plan](docs/2025-11-14-terminal-title-implementation.md)

## Integration with Workflows Plugin

The workflows plugin provides standards for terminal title format and update patterns.

To install: `/plugin install workflows@2389-research`
