# Terminal Title Plugin

## Overview

This plugin automatically updates the terminal title with emoji + project + topic context to provide visual cues when switching between terminal windows. It also establishes 2389 workflow conventions for TodoWrite task tracking.

## Skills Included

### terminal-title

Auto-invoked skill that:
1. Detects current project from working directory
2. Infers topic from recent files or conversation context
3. Selects appropriate emoji based on project type
4. Updates terminal title via shell script
5. Enforces topic change detection throughout conversation

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

## TodoWrite Conventions

Tasks should be granular (2-5 minutes each):

```javascript
{
  content: "Write the failing test",      // Imperative form
  status: "pending",                       // or "in_progress" or "completed"
  activeForm: "Writing the failing test"   // Present continuous form
}
```

**Task lifecycle:**
1. Create todos for all steps
2. Mark ONE task as in_progress
3. Complete the task
4. Mark as completed
5. Move to next task

**Never:**
- Batch complete multiple tasks
- Have multiple tasks in_progress
- Skip marking tasks completed

## Testing

Tests are located in `tests/integration/`:
- `terminal-title.test.md` - Tests auto-invocation and title updates

## Documentation

- [Design Document](docs/2025-11-14-terminal-title-skill-design.md)
- [Implementation Plan](docs/2025-11-14-terminal-title-implementation.md)

## Integration with Other Plugins

This plugin establishes conventions used across all 2389 plugins:

- **css-development**: Uses TodoWrite conventions for task tracking
- **firebase-development**: Uses TodoWrite conventions for task tracking
- **building-multiagent-systems**: Uses TodoWrite for implementation checklists
- **fresh-eyes-review**: Uses TodoWrite for review checklists
- **scenario-testing**: Uses TodoWrite for test scenario workflows
