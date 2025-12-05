# Terminal Title Plugin

Automatically updates terminal title with emoji + project + topic context.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install terminal-title@2389-research
```

## What This Plugin Provides

Automatic terminal title management:

- **Auto-invokes at session start**: Sets initial title based on project context
- **Updates on topic changes**: Reflects current work in terminal title
- **Emoji indicators**: Visual cues for quick context switching

## How It Works

The plugin includes a session start hook that automatically invokes the terminal-title skill. The skill:

1. Detects current project from working directory
2. Infers topic from recent files or conversation context
3. Selects appropriate emoji based on project type
4. Updates terminal title via shell script

## Example

```
🔥 firebase-app > authentication setup
```

## Optional: Install Workflows Plugin

For enhanced integration with 2389 conventions:
```bash
/plugin install workflows@2389-research
```

## Documentation

- [Design Document](docs/2025-11-14-terminal-title-skill-design.md)
- [Implementation Plan](docs/2025-11-14-terminal-title-implementation.md)

## License

Internal use only - 2389 Research
